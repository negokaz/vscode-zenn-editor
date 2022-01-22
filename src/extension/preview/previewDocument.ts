import Uri from '../util/uri';
import * as path from 'path';

export abstract class PreviewDocument {

    static create(document: Uri): PreviewDocument {
        const workspace = document.workspaceDirectory();
        if (workspace) {
            const relativePath = this.normalizePath(document.relativePathFrom(workspace));
            const filePath = path.parse(relativePath);
            if (filePath.dir.match(/books\/[^/]+$/)) {
                if (filePath.ext === '.md') {
                    return new BookDocument(document, relativePath);
                } else if (filePath.base === "config.yaml") {
                    return new BookConfigDocument(document, relativePath);
                }
            } else if (filePath.dir === "articles" && filePath.ext === '.md') {
                return new ArticleDocument(document, relativePath);
            }
        }
        return new UnknownDocument(document);
    }

    static normalizePath(path: string): string {
        return path.replace(/\.git$/, "");
    }

    abstract uri(): Uri;

    abstract urlPath(): string;

    isPreviewable(): boolean {
        return true;
    }
}

export class UnknownDocument extends PreviewDocument {

    private readonly documentUri: Uri;

    constructor(documentUri: Uri) {
        super();
        this.documentUri = documentUri;
    }

    urlPath(): string {
        return "";
    }

    uri(): Uri {
        return this.documentUri;
    }

    isPreviewable(): boolean {
        return false;
    }
}

export class BookDocument extends PreviewDocument {

    private readonly documentUri: Uri;

    private readonly relativePath: string;

    constructor(documentUri: Uri, relativePath: string) {
        super();
        this.relativePath = relativePath;
        this.documentUri = documentUri;
    }

    urlPath(): string {
        return encodeURI(this.relativePath.replace(/\./g, "%2E"));
    }

    uri(): Uri {
        return this.documentUri;
    }
}

export class BookConfigDocument extends PreviewDocument {

    private readonly documentUri: Uri;

    private readonly relativePath: string;

    constructor(documentUri: Uri, relativePath: string) {
        super();
        this.relativePath = relativePath;
        this.documentUri = documentUri;
    }

    urlPath(): string {
        return this.relativePath.replace(/\/config\.yaml$/, "");
    }

    uri(): Uri {
        return this.documentUri;
    }
}

export class ArticleDocument extends PreviewDocument {

    private readonly documentUri: Uri;

    private readonly relativePath: string;

    constructor(documentUri: Uri, relativePath: string) {
        super();
        this.relativePath = relativePath;
        this.documentUri = documentUri;
    }

    urlPath(): string {
        return this.relativePath.replace(/\.md$/, "");
    }

    uri(): Uri {
        return this.documentUri;
    }
}
