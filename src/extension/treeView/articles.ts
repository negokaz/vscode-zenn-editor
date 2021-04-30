import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import Uri from '../util/uri';
import ExtensionResource from '../resource/extensionResource';
import { ZennTreeItem } from "./zennTreeItem";
import { OpenZennTreeViewItemCommand } from './openZennTreeViewItemCommand';
import MarkdownMeta from './markdownMeta';

export class Articles extends ZennTreeItem {

    readonly uri: Uri;

    readonly parent: ZennTreeItem | undefined = undefined;

    private readonly resources: ExtensionResource;

    private children: Promise<ZennTreeItem[]>;

    constructor(uri: Uri, resources: ExtensionResource) {
        super("articles", vscode.TreeItemCollapsibleState.Expanded);
        this.uri = uri;
        this.resources = resources;
        this.resourceUri = uri.underlying;
        this.children = this.internalLoadChildren();
    }

    async getChildren(): Promise<ZennTreeItem[]> {
        return this.children;
    }

    async loadChildren(): Promise<ZennTreeItem[]> {
        this.children = this.internalLoadChildren();
        return this.children;
    }

    async reload(): Promise<ZennTreeItem> {
        return new Articles(this.uri, this.resources);
    }

    private async internalLoadChildren(): Promise<ZennTreeItem[]> {
        const files = await fs.readdir(this.uri.fsPath());
        const loadedArticles = files
            .filter(f => path.extname(f) === '.md')
            .map(f => Article.load(this, this.uri.resolve(f), this.resources));
        return Promise.all(loadedArticles).then(articles => articles.sort((a, b) => a.compare(b)));
    }
}

class Article extends ZennTreeItem {

    static async load(parent: ZennTreeItem, uri: Uri, resources: ExtensionResource): Promise<Article> {
        const fsStat = fs.stat(uri.fsPath());
        const meta = await MarkdownMeta.loadMeta(uri);
        return new Article(
            parent,
            uri,
            meta.title ? meta.title : uri.basename(),
            meta.emoji ? meta.emoji : "📃",
            meta.published ? meta.published : false,
            (await fsStat).mtime,
            resources,
        );
    }

    readonly parent: ZennTreeItem;

    readonly uri: Uri;

    readonly resources: ExtensionResource;

    private readonly published: boolean;

    private readonly lastModifiedTime: Date;

    private constructor(parent: ZennTreeItem, uri: Uri, title: string, emoji: string, published: boolean, lastModifiedTime: Date, resources: ExtensionResource) {
        super(`${emoji} ${title}`, vscode.TreeItemCollapsibleState.None);
        this.parent = parent;
        this.uri = uri;
        this.resources = resources;
        this.published = published;
        this.lastModifiedTime = lastModifiedTime;
        this.tooltip = uri.basename();
        this.command = new OpenZennTreeViewItemCommand(this.uri);
        this.resourceUri = uri.underlying;
        this.iconPath =
            published
                ? resources.uri('media', 'icon', 'published.svg').fsPath
                : resources.uri('media', 'icon', 'draft.svg').fsPath;

    }

    async reload(): Promise<Article> {
        return Article.load(this.parent, this.uri, this.resources);
    }

    public compare(other: Article): number {
        if (!this.published && other.published) {
            // 下書きを上位に表示
            return -1;
        } else {
            // どちらも公開済みか、どちらも下書きの場合は最終更新日時が新しいものを上位に表示
            return other.lastModifiedTime.getTime() - this.lastModifiedTime.getTime();
        }
    }
}
