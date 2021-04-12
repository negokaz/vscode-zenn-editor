import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import Uri from '../util/uri';
import ExtensionResource from '../resource/extensionResource';
import { ZennTreeItem } from "./zennTreeItem";
import { OpenZennTreeViewItemCommand } from './openZennTreeViewItemCommand';
import MarkdownMeta from './markdownMeta';

export class Articles extends ZennTreeItem {

    private readonly uri: Uri;

    private readonly resources: ExtensionResource;

    constructor(uri: Uri, resources: ExtensionResource) {
        super("🗂️ articles", vscode.TreeItemCollapsibleState.Expanded);
        this.uri = uri;
        this.resources = resources;
        this.resourceUri = uri.underlying;
    }

    async children(): Promise<ZennTreeItem[]> {
        const files = await fs.readdir(this.uri.fsPath());
        const loadedArticles = files
            .filter(f => path.extname(f) === '.md')
            .map(f => Article.load(this.uri.resolve(f), this.resources));
        return Promise.all(loadedArticles).then(articles => articles.sort((a, b) => a.compare(b)));
    }
}

class Article extends ZennTreeItem {

    static async load(uri: Uri, resources: ExtensionResource): Promise<Article> {
        const fsStat = fs.stat(uri.fsPath());
        const meta = await MarkdownMeta.loadMeta(uri);
        return new Article(
            uri,
            meta.title ? meta.title : uri.basename(),
            meta.emoji ? meta.emoji : "📃",
            meta.published ? meta.published : false,
            (await fsStat).mtime,
            resources,
        );
    }

    private readonly uri: Uri;

    private readonly published: boolean;

    private readonly lastModifiedTime: Date;

    private constructor(uri: Uri, title: string, emoji: string, published: boolean, lastModifiedTime: Date, resources: ExtensionResource) {
        super(`${emoji} ${title}`, vscode.TreeItemCollapsibleState.None);
        this.uri = uri;
        this.published = published;
        this.lastModifiedTime = lastModifiedTime;
        this.tooltip = path.basename(this.uri.fsPath());
        this.command = new OpenZennTreeViewItemCommand(this.uri);
        this.resourceUri = uri.underlying;
        this.iconPath =
            published
                ? resources.uri('media', 'icon', 'published.svg').fsPath
                : resources.uri('media', 'icon', 'draft.svg').fsPath;

    }

    public compare(other: Article): number {
        if (this.published) {
            // 下書きを上位に表示
            return 1;
        } else {
            return other.lastModifiedTime.getTime() - this.lastModifiedTime.getTime();
        }
    }
}
