import { IFunctionality, ILogicExtension } from '@honout/functionality';
import { Container, injectable } from '@honout/system';
import { join } from 'path';
import { build } from 'esbuild';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { createContext, Module, runInNewContext, Script } from 'vm';
import React, { ReactNode, Suspense } from 'react';
import { createServer } from 'http';
import { access, readdir, stat, writeFile } from 'fs/promises';
import asyncLocalStorage from '@honout/test-react';
import { hydrateRoot } from 'react-dom/client';

type StandardComponent = (props: any) => ReactNode;
type AsyncComponent = (props: any) => Promise<ReactNode>;

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
        if (configuration.path.endsWith('/')) {
            this.path = configuration.path.slice(0, -1);
        } else {
            this.path = configuration.path;
        }
    }

    bindInternals(container: Container): void | Promise<void> {
        // never
    }

    async start(container: Container): Promise<void> {
        // read all files in router recursively
        const componentTree = new ComponentTree(this.path);
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

    private templates: Template[] = [];

    constructor(private routerPath: string) {}

    async render(route: string) {
        const { outputFiles } = await build({
            entryPoints: [join(this.routerPath, 'App.tsx')],
            bundle: true,
            write: false,
            minify: true,
            outdir: '/',
            jsx: 'transform',

            jsxImportSource: '@honout/jsx-transpiler',
            platform: 'node',
            format: 'cjs',
            external: ['@honout/test-react', 'react', 'react-dom'],
            loader: {
                '.tsx': 'tsx',
                '.ts': 'ts',
            },
        });

        const { outputFiles: clientOutputFiles } = await build({
            stdin: {
                contents: `
                    import { hydrateRoot } from 'react-dom/client';
                    import App from './App';

                    const app = document.getElementById('root');

                    hydrateRoot(app, <App />);
                `,
                resolveDir: this.routerPath,
                loader: 'tsx',
            },
            bundle: true,
            write: false,
            minify: true,
            outdir: '/',
            jsx: 'automatic',
            jsxImportSource: '@honout/jsx-transpiler',
            platform: 'browser',
            format: 'esm',
            external: ['@honout/test-react'],
            loader: {
                '.tsx': 'tsx',
                '.ts': 'ts',
            },
        });
        const module = { exports: {} };

        const reactJsxRuntime = require('react/jsx-runtime');
        const honoutJsxRuntime = require('@honout/jsx-transpiler');

        runInNewContext(outputFiles[0].text, {
            module,
            exports: module.exports,
            require: (path) => {
                switch (path) {
                    case 'react':
                        return React;
                    case 'react-dom/client':
                        return { hydrateRoot };
                    case 'react/jsx-runtime':
                        return reactJsxRuntime;
                    case '@honout/jsx-transpiler':
                        return honoutJsxRuntime;
                    case '@honout/test-react':
                        return { default: asyncLocalStorage };
                }
            },
            setTimeout: setTimeout,
            process: process,
            fetch: fetch,
            console: console,
        });
        const App = (module.exports as any).default;

        const server2 = createServer((req, res) => {
            if (req.url.includes('hydrate.js')) {
                return res.end(clientOutputFiles[0].text);
            }

            if (req.url.includes('.') && !req.url.endsWith('.js')) {
                res.statusCode = 404;
                return res.end('Not found');
            }
            //
            const requestStore: Record<string, unknown> = {};

            asyncLocalStorage.run(requestStore, () => {
                const { pipe } = renderToPipeableStream(
                    <html lang="en">
                        <head>
                            <meta charSet="utf-8" />
                            <meta
                                name="viewport"
                                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
                            />
                            <meta
                                httpEquiv="cache-control"
                                content="max-age=0"
                            />
                            <meta
                                httpEquiv="cache-control"
                                content="no-cache"
                            />
                            <meta httpEquiv="expires" content="0" />
                            <meta
                                httpEquiv="expires"
                                content="Tue, 01 Jan 1980 1:00:00 GMT"
                            />
                            <meta httpEquiv="pragma" content="no-cache" />
                            <title>Some title</title>
                        </head>
                        <body>
                            <div id="root">
                                <App />
                            </div>
                        </body>
                    </html>,
                    {
                        onShellReady() {
                            pipe(res);
                        },
                        onAllReady() {
                            res.write(
                                `<script>window.serialized_rsc = JSON.parse(decodeURIComponent(escape(atob("${btoa(unescape(encodeURIComponent(JSON.stringify(asyncLocalStorage.getStore()))))}"))))</script>
                                <script>${clientOutputFiles[0].text}</script>
                                `
                            );
                        },
                    }
                );
            });
        });
        //
        server2.listen(4000, console.log);
    }

    private async scanDirectory(directoryPath: string, segments: string[]) {
        const filesAndDirectories = await readdir(directoryPath);
        for (const subPath of filesAndDirectories) {
            const joinedPath = join(directoryPath, subPath);
            const entity = await stat(joinedPath);
            if (entity.isDirectory()) {
                await this.scanDirectory(joinedPath, [...segments, subPath]);
            } else {
                const [fileType] = subPath.split('.');

                switch (fileType) {
                    case 'template': {
                        const template = await new Template(
                            this.routerPath,
                            segments
                        ).bundle();
                        this.templates.push(template);
                        break;
                    }
                }
            }
        }
    }

    async initialize(routerPath: string) {
        await this.scanDirectory(routerPath, []);
        //
        // this.bundledComponents = await Promise.all(
        //     this.getAllFiles(routerPath)
        //         .map((p) => p.replace(routerPath, ''))
        //         .filter((p) => p.includes('index.'))
        //         .map((p) => new HonoutComponent().bundle(routerPath, p))
        // );
    }

    // private getAllFiles = (path: string): string[] => {
    //     return readdirSync(path).reduce((files, file) => {
    //         const name = join(path, file);
    //         const isDirectory = statSync(name).isDirectory();
    //         return isDirectory
    //             ? [...files, ...this.getAllFiles(name)]
    //             : [...files, name];
    //     }, []);
    // };
}

