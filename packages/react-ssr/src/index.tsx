import { IFunctionality, ILogicExtension } from '@honout/functionality';
import { Container, injectable } from '@honout/system';
import { join } from 'path';
import { build } from 'esbuild';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { runInNewContext } from 'vm';
import { ReactNode, Suspense } from 'react';
import { readdirSync, statSync } from 'fs';
import {
    Method,
    Route,
    IHttpRequestHandler,
    StreamResponse,
    IHttpResponse,
} from '@honout/http';
import { createServer } from 'http';
import React = require('react');

type StandardComponent = (props: any) => ReactNode;
type AsyncComponent = (props: any) => Promise<ReactNode>;

// type ITree = {
//     [key: string]: HonoutComponent | ITree;
// };

@injectable()
export class HonoutReactSSR
    implements IFunctionality<null, null, { path: string }>
{
    private path: string;

    onLogicExtensions(
        extensions: ILogicExtension<null, null>[],
        container: Container
    ): void {
        // never
    }

    onConfigure(
        configuration: { path: string },
        container: Container
    ): void | Promise<void> {
        this.path = configuration.path;
    }

    bindInternals(container: Container): void | Promise<void> {
        // never
    }

    async start(container: Container): Promise<void> {
        // read all files in router recursively
        const componentTree = new ComponentTree();
        await componentTree.initialize(this.path);

        const result = await componentTree.render('/home/panel');

        //console.log(result);

        // for (const bundledComponent of bundledComponents) {
        //     const contents = await bundledComponent.render();
        //     const html = renderToString(contents);
        //     console.log(html);
        // }
    }
}

class ComponentTree {
    private bundledComponents: HonoutComponent[];

    async render(route: string) {
        const segments = `root${route}`.split('/');

        const ordered: HonoutComponent[] = [];

        const orderRecursively = async (currentSegments: string[]) => {
            if (currentSegments.length === 0) {
                return;
            }
            const match = this.bundledComponents.find((component) =>
                component
                    .getSegments()
                    .every(
                        (segment) =>
                            currentSegments.includes(segment) &&
                            component.getSegments().length ===
                                currentSegments.length
                    )
            );
            ordered.push(match);
            orderRecursively(
                currentSegments.filter((_, i) => i < currentSegments.length - 1)
            );
        };

        orderRecursively(segments);

        // const MapComponent = (honoutComponent: HonoutComponent) => {
        //     if (
        //         honoutComponent.Component.constructor.name === 'AsyncFunction'
        //     ) {
        //         const renderAsyncComponent = () => {
        //             let rendered;
        //             const promise = (
        //                 honoutComponent.Component({}) as Promise<ReactNode>
        //             ).then((result) => (rendered = result));

        //             return {
        //                 read() {
        //                     if (!rendered) {
        //                         throw promise;
        //                     }
        //                     return rendered;
        //                 },
        //             };
        //         };

        //         const asyncComponent = renderAsyncComponent();

        //         const AsyncWrapper = () => {
        //             const rendered = asyncComponent.read();
        //             return rendered;
        //         };

        //         return (props: { children?: ReactNode }) => {
        //             <Suspense fallback={<div>Loading</div>}>
        //                 <AsyncWrapper />
        //             </Suspense>;
        //         };
        //     } else {
        //         const ToRender = honoutComponent.Component as (props: {
        //             children?: ReactNode;
        //         }) => ReactNode;
        //         return (props: { children?: ReactNode }) => {
        //             return <ToRender children={props.children} />;
        //         };
        //     }
        // };
        ordered.reverse();
        const render = (index: number) => {
            if (!ordered[index]) {
                return null;
            }
            const Component = ordered[index].Component;
            if (Component.constructor.name === 'AsyncFunction') {
                const RenderableComponent = Component as AsyncComponent;
                const renderAsyncComponent = (props: any) => {
                    let rendered;
                    const promise = RenderableComponent(props).then(
                        (result) => (rendered = result)
                    );

                    return {
                        read() {
                            if (!rendered) {
                                throw promise;
                            }
                            return rendered;
                        },
                    };
                };

                const children = render(index + 1);

                const asyncComponent = renderAsyncComponent({});

                const AsyncWrapper = () => {
                    const rendered = asyncComponent.read();
                    return rendered;
                };

                const App = () => (
                    <Suspense fallback={<div>Loading</div>}>
                        <AsyncWrapper />
                        {children}
                    </Suspense>
                );
                //
                return <App></App>;
            } else {
                const Renderable = Component as StandardComponent;
                const children = render(index + 1);
                return <Renderable>{children}</Renderable>;
            }
        };
        const server = createServer((req, res) => {
            const { pipe } = renderToPipeableStream(
                <Suspense fallback={<div>Loading a</div>}>
                    {render(0)}
                </Suspense>,
                {
                    onShellReady() {
                        res.setHeader('content-type', 'text/html');
                        pipe(res);
                    },
                }
            );
        });

        server.listen(5000, console.log);

        /*
            <Root>
                <Suspense>
                    <Home>
                        <Suspense>
                            <Panel />
                        </Suspense>
                    </Home>
                </Suspense>
            </Root>
        */

        // if (ordered[2].getComponent().constructor.name === 'AsyncFunction') {
        //     // Wrap with suspense
        //     console.log('Async');
        // } else {
        //     console.log('Normal');
        // }

        // console.log('incoming', ordered);
        // console.log(
        //     'bundled',
        //     this.bundledComponents.map((b) => b.getSegments())
        // );

        // Must start with root
        // /home

        // const renderRecursively = async (
        //     currentSegment: string,
        //     children?: ReactNode
        // ) => {
        //     const match = this.bundledComponents.find(
        //         (c) => c.getSegment() === currentSegment
        //     );
        //     const reactNode = await match.render(renderToString(children));
        //     const nextSegment = currentSegment.replace(match.getSegment(), '');
        //     await renderRecursively(nextSegment, reactNode);
        // };

        // return renderRecursively(route);
        /*
            /home
        */
    }

