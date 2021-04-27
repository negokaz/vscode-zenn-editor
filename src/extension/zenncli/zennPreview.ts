import { ChildProcessWithoutNullStreams } from "child_process";
import * as psTree from 'ps-tree';
import * as process from 'process';
import Uri from '../util/uri';

export default class ZennPreview {

    public static create(port: number, process: ChildProcessWithoutNullStreams, workingDirectory: Uri): ZennPreview {
        return new ZennPreview(port, process, workingDirectory);
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

        this.process.stdout.on('data', data => {
            console.log(data.toString());
        });
        this.process.stderr.on('data', data => {
            console.log(data.toString());
        });
    }

    public onClose(listener: () => void): void {
        this.process.on('close', listener);
    }

    public close(): void {
        psTree(this.process.pid, (error, children) => {
            if (error) {
                console.error(error);
            } else {
                children.forEach(child => {
                    process.kill(parseInt(child.PID));
                });
            }
        });
    }
}
