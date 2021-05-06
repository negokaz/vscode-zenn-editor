import ZennPreview from "../zenncli/zennPreview";
import * as vscode from 'vscode';
import { ZennPreviewProxyServer } from "../zenncli/zennPreviewProxyServer";
import Uri from '../util/uri';
import * as getPort from 'get-port';
import { ZennCli } from "../zenncli/zennCli";
import ExtensionResource from "../resource/extensionResource";

export class PreviewBackend {

    public static async start(document: Uri, resource: ExtensionResource) {
        const workspace = document.workspaceDirectory();
        if (workspace) {
            const documentRelativePath = this.resolveDocuemntRelativePath(document, workspace);
            const port = await getPort();
            const backendPort = await getPort();
            const zennCli = await ZennCli.create(workspace);
            const zennPreview = await zennCli.preview(backendPort);
            const zennPreviewProxyServer =
                await ZennPreviewProxyServer.start(zennPreview.host, port, backendPort, documentRelativePath, resource);
            return new PreviewBackend(workspace, zennPreview, zennPreviewProxyServer);
        } else {
            const message = `ドキュメントのワークスペースが見つかりません: ${document.fsPath}`;
            vscode.window.showErrorMessage(message)
            return Promise.reject(message);
        }
    }

    private static resolveDocuemntRelativePath(documentUri: Uri, cwdUri: Uri): string {
        return documentUri.relativePathFrom(cwdUri).replace(/\.(md|md\.git)$/, "");
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