    async initialize(routerPath: string) {
        this.bundledComponents = await Promise.all(
            this.getAllFiles(routerPath)
                .map((p) => p.replace(routerPath, ''))
                .filter((p) => p.includes('index.'))
                .map((p) => new HonoutComponent().bundle(routerPath, p))
        );
    }

    private getAllFiles = (path: string): string[] => {
        return readdirSync(path).reduce((files, file) => {
            const name = join(path, file);
            const isDirectory = statSync(name).isDirectory();
            return isDirectory
                ? [...files, ...this.getAllFiles(name)]
                : [...files, name];
        }, []);
    };
}

class HonoutComponent {
    public Component: (props: {
        children?: ReactNode;
    }) => ReactNode | Promise<ReactNode>;
    private segments: string[];

    async bundle(routerPath: string, componentPath: string) {
        this.segments = `root${componentPath}`
            .split('/')
            .filter((p) => p !== 'index.tsx');
        const { outputFiles } = await build({
            entryPoints: [`${routerPath}${componentPath}`],
            bundle: true,
            write: false,
            outdir: '/dist',
            platform: 'node',
            format: 'cjs',
            loader: {
                '.tsx': 'tsx',
                '.ts': 'ts',
            },
        });

        if (outputFiles.length > 1) {
            throw new Error('Detected multiple output files');
        }

        const module = { exports: {} };

        runInNewContext(outputFiles[0].text, {
            module,
            exports: module.exports,
            require,
            setTimeout: setTimeout, // Pass global variables
            process: process, // Pass global variables
        });

        this.Component = (module.exports as any).default;

        return this;
    }

    getSegments() {
        return this.segments;
    }
}

class ServerComponent {
    private Component: AsyncComponent;

    async bundle(routerPath: string, componentPath: string) {
        const { outputFiles } = await build({
            entryPoints: [`${routerPath}${componentPath}`],
            bundle: true,
            write: false,
            outdir: '/dist',
            platform: 'node',
            format: 'cjs',
            loader: {
                '.tsx': 'tsx',
                '.ts': 'ts',
            },
        });

        if (outputFiles.length > 1) {
            throw new Error('Detected multiple output files');
        }

        const module = { exports: {} };

        runInNewContext(outputFiles[0].text, {
            module,
            exports: module.exports,
            require,
            setTimeout: setTimeout, // Pass global variables
            process: process, // Pass global variables
        });

        this.Component = (module.exports as any).default as AsyncComponent;

        return this;
    }

    render(next: () => ReactNode) {
        const AsyncRenderer = () => {
            let content: JSX.Element | undefined;
            // Only pass children for the root layout
            const renderingPromise = this.Component({});
            return {
                read() {
                    if (!content) {
                        throw renderingPromise;
                    }
                    return content;
                },
            };
        };

        const asyncComponent = AsyncRenderer();

        const AsyncWrapper = () => {
            const rendered = asyncComponent.read();
            return rendered;
        };

        return (
            <Suspense fallback={<div>Loading</div>}>
                <AsyncWrapper />
                {next()}
            </Suspense>
        );
    }
}
