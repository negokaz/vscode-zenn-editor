import Uri from '../util/uri';

export abstract class PreviewDocument {

    static create(cwdUri: Uri, document: Uri): PreviewDocument {
        const relativePath = this.normalizePath(document.relativePathFrom(cwdUri));
        if (relativePath.startsWith("books/")) {
            return new BookDocument(document, relativePath);
        } else if (relativePath.startsWith("articles/")) {
            return new ArticleDocument(document, relativePath);
        } else {
            return new InvalidDocument(document, relativePath);
        }
    }

    static normalizePath(path: string): string {
        return path.replace(/\.git$/, "");
    }

    abstract uri(): Uri;

    abstract urlPath(): string;

}

export class InvalidDocument extends PreviewDocument {

    private readonly relativePath: string;

    private readonly documentUri: Uri;

    constructor(documentUri: Uri, relativePath: string) {
        super();
        this.relativePath = relativePath;
        this.documentUri = documentUri;
    }

    urlPath(): string {
        return this.relativePath;
    }

    uri(): Uri {
        return this.documentUri;
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
