import * as http from 'http';
import * as httpProxy from 'http-proxy';
import ExtensionResource from '../resource/extensionResource';
import * as fs from 'fs';

export class ZennPreviewProxyServer {

    public static INDEX_PATH = '__vscode_zenn_editor_preview_proxy_index'

    public static start(host: string, port: number, backendPort: number, iframeEntrypointPath: string, resource: ExtensionResource): Promise<ZennPreviewProxyServer> {
        return new Promise((resolve, reject) => {
            const proxy = httpProxy.createProxyServer({
                target: {
                    host: host,
                    port: backendPort,
                },
                ws: true,
            });
            const proxyServer = http.createServer((req, res) => {
                const indexPathPrefix = `/${ZennPreviewProxyServer.INDEX_PATH}/`
                if (req.url && req.url.startsWith(indexPathPrefix)) {
                    const path = req.url.substr(indexPathPrefix.length);
                    switch (path) {
                        case 'proxyView.js':
                            fs.readFile(resource.uri('dist', 'proxyView.js').fsPath, (error, content) => {
                                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                                res.end(content);
                            });
                            break;
                        default:
                            res.end(this.handleProxyIndex(iframeEntrypointPath));
                    }
                } else {
                    proxy.web(req, res);
                }
            });

            const timeout = setTimeout(() => {
                try {
                    proxyServer.close();
                } finally {
                    reject(new Error("starting proxy server timeout"));
                }
            }, 10000 /*ms*/);
            
            proxyServer.on('upgrade', (req, socket, head) => {
                proxy.ws(req, socket, head);
            });
            proxyServer.on('listening', () => {
                console.log(`Local proxy server started on http://${host}:${port}`);
                clearTimeout(timeout);
                resolve(new ZennPreviewProxyServer(host, port, backendPort, iframeEntrypointPath, proxyServer));
            });
            proxyServer.listen(port);
        });
    }

    private static handleProxyIndex(iframeRelativePath: string): string {
        return `
            <html>
                <head>
                    <script src="/${ZennPreviewProxyServer.INDEX_PATH}/proxyView.js"></script>
                </head>
                <body>
                    <div>
                        <iframe id="zenn" src="/${iframeRelativePath}" width="100%" height="100%" seamless frameborder=0></iframe>
                    </div>
                </body>
            </html>
        `
    }

    readonly host: string;

    readonly port: number;

    readonly backendPort: number;

    readonly iframeEntrypointPath: string;

    private readonly server: http.Server;

    private constructor(host: string, port: number, backendPort: number, iframeEntrypointPath: string, server: http.Server) {
        this.host = host;
        this.port = port;
        this.backendPort = backendPort;
        this.iframeEntrypointPath = iframeEntrypointPath;
        this.server = server;
    }

    public entrypointUrl(): string {
        return `http://${this.host}:${this.port}/${ZennPreviewProxyServer.INDEX_PATH}/${this.iframeEntrypointPath}`
    }

    public stop(): void {
        this.currentServer().close();
    }

    private currentServer(): http.Server {
        if (this.server) {
            return this.server;
        } else {
            throw new Error("Server has not started")
        }
    }
}
