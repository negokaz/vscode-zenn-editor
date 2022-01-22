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

    public relativePathFrom(from: Uri): string {
        return this.underlying.path.substr(from.underlying.path.length + 1);
    }

    public workspaceDirectory(): Uri | undefined {
        const workspace = vscode.workspace.getWorkspaceFolder(this.underlying);
        if (workspace) {
            return Uri.of(workspace.uri);
        } else {
            return undefined;
        }
    }

    public parentDirectory(): Uri {
        return Uri.file(path.dirname(this.fsPath()));
    }

    public contains(uri: Uri): boolean {
        const self = this.fsPath().split(path.sep);
        const other = uri.fsPath().split(path.sep);
        if (self.length < other.length) {
            return false;
        }
        for(let i = 0; i < other.length; i++) {
            if (self[i] !== other[i]) {
                return false;
            }
        }
        return true;
    }
}
