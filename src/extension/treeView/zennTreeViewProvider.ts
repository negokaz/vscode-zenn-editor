import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import ExtensionResource from '../resource/extensionResource';
import Uri from '../util/uri';
import { Books } from './books';
import { Articles } from './articles';
import { ZennTreeItem } from './zennTreeItem';

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
            if (vscode.workspace.workspaceFolders) {
                for (var folder of vscode.workspace.workspaceFolders) {
                    const workspace = Uri.of(folder.uri);
                    const articles = workspace.resolve('articles');
                    const articlesStat = fs.stat(articles.fsPath());
                    const books = workspace.resolve('books');
                    const booksStat = fs.stat(books.fsPath());
                    const items: ZennTreeItem[] = [];
                    if ((await articlesStat).isDirectory()) {
                        items.push(new Articles(articles, this.resources));
                    }
                    if ((await booksStat).isDirectory()) {
                        items.push(new Books(books, this.resources));
                    }
                    if (items.length > 0) {
                        return Promise.resolve(items);
                    }
                }
            }
        }
        return Promise.resolve([]);
    }
}
