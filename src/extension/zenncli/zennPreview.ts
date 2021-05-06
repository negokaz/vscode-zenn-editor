import { ChildProcessWithoutNullStreams } from "child_process";
import * as readline from 'readline';
import * as psTree from 'ps-tree';
import * as process from 'process';
import Uri from '../util/uri';

export default class ZennPreview {

    public static create(port: number, process: ChildProcessWithoutNullStreams, workingDirectory: Uri): Promise<ZennPreview> {
        const stdout = readline.createInterface(process.stdout);
        const stderr = readline.createInterface(process.stderr);
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                try {
                    this.kill(process);
                } finally {
                    reject(new Error("preview timeout"));
                }
            }, 10000 /*ms*/);

            stdout.on('line', line => {
                console.log(line.toString());
                if (line.includes(`http://localhost:${port}`)) {
                    clearTimeout(timeout);
                    resolve(new ZennPreview(port, process, workingDirectory));
                }
            });
            stderr.on('line', line => {
                console.log(line.toString());
            });
        });
    }

    private static kill(childProcess: ChildProcessWithoutNullStreams) {
        psTree(childProcess.pid, (error, children) => {
            if (error) {
                console.error(error);
            } else {
                children.forEach(child => {
                    process.kill(parseInt(child.PID));
                });
            }
        });
    }

    public readonly host: string;

    public readonly port: number;

    public readonly workingDirectory: Uri;

    private readonly process: ChildProcessWithoutNullStreams;

    private constructor(port: number, process: ChildProcessWithoutNullStreams, workingDirectory: Uri) {
        this.host = '127.0.0.1';
        this.port = port;
        this.process = process;
        this.workingDirectory = workingDirectory;
    }

    public onClose(listener: () => void): void {
        this.process.on('close', listener);
    }

    public close(): void {
        ZennPreview.kill(this.process);
    }
}
