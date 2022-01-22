import * as vscode from "vscode";
import { PreviewBackend } from './previewBackend';
import ExtensionResource from "../resource/extensionResource";
import Uri from '../util/uri';
import { PreviewDocument } from "./previewDocument";

export default class PreviewView {

    static async create(context: vscode.ExtensionContext): Promise<PreviewView> {
        const resource = new ExtensionResource(context);
        const panel = vscode.window.createWebviewPanel(
            'zenn-editor.preview',
            'Zenn Editor Preview',
            {
                viewColumn: vscode.ViewColumn.Two,
                preserveFocus: true,
            },
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(context.extensionPath)],
            }
        );
        context.subscriptions.push(panel);

        return new PreviewView(panel, resource);
    }


    private readonly webviewPanel: vscode.WebviewPanel;

    private readonly previewBackends: Map<string, PreviewBackend> = new Map();

    private currentBackend: PreviewBackend | undefined;

    private readonly resource: ExtensionResource;

    private disposables: vscode.Disposable[] = [];

    private constructor(webviewPanel: vscode.WebviewPanel, resource: ExtensionResource) {
        this.resource = resource;
        this.webviewPanel = webviewPanel;
        this.disposables.push(
            this.webviewPanel.webview.onDidReceiveMessage(this.receiveWebviewMessage),
        );
        this.webviewPanel.onDidDispose(() => {
            this.disposables.forEach(d => d.dispose());
        });
    }

    private receiveWebviewMessage(message: any): void {
        switch (message.command) {
            case 'open-link':
                vscode.env.openExternal(vscode.Uri.parse(message.link));
                break;
            default:
                console.log('unhandled message', message);
        }
    }

    private webviewLoadingHtml(): string {
        return `
            <html>
                <head>
                    <style>
                        html {
                            background-color: #FFF;
                        }
                        span {
                            color: #666;
                        }
                    </style>
                </head>
                <body><span>Loading...</span></body>
            </html>
        `;
    }

    private webviewHtml(previewBackend: PreviewBackend): string {
        return `
            <html>
                <head>
                    <script src="${this.resource.uri('dist', 'webview.js')}"></script>
                </head>
                <body>
                    <div>
                        <iframe id="zenn-proxy" src="${previewBackend.entrypointUrl()}" width="100%" height="100%" seamless frameborder=0></iframe>
                    </div>
                </body>
            </html>
        `;
    }

    public async changePreviewDocument(textDocument: vscode.TextDocument): Promise<void> {
        if (textDocument.languageId === 'markdown') {
            const document = Uri.of(textDocument.uri);
            const workspace = document.workspaceDirectory();
            if (workspace) {
                if (!(this.currentBackend && this.currentBackend.isProvide(document))) {
                    await this.open(document);
                }
                const documentRelativePath = PreviewDocument.create(workspace, document).urlPath();
                this.webviewPanel.webview.postMessage({ command: 'change_path', relativePath: documentRelativePath });
            }
        }
    }

    public async open(uri: Uri): Promise<void> {
        const workspace = uri.workspaceDirectory();
        if (workspace) {
            const key = workspace.fsPath();
            const backend = this.previewBackends.get(key);
            if (backend) {
                this.currentBackend = backend;
                this.webviewPanel.webview.html = this.webviewHtml(backend);
            } else {
                this.webviewPanel.webview.html = this.webviewLoadingHtml();
                const document = PreviewDocument.create(workspace, uri);
                const newBackend = await PreviewBackend.start(document, this.resource);
                this.previewBackends.set(key, newBackend);
                this.webviewPanel.onDidDispose(() => newBackend.stop());
                this.currentBackend = newBackend;
                this.webviewPanel.webview.html = this.webviewHtml(newBackend);
            }
        }
    }

    public onDidClose(listener: () => void): void {
        this.webviewPanel.onDidDispose(listener);
    }

    public reveal(): void {
        this.webviewPanel.reveal();
    }
}