class Template {
    private TemplateComponent?: ITemplateComponentType;
    private PageComponent?: IPageComponentType;
    private LoadingComponent?: ILoadingComponentType;

    constructor(
        private routerPath: string,
        private segments: string[]
    ) {}

    private async fileExists(path: string) {
        try {
            await access(path);
            return true;
        } catch {
            return false;
        }
    }

    async bundle() {
        const loadingPath = join(
            this.routerPath,
            ...this.segments,
            'loading.tsx'
        );
        const pagePath = join(this.routerPath, ...this.segments, 'page.tsx');
        const templatePath = join(
            this.routerPath,
            ...this.segments,
            'template.tsx'
        );
        const loadingExists = await this.fileExists(loadingPath);
        const templateExists = await this.fileExists(templatePath);
        const pageExists = await this.fileExists(pagePath);

        const { outputFiles } = await build({
            entryPoints: [
                join(this.routerPath, ...this.segments, 'template.tsx'),
                ...(loadingExists ? [loadingPath] : []),
                ...(templateExists ? [templatePath] : []),
                ...(pageExists ? [pagePath] : []),
            ],
            bundle: true,
            write: false,
            outdir: '/',
            jsx: 'transform',
            jsxImportSource: '@honout/jsx-transpiler',
            platform: 'node',
            format: 'cjs',
            loader: {
                '.tsx': 'tsx',
                '.ts': 'ts',
            },
        });

        const templateFile = outputFiles.find((f) =>
            f.path.endsWith('template.js')
        );
        const loadingFile = outputFiles.find((f) =>
            f.path.endsWith('loading.js')
        );
        const pageFile = outputFiles.find((f) => f.path.endsWith('page.js'));

        if (pageFile) {
            this.PageComponent = this.generateRepresentation(pageFile.text);
        }

        if (templateFile) {
            this.TemplateComponent = this.generateRepresentation(
                templateFile.text
            );
        }

        if (loadingFile) {
            this.LoadingComponent = this.generateRepresentation(
                loadingFile.text
            );
        }

        return this;
    }

