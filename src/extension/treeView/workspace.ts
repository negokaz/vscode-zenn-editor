import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import Uri from '../util/uri';
import ExtensionResource from '../resource/extensionResource';
import { ZennTreeItem } from "./zennTreeItem";
import { ZennWorkspace } from "../util/zennWorkspace";
import { Articles } from './articles';
import { Books } from './books';

export class Workspace extends ZennTreeItem {

    readonly uri: Uri;

    readonly workspace: ZennWorkspace;

    readonly parent: ZennTreeItem | undefined = undefined;

    private readonly resources: ExtensionResource;

    private children: Promise<ZennTreeItem[]>;

    constructor(workspace: ZennWorkspace, resources: ExtensionResource) {
        super(workspace.rootDirectory.basename(), vscode.TreeItemCollapsibleState.Expanded);
        this.uri = workspace.rootDirectory;
        this.workspace = workspace;
        this.resources = resources;
        this.resourceUri = workspace.rootDirectory.underlying;
        this.children = this.internalLoadChildren();
    }

    async getChildren(): Promise<ZennTreeItem[]> {
        return this.children;
    }

    async loadChildren(): Promise<ZennTreeItem[]> {
        this.children = this.internalLoadChildren();
        return this.children;
    }

    private async internalLoadChildren(): Promise<ZennTreeItem[]> {
        const items: ZennTreeItem[] = [];
        if (this.workspace.articlesDirectory) {
            items.push(new Articles(this.workspace.articlesDirectory, this.resources));
        }
        if (this.workspace.booksDirectory) {
            items.push(new Books(this.workspace.booksDirectory, this.resources));
        }
        return Promise.resolve(items);
    }
}
