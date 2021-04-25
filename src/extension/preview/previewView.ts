import * as vscode from "vscode";
import * as getPort from 'get-port';
import ZennPreview from "../zenncli/zennPreview";
import { ZennPreviewProxyServer } from "../zenncli/zennPreviewProxyServer";
import ExtensionResource from "../resource/extensionResource";
import { ZennCli } from "../zenncli/zennCli";
import Uri from '../util/uri';

export default class PreviewView {

    static async open(uri: Uri, context: vscode.ExtensionContext): Promise<PreviewView> {
        const resource = new ExtensionResource(context);

        const workingDirectoryUri =
            vscode.workspace.getWorkspaceFolder(uri.underlying)?.uri;

        if (workingDirectoryUri) {
            const wdUri = Uri.of(workingDirectoryUri);
            const port = await getPort();
            const backendPort = await getPort();

            const documentRelativePath =
                this.resolveDocuemntRelativePath(uri, wdUri);
            const zennCli = await ZennCli.create(wdUri);
            const zennPreview = zennCli.preview(backendPort);
            const zennPreviewProxyServer =
                ZennPreviewProxyServer.start(zennPreview.host, port, backendPort, documentRelativePath, resource);

            const panel = vscode.window.createWebviewPanel(
                'zenn-editor.preview',
                'Zenn Editor Preview',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(context.extensionPath)],
                }
            );
            context.subscriptions.push(panel);

            return new PreviewView(panel, zennPreview, zennPreviewProxyServer, resource);
        } else {
            const message = `ドキュメントのワークスペースが見つかりません: ${uri.fsPath}`;
            vscode.window.showErrorMessage(message)
            return Promise.reject(message);
        }
    }


    private readonly webviewPanel: vscode.WebviewPanel;

    private readonly zennPreview: ZennPreview;

    private readonly zennPreviewProxyServer: ZennPreviewProxyServer;

    private readonly resource: ExtensionResource;

    private constructor(webviewPanel: vscode.WebviewPanel, zennCliPreview: ZennPreview, localProxyServer: ZennPreviewProxyServer, resource: ExtensionResource) {
        this.zennPreview = zennCliPreview;
        this.zennPreviewProxyServer = localProxyServer;
        this.resource = resource;
        this.webviewPanel = webviewPanel;
        this.webviewPanel.webview.html = this.webviewHtml();
        this.webviewPanel.webview.onDidReceiveMessage(this.receiveWebviewMessage);
        this.webviewPanel.onDidDispose(() => {
            this.zennPreview.close();
            this.zennPreviewProxyServer.stop();
        });
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                this.handleDidChangeActiveTextEditor(editor)
            }
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

    private static resolveDocuemntRelativePath(documentUri: Uri, cwdUri: Uri): string {
        return documentUri.relativePathFrom(cwdUri).replace(/\.(md|md\.git)$/, "");
    }

    private webviewHtml(): string {
        return `
            <html>
                <head>
                    <script src="${this.resource.uri('dist', 'webview.js')}"></script>
                </head>
                <body>
                    <div>
                        <iframe id="zenn-proxy" src="${this.zennPreviewProxyServer.entrypointUrl()}" width="100%" height="100%" seamless frameborder=0></iframe>
                    </div>
                </body>
            </html>
        `;
    }

    private handleDidChangeActiveTextEditor(textEditor: vscode.TextEditor) {
        if (textEditor.document.languageId === 'markdown') {
            const documentRelativePath = PreviewView.resolveDocuemntRelativePath(Uri.of(textEditor.document.uri), this.zennPreview.workingDirectory);
            console.log("change path: " + documentRelativePath);
            this.webviewPanel.webview.postMessage({ command: 'change_path', relativePath: documentRelativePath });
        }
    }

    public onDidClose(listener: () => void): void {
        this.webviewPanel.onDidDispose(listener);
    }

    public reveal(): void {
        this.webviewPanel.reveal();
    }
}