    render(props: ITemplateComponentProps) {
        // TODO, render page

        if (this.TemplateComponent) {
            return this.renderTemplate(
                props,
                this.PageComponent ? this.renderOnlyPage() : undefined
            );
        } else if (this.PageComponent && !this.TemplateComponent) {
            return this.renderOnlyPage();
        } else {
            return <></>;
        }
    }

    private renderOnlyPage() {
        if (this.PageComponent.constructor.name === 'AsyncFunction') {
            const suspendedComponent = (() => {
                let rendered;
                const promise = (
                    this.PageComponent as IAsyncPageComponentType
                )().then((result) => (rendered = result));

                return {
                    read() {
                        if (!rendered) {
                            throw promise;
                        }
                        return rendered;
                    },
                };
            })();
            const AsyncWrapper = () => suspendedComponent.read();

            return (
                <Suspense
                    fallback={
                        this.LoadingComponent ? (
                            this.LoadingComponent()
                        ) : (
                            <div>Loading page</div>
                        )
                    }
                >
                    <AsyncWrapper />
                </Suspense>
            );
        } else {
            const SynchroniousComponent = this
                .PageComponent as ISyncPageComponentType;
            return <SynchroniousComponent />;
        }
    }

    private renderTemplate(props: ITemplateComponentProps, page?: JSX.Element) {
        if (this.TemplateComponent.constructor.name === 'AsyncFunction') {
            const suspendedComponent = (() => {
                let rendered;
                const promise = (
                    this.TemplateComponent as IAsyncTemplateComponentType
                )({
                    children: (
                        <>
                            {props.children}
                            {page && page}
                        </>
                    ),
                }).then((result) => (rendered = result));

                return {
                    read() {
                        if (!rendered) {
                            throw promise;
                        }
                        return rendered;
                    },
                };
            })();
            const AsyncWrapper = () => suspendedComponent.read();

            return (
                <Suspense
                    fallback={
                        this.LoadingComponent ? (
                            this.LoadingComponent()
                        ) : (
                            <div>Loading template</div>
                        )
                    }
                >
                    <AsyncWrapper />
                </Suspense>
            );
        } else {
            const SynchroniousComponent = this
                .TemplateComponent as ISyncTemplateComponentType;
            return (
                <SynchroniousComponent
                    children={
                        <>
                            {props.children}
                            {page && page}
                        </>
                    }
                />
            );
        }
    }

    private generateRepresentation<TReturnType>(code: string): TReturnType {
        const module = { exports: {} };

        runInNewContext(code, {
            module,
            exports: module.exports,
            require,
            setTimeout: setTimeout,
            process: process,
        });

        return (module.exports as any).default;
    }

    segmentMatched(segments: string[]) {
        if (this.segments.length === 0) {
            return true;
        }

        return this.segments.every((segment) => segments.includes(segment));
    }

    getSegments() {
        return this.segments;
    }

    isRoot() {
        return this.segments.length === 0;
    }
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

interface ITemplateComponentProps {
    children: ReactNode | ReactNode[];
}
type ITemplateComponentType = (
    props: ITemplateComponentProps
) => ReactNode | Promise<ReactNode>;

type IAsyncTemplateComponentType = (
    props: ITemplateComponentProps
) => Promise<ReactNode>;

type ISyncTemplateComponentType = (props: ITemplateComponentProps) => ReactNode;

type ILoadingComponentType = () => ReactNode;

type IPageComponentType = () => ReactNode | Promise<ReactNode>;
type IAsyncPageComponentType = () => Promise<ReactNode>;
type ISyncPageComponentType = () => ReactNode;
