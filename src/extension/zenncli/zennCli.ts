import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import ZennPreview from './zennPreview';
import * as path from 'path';
import * as process from 'process';
import * as which from 'which';

export class ZennCli {

    public static async create(workingDirectory: vscode.Uri): Promise<ZennCli> {
        try {
            const zennCliPath = await ZennCli.findZennCliPath(workingDirectory);
            return new ZennCli(workingDirectory, zennCliPath);
        } catch(e) {
            vscode.window.showErrorMessage('zenn-cli が見つかりませんでした。インストールしてください。\nhttps://zenn.dev/zenn/articles/install-zenn-cli');
            throw e;
        }
    }

    private static async findZennCliPath(workingDirectory: vscode.Uri): Promise<vscode.Uri> {
        const env = Object.assign({}, process.env);
        const paths: string[] = new (require('path-array'))(env);
        for (let i = 0; i < paths.length; i++) {
            paths[i] = path.resolve(workingDirectory.fsPath, paths[i]);
        }
        // additional paths
        paths.unshift(
            path.join(workingDirectory.fsPath, 'node_modules', '.bin'),
        );
        return vscode.Uri.file(await which('zenn', { path: env.PATH }));
    }

    readonly workingDirectory: vscode.Uri;

    readonly zennCliPath: vscode.Uri;

    private constructor(workingDirectory: vscode.Uri, zennCliPath: vscode.Uri) {
        this.workingDirectory = workingDirectory;
        this.zennCliPath = zennCliPath;
    }

    public preview(port: number): ZennPreview {
		const cliProcess = this.spawn(['preview', '--port', port.toString()]);
        return ZennPreview.create(port, cliProcess, this.workingDirectory);
    }

    private spawn(args: string[]): childProcess.ChildProcessWithoutNullStreams {
		const zennProcess =  childProcess.spawn(this.zennCliPath.fsPath, args, { cwd: this.workingDirectory.fsPath });
        zennProcess.on('error', err => {
            vscode.window.showErrorMessage(`zenn-cli の起動に失敗しました: ${err.message}`);
        });
        return zennProcess;
    }
}
