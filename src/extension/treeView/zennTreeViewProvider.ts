import * as vscode from 'vscode';
import ExtensionResource from '../resource/extensionResource';
import Uri from '../util/uri';
import { Workspace } from './workspace';
import { ZennTreeItem } from './zennTreeItem';
import { ZennWorkspace } from '../util/zennWorkspace';

// [Tree View API | Visual Studio Code Extension API](https://code.visualstudio.com/api/extension-guides/tree-view)
export class ZennTreeViewProvider implements vscode.TreeDataProvider<ZennTreeItem> {

    private readonly resources: ExtensionResource;

    private _onDidChangeTreeData: vscode.EventEmitter<ZennTreeItem | undefined> =
        new vscode.EventEmitter<ZennTreeItem | undefined>();

    readonly onDidChangeTreeData: vscode.Event<ZennTreeItem | undefined> = this._onDidChangeTreeData.event;

    private workspaces: Promise<ZennWorkspace[]>;

    private rootItems: Promise<ZennTreeItem[]>;

    constructor(resources: ExtensionResource) {
        this.resources = resources;
        this.workspaces = ZennWorkspace.findWorkspaces();
        this.rootItems = this.loadRootItems();
    }

    public async refresh(uri?: Uri): Promise<void> {
        if (uri) {
            const item = await this.findClosestItem(uri);
            this._onDidChangeTreeData.fire(item?.itemNeedToReload());
        } else {
            this._onDidChangeTreeData.fire(undefined);
        }
    }

    async getTreeItem(element: ZennTreeItem): Promise<vscode.TreeItem> {
        // 開閉状態を維持する
        const currentCollapsibleState = element.collapsibleState;
        const reloadedElement = await element.reload();
        reloadedElement.collapsibleState = currentCollapsibleState;
        return reloadedElement;
    }

    async getChildren(element?: ZennTreeItem): Promise<ZennTreeItem[]> {
        if (element) {
            return element.loadChildren();
        } else {
            this.rootItems = this.loadRootItems();
            return this.rootItems;
        }
    }

    async getParent(element: ZennTreeItem): Promise<ZennTreeItem | undefined> {
        return element.parent;
    }

    private async findClosestItem(uri: Uri): Promise<ZennTreeItem | undefined> {
        const workspaceOfItem = (await this.workspaces).find(w => uri.contains(w.rootDirectory));
        if (!workspaceOfItem) {
            // out of workspace
            return undefined;
        }
        const foundItem = await this.findItem(uri);
        if (foundItem) {
            return foundItem;
        } else {
            return this.findClosestItem(uri.parentDirectory());
        }
    }

    public async findItem(uri: Uri): Promise<ZennTreeItem | undefined> {
        const results =
            await Promise.all((await this.rootItems).map(i => i.findItem(uri)));
        return results.find(r => r !== undefined);
    }

    private async loadRootItems(): Promise<ZennTreeItem[]> {
        return Promise.all(
            (await this.workspaces).map(w => new Workspace(w, this.resources))
        );
    }
}
