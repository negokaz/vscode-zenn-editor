import ZennPreview from "../zenncli/zennPreview";
import * as vscode from 'vscode';
import { ZennPreviewProxyServer } from "../zenncli/zennPreviewProxyServer";
import Uri from '../util/uri';
import * as getPort from 'get-port';
import { ZennCli } from "../zenncli/zennCli";
import ExtensionResource from "../resource/extensionResource";
import { PreviewDocument } from "./previewDocument";

export class PreviewBackend {

    public static async start(document: PreviewDocument, resource: ExtensionResource) {
        const workspace = document.uri().workspaceDirectory();
        if (workspace) {
            const documentRelativePath = document.urlPath();
            const host = 'localhost';
            const port = await getPort();
            const backendPort = await getPort();
            const zennCli = await ZennCli.create(workspace);
            const zennPreview = zennCli.preview(backendPort);
            const zennPreviewProxyServer =
                ZennPreviewProxyServer.start(host, port, backendPort, documentRelativePath, resource);
            return new PreviewBackend(workspace, await zennPreview, await zennPreviewProxyServer);
        } else {
            const message = `ドキュメントのワークスペースが見つかりません: ${document.uri().fsPath}`;
            vscode.window.showErrorMessage(message)
            return Promise.reject(message);
        }
    }

    public readonly workspace: Uri;

    private readonly zennPreview: ZennPreview;

    private readonly zennPreviewProxyServer: ZennPreviewProxyServer;

    private constructor(workspace: Uri, zennPreview: ZennPreview, zennPreviewProxyServer: ZennPreviewProxyServer) {
        this.workspace = workspace;
        this.zennPreview = zennPreview;
        this.zennPreviewProxyServer = zennPreviewProxyServer;
    }

    public isProvide(uri: Uri): boolean {
        return uri.contains(this.workspace);
    }

    public entrypointUrl(): string {
        return this.zennPreviewProxyServer.entrypointUrl();
    }

    public stop(): void {
        this.zennPreview.close();
        this.zennPreviewProxyServer.stop();
    }
}
