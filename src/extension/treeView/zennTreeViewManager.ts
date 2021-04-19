import * as vscode from "vscode";
import { ZennTreeViewProvider } from "./zennTreeViewProvider";
import { ZennTreeItem } from "./zennTreeItem";
import Uri from "../util/uri";
import ExtensionResource from "../resource/extensionResource";

export class ZennTeeViewManager {

    public static create(): ZennTeeViewManager {
        return new ZennTeeViewManager();
    }

    private constructor() {}

    private treeView: vscode.TreeView<ZennTreeItem> | undefined;

    private treeViewProvider: ZennTreeViewProvider | undefined;

    public openTreeView(context: vscode.ExtensionContext): vscode.TreeView<ZennTreeItem> {
        if (this.treeView) {
            return this.treeView;
        } else {
            this.treeViewProvider = new ZennTreeViewProvider(new ExtensionResource(context));
            this.treeView = vscode.window.createTreeView('zenn', {
                treeDataProvider: this.treeViewProvider,
            });
            vscode.window.onDidChangeActiveTextEditor(async event => {
                if (event && this.treeViewProvider) {
                    const uri = Uri.of(event.document.uri);
                    this.selectItem(uri, /*attemptLimit*/1);
                }
            });
            if (vscode.window.activeTextEditor) {
                const uri = Uri.of(vscode.window.activeTextEditor.document.uri);
                this.selectItem(uri);
            }
            return this.treeView;
        }
    }

    public refresh(uri?: Uri): void {
        if (this.treeViewProvider) {
            this.treeViewProvider.refresh(uri);
        }
    }

    private async selectItem(uri: Uri, attemptLimit = 10): Promise<void> {
        return new Promise<void>((resolve) => this.innerSelectItem(uri, resolve, attemptLimit));
    }

    private async innerSelectItem(uri: Uri, resolve: () => void, remain: number): Promise<void> {
        if (remain === 0) {
            resolve();
        } else {
            if (this.treeViewProvider && this.treeView) {
                const item = await this.treeViewProvider.findItem(uri);
                if (item) {
                    this.treeView.reveal(item, {
                        select: true,
                        focus: false,
                        expand: true,
                    });
                    resolve();
                } else {
                    setTimeout(() => this.innerSelectItem(uri, resolve, remain - 1), 100/*ms*/);
                }
            } else {
                resolve();
            }
        }
    }
}
