import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import ZennPreview from './zennPreview';
import * as process from 'process';
import * as which from 'which';
import ZennNewArticle from './zennNewArticle';
import ZennNewBook from './zennNewBook';
import Uri from '../util/uri';

export class ZennCli {

    public static async create(workingDirectory: Uri): Promise<ZennCli> {
        try {
            const zennCliPath = await ZennCli.findZennCliPath(workingDirectory);
            return new ZennCli(workingDirectory, zennCliPath);
        } catch(e) {
            vscode.window.showErrorMessage('zenn-cli が見つかりませんでした。インストールしてください。\nhttps://zenn.dev/zenn/articles/install-zenn-cli');
            throw e;
        }
    }

    private static async findZennCliPath(workingDirectory: Uri): Promise<Uri> {
        const env = Object.assign({}, process.env);
        const paths: string[] = new (require('path-array'))(env);
        for (let i = 0; i < paths.length; i++) {
            paths[i] = workingDirectory.resolve(paths[i]).fsPath();
        }
        // additional paths
        paths.unshift(
            workingDirectory.resolve('node_modules', '.bin').fsPath(),
        );
        return Uri.file(await which('zenn', { path: env.PATH }));
    }

    readonly workingDirectory: Uri;

    readonly zennCliPath: Uri;

    private constructor(workingDirectory: Uri, zennCliPath: Uri) {
        this.workingDirectory = workingDirectory;
        this.zennCliPath = zennCliPath;
    }

    public preview(port: number): ZennPreview {
		const cliProcess = this.spawn(['preview', '--port', port.toString()]);
        return ZennPreview.create(port, cliProcess, this.workingDirectory);
    }

    public createNewArticle(): Promise<ZennNewArticle> {
        const childProcess = this.spawn(['new:article', '--machine-readable']);
        return ZennNewArticle.resolve(childProcess, this.workingDirectory);
    }

    public createNewBook(): Promise<ZennNewBook> {
        const childProcess = this.spawn(['new:book']);
        return ZennNewBook.resolve(childProcess, this.workingDirectory);
    }

    private spawn(args: string[]): childProcess.ChildProcessWithoutNullStreams {
		const zennProcess =  childProcess.spawn(this.zennCliPath.fsPath(), args, { cwd: this.workingDirectory.fsPath() });
        zennProcess.on('error', err => {
            vscode.window.showErrorMessage(`zenn-cli の起動に失敗しました: ${err.message}`);
        });
        return zennProcess;
    }
}
