import Uri from './uri';
import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import { worker } from 'node:cluster';

export class ZennWorkspace {

    public static async findActiveWorkspace(): Promise<ZennWorkspace> {
        if (vscode.window.activeTextEditor) {
            const activeWorkspace =
                vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
            if (activeWorkspace) {
                const result = await this.resolveWorkspace(Uri.of(activeWorkspace.uri));
                if (result.length > 0) {
                    return result[0];
                }
            }
        }
        return (await this.findWorkspaces())[0]; // Zenn の Workspace があるときだけ拡張が有効になる
    }

    public static async findWorkspaces(): Promise<ZennWorkspace[]> {
        if (vscode.workspace.workspaceFolders) {
            const zennWorkspaces =
                Promise.all(
                    vscode.workspace.workspaceFolders
                        .map(async folder => this.resolveWorkspace(Uri.of(folder.uri)))
                );
            return (await zennWorkspaces).flatMap(i => i /*identity*/);
        }
        return Promise.reject(new Error("ワークスペースが必要です"));
    }

    public static async resolveWorkspace(workspace: Uri): Promise<ZennWorkspace[]> {
        const articles = workspace.resolve('articles');
        const articlesStatPromise = fs.stat(articles.fsPath()).catch(() => undefined);
        const books = workspace.resolve('books');
        const booksStatPromise = fs.stat(books.fsPath()).catch(() => undefined);
        const articlesStat = await articlesStatPromise;
        const booksStat = await booksStatPromise;
        const articlesDir = articlesStat && articlesStat.isDirectory() ? articles : undefined;
        const booksDir = booksStat && booksStat.isDirectory() ? books : undefined;
        return (articlesDir || booksDir) ? [new ZennWorkspace(articlesDir, booksDir)] : [];
    }

    public readonly rootDirectory: Uri;

    public readonly articlesDirectory: Uri | undefined;

    public readonly booksDirectory: Uri | undefined;

    constructor(articlesDirectory: Uri | undefined, booksDirectory: Uri | undefined) {
        this.articlesDirectory = articlesDirectory;
        this.booksDirectory = booksDirectory;
        if (articlesDirectory) {
            this.rootDirectory = articlesDirectory.parentDirectory();
        } else if(booksDirectory) {
            this.rootDirectory = booksDirectory.parentDirectory();
        } else {
            throw new Error(`Could not resolve root directory { articles: ${articlesDirectory}, books: ${booksDirectory} }`);
        }
    }
}
