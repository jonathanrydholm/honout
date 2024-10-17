import { IFunctionality, ILogicExtension } from '@honout/functionality';
import { Container, injectable } from '@honout/system';
import { join } from 'path';
import { build } from 'esbuild';
import { renderToPipeableStream } from 'react-dom/server';
import { createContext, runInNewContext } from 'vm';
import React from 'react';
import { createServer } from 'http';
import asyncLocalStorage from '@honout/test-react';
import { hydrateRoot } from 'react-dom/client';
import EventEmitter from 'events';

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
    constructor(private routerPath: string) {}

    async render(route: string) {
        const { outputFiles } = await build({
            entryPoints: [join(this.routerPath, 'App.tsx')],
            bundle: true,
            write: false,
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

        const context = createContext(globalThis);

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
                    default: {
                        return require(path);
                    }
                }
            },
            ...context,
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

            const emitter = new EventEmitter();

            emitter.on('set_store', ([id, serializedData]) => {
                res.write(
                    `<script type="application/json" id="${id}">${JSON.stringify(serializedData)}</script>`
                );
            });

            const requestStore: {
                store: Record<string, unknown>;
                emitter: EventEmitter;
            } = {
                store: {},
                emitter,
            };

            asyncLocalStorage.run(requestStore, () => {
                const { pipe } = renderToPipeableStream(
                    <html lang="en">
                        <head>
                            <meta charSet="utf-8" />
                            <meta
                                name="viewport"
                                content="width=device-width"
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
                            <meta
                                name="description"
                                content="experimental react ssr"
                            ></meta>
                            <title>Some title</title>
                        </head>
                        <body>
                            <div id="root">
                                <App />
                            </div>
                        </body>
                    </html>,
                    {
                        bootstrapScripts: [],
                        onShellReady() {
                            pipe(res);
                            res.write(
                                `<script>${clientOutputFiles[0].text}</script>`
                            );
                        },
                    }
                );
            });
        });

        server2.listen(4000, console.log);
    }
}
