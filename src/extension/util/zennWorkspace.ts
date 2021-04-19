import Uri from './uri';
import * as vscode from 'vscode';
import { promises as fs } from 'fs';

export class ZennWorkspace {

    public static async findWorkspace(): Promise<ZennWorkspace> {
        if (vscode.workspace.workspaceFolders) {
            for (let folder of vscode.workspace.workspaceFolders) {
                const workspace = Uri.of(folder.uri);
                const articles = workspace.resolve('articles');
                const articlesStat = fs.stat(articles.fsPath());
                const books = workspace.resolve('books');
                const booksStat = fs.stat(books.fsPath());
                const articlesDir = (await articlesStat).isDirectory() ? articles : undefined;
                const booksDir = (await booksStat).isDirectory() ? books : undefined;
                if (articlesDir || booksDir) {
                    return new ZennWorkspace(
                        articlesDir,
                        booksDir,
                    );
                }
            }
        }
        return Promise.reject(new Error("Zenn workspace not found"));
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
