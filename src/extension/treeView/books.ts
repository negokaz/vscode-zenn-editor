import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import Uri from '../util/uri';
import ExtensionResource from '../resource/extensionResource';
import MarkdownMeta from './markdownMeta';
import { OpenZennTreeViewItemCommand } from './openZennTreeViewItemCommand';
import { ZennTreeItem } from "./zennTreeItem";

export class Books extends ZennTreeItem {

    private readonly uri: Uri;

    private readonly resources: ExtensionResource;

    constructor(uri: Uri, resources: ExtensionResource) {
        super("books", vscode.TreeItemCollapsibleState.Expanded);
        this.uri = uri;
        this.resources = resources;
        this.resourceUri = uri.underlying;
    }

    async children(): Promise<ZennTreeItem[]> {
        const files = await fs.readdir(this.uri.fsPath());
        const fileWithStats = await Promise.all(
            files.map(async (file) => {
                const filePath = this.uri.resolve(file);
                return {
                    uri: filePath,
                    stat: await fs.stat(filePath.fsPath()),
                };
            })
        );
        const loadedBooks = fileWithStats
            .filter(f => f.stat.isDirectory())
            .map(d => Book.load(d.uri, this.resources));
        return Promise.all(loadedBooks)
            .then(books => books.sort((a, b) => a.compare(b)));
    }
}


class Book extends ZennTreeItem {

    static async load(uri: Uri, resources: ExtensionResource): Promise<Book> {
        const fsStat = fs.stat(uri.fsPath());
        const config = await Book.loadConfig(uri);
        return new Book(
            uri,
            config.title ? config.title : uri.basename(),
            config.published ? config.published : false,
            config.chapters,
            (await fsStat).mtime,
            resources,
        );
    }

    private readonly uri: Uri;

    private readonly published: boolean;

    private readonly chapters: string[] | undefined;

    private readonly lastModifiedTime: Date;

    private readonly resources: ExtensionResource;

    private constructor(uri: Uri, title: string, published: boolean, chapters: string[] | undefined, lastModifiedTime: Date, resources: ExtensionResource) {
        super(`📕 ${title}`, vscode.TreeItemCollapsibleState.Collapsed);
        this.uri = uri;
        this.published = published;
        this.chapters = chapters;
        this.lastModifiedTime = lastModifiedTime;
        this.resources = resources;
        this.tooltip = uri.basename();
        this.resourceUri = uri.underlying;
        this.iconPath =
            published
                ? resources.uri('media', 'icon', 'published.svg').fsPath
                : resources.uri('media', 'icon', 'draft.svg').fsPath;
    }

    async children(): Promise<ZennTreeItem[]> {
        const files = await fs.readdir(this.uri.fsPath());
        const loadedSections = Promise.all(
            this.chapters
                ? this.chapters
                    .map(c => this.uri.resolve(c))
                    .filter(async f => {
                        const stat = await fs.stat(f.fsPath());
                        return stat.isFile();
                    })
                    .map(f => BookSection.load(f, this.resources))
                : files
                    .filter(f => path.extname(f) === '.md')
                    .map(f => BookSection.load(this.uri.resolve(f), this.resources))
        ).then(sections => sections.sort((a, b) => a.compare(b)));
        const bookCover =
            files
                .filter(f => f === 'cover.png' || f === 'cover.jpeg')
                .map(f => BookCover.load(this.uri.resolve(f)));
        const bookConfig =
            files
                .filter(f => f === 'config.yaml')
                .map(f => BookConfig.load(this.uri.resolve(f)));

        const result: Promise<ZennTreeItem>[] = [];
        return (await loadedSections as ZennTreeItem[]).concat(await Promise.all(result.concat(bookCover).concat(bookConfig)));
    }

    public compare(other: Book): number {
        if (this.published) {
            // 下書きを上位に表示
            return 1;
        } else {
            return other.lastModifiedTime.getTime() - this.lastModifiedTime.getTime();
        }
    }

    private static async loadConfig(bookUri: Uri): Promise<any> {
        try {
            const file = await fs.readFile(bookUri.resolve('config.yaml').fsPath(), 'utf-8');
            return YAML.parse(await file);
        } catch (e) {
            return {};
        }
    }
}

class BookSection extends ZennTreeItem {

    static async load(uri: Uri, resources: ExtensionResource): Promise<BookSection> {
        const meta = await MarkdownMeta.loadMeta(uri);
        return new BookSection(
            uri,
            meta.title ? meta.title : uri.basename(),
            meta.free ? meta.free : false,
            resources,
        );
    }

    private readonly uri: Uri;

    private readonly sectionNo: number;

    private constructor(uri: Uri, title: string, free: boolean, resources: ExtensionResource) {
        super(`📄 ${title}`, vscode.TreeItemCollapsibleState.None);
        this.uri = uri;
        this.sectionNo = BookSection.extractSectionNo(uri);
        this.tooltip = uri.basename();
        this.command = new OpenZennTreeViewItemCommand(this.uri);
        this.resourceUri = uri.underlying;
        this.iconPath =
            free
                ? resources.uri('media', 'icon', 'unlock.svg').fsPath
                : resources.uri('media', 'icon', 'lock.svg').fsPath;
    }

    public compare(other: BookSection): number {
        return  this.sectionNo - other.sectionNo;
    }

    private static extractSectionNo(uri: Uri): number {
        const basenameElements = uri.basename().split('.');
        if (basenameElements.length > 0) {
            try {
                return parseInt(basenameElements[0]);
            } catch (e) {
                return 0;
            }
        } else {
            return 0;
        }
    }
}

class BookConfig extends ZennTreeItem {

    static async load(uri: Uri): Promise<BookConfig> {
        return new BookConfig(uri);
    }

    private readonly uri: Uri;

    private constructor(uri: Uri) {
        super(uri.basename(), vscode.TreeItemCollapsibleState.None);
        this.uri = uri;
        this.tooltip = uri.basename();
        this.command = new OpenZennTreeViewItemCommand(this.uri);
        this.resourceUri = this.uri.underlying;
    }
}

class BookCover extends ZennTreeItem {

    static async load(uri: Uri): Promise<BookCover> {
        return new BookCover(uri);
    }

    private readonly uri: Uri;

    private constructor(uri: Uri) {
        super(uri.basename(), vscode.TreeItemCollapsibleState.None);
        this.uri = uri;
        this.tooltip = uri.basename();
        this.command = new OpenZennTreeViewItemCommand(this.uri);
        this.resourceUri = this.uri.underlying;
    }
}
