import * as vscode from "vscode";
import { ZennTreeViewProvider } from "./zennTreeViewProvider";
import { ZennTreeItem } from "./zennTreeItem";
import Uri from "../util/uri";
import ExtensionResource from "../resource/extensionResource";
import { ZennWorkspace } from '../util/zennWorkspace';

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
            this.treeView.onDidExpandElement(e => {
                e.element.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
            });
            this.treeView.onDidCollapseElement(e => {
                e.element.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            });
            this.treeView.onDidChangeVisibility(e => {
                if (e.visible && vscode.window.activeTextEditor) {
                    const uri = Uri.of(vscode.window.activeTextEditor.document.uri);
                    this.selectItem(uri);
                }
            });
            if (vscode.window.activeTextEditor) {
                const uri = Uri.of(vscode.window.activeTextEditor.document.uri);
                this.selectItem(uri);
            }
            return this.treeView;
        }
    }

    public async refresh(uri?: Uri): Promise<void> {
        if (this.treeViewProvider) {
            return this.treeViewProvider.refresh(uri);
        } else {
            return Promise.resolve();
        }
    }

    public async selectItem(uri: Uri, attemptLimit = 10): Promise<ZennTreeItem | undefined> {
        return new Promise<ZennTreeItem | undefined>((resolve) => this.innerSelectItem(uri, resolve, attemptLimit));
    }

    private async innerSelectItem(uri: Uri, resolve: (value: ZennTreeItem | undefined) => void, remain: number): Promise<void> {
        if (remain === 0) {
            resolve(undefined);
        } else {
            if (this.treeViewProvider && this.treeView) {
                const item = await this.treeViewProvider.findItem(uri);
                if (item) {
                    if (this.treeView.visible) {
                        this.treeView.reveal(item, {
                            select: true,
                            focus: false,
                            expand: true,
                        });
                    }
                    resolve(item);
                } else {
                    setTimeout(() => this.innerSelectItem(uri, resolve, remain - 1), 100/*ms*/);
                }
            } else {
                resolve(undefined);
            }
        }
    }

    public async activeWorkspace(): Promise<ZennWorkspace> {
        if (this.treeView) {
            if (this.treeView.selection.length > 0) {
                const selection = this.treeView.selection[0];
                const uri = selection.uri.workspaceDirectory();
                if (uri) {
                    return (await ZennWorkspace.resolveWorkspace(uri))[0];
                }
            }
        }
        return ZennWorkspace.findActiveWorkspace();
    }
}
