import * as vscode from 'vscode';
import * as path from 'path';

export default class Uri {

    public static file(path: string): Uri {
        return new Uri(vscode.Uri.file(path));
    }

    public static of(uri: vscode.Uri): Uri {
        return new Uri(uri);
    }

    public readonly underlying: vscode.Uri

    private constructor(underlying: vscode.Uri) {
        this.underlying = underlying;
    }

    public fsPath(): string {
        return this.underlying.fsPath;
    }

    public basename(): string {
        return path.basename(this.fsPath());
    }

    public resolve(...pathSegments: string[]): Uri {
        return Uri.file(path.resolve.apply(null, [this.underlying.fsPath].concat(pathSegments)));
    }
}
