import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import ExtensionResource from '../resource/extensionResource';
import Uri from '../util/uri';
import { Books } from './books';
import { Articles } from './articles';
import { ZennTreeItem } from './zennTreeItem';
import { ZennWorkspace } from '../util/zennWorkspace';

// [Tree View API | Visual Studio Code Extension API](https://code.visualstudio.com/api/extension-guides/tree-view)
export class ZennTreeViewProvider implements vscode.TreeDataProvider<ZennTreeItem> {

    private readonly resources: ExtensionResource;

    private _onDidChangeTreeData: vscode.EventEmitter<ZennTreeItem | undefined> =
        new vscode.EventEmitter<ZennTreeItem | undefined>();

    readonly onDidChangeTreeData: vscode.Event<ZennTreeItem | undefined> = this._onDidChangeTreeData.event;

    private workspace: Promise<ZennWorkspace>;

    private rootItems: Promise<ZennTreeItem[]>;

    constructor(resources: ExtensionResource) {
        this.resources = resources;
        this.workspace = ZennWorkspace.findActiveWorkspace();
        this.rootItems = this.loadRootItems();
        vscode.workspace.onDidCreateFiles(() => this.refresh());
        vscode.workspace.onDidDeleteFiles(() => this.refresh());
        vscode.workspace.onDidRenameFiles(() => this.refresh());
    }

    public async refresh(uri?: Uri): Promise<void> {
        if (uri) {
            const item = await this.findClosestItem(uri);
            this._onDidChangeTreeData.fire(item);
        } else {
            this._onDidChangeTreeData.fire(undefined);
        }
    }

    getTreeItem(element: ZennTreeItem): vscode.TreeItem {
        return element;
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
        const workspace = await this.workspace;
        if (!uri.contains(workspace.rootDirectory)) {
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
        const workspace = await this.workspace;
        const items: ZennTreeItem[] = [];
        if (workspace.articlesDirectory) {
            items.push(new Articles(workspace.articlesDirectory, this.resources));
        }
        if (workspace.booksDirectory) {
            items.push(new Books(workspace.booksDirectory, this.resources));
        }
        return Promise.resolve(items);
    }
}
