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

    private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

    readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

    constructor(resources: ExtensionResource) {
        this.resources = resources;
        vscode.workspace.onDidCreateFiles(() => this.refresh());
        vscode.workspace.onDidDeleteFiles(() => this.refresh());
        vscode.workspace.onDidRenameFiles(() => this.refresh());
    }

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ZennTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ZennTreeItem): Promise<ZennTreeItem[]> {
        if (element) {
            return element.children();
        } else {
            // root items
            const workspace = await ZennWorkspace.findWorkspace();
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
}
