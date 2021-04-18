import { ChildProcessWithoutNullStreams } from "child_process";
import Uri from '../util/uri';

export default class ZennNewBook {

    public static resolve(process: ChildProcessWithoutNullStreams, workingDirectory: Uri): Promise<ZennNewBook> {
        return new Promise((resolve, reject) => {
            var stdout = '';
            var stderr = '';
            process.stdout.on('data', data => {
                stdout = stdout + data;
            });
            process.stderr.on('data', data => {
                stderr = stderr + data;
            });
            process.on('close', code => {
                if (code === 0) {
                    const configRelativePath = stdout.match(/books\/[^/]+\/config.yaml/);
                    if (configRelativePath) {
                        const path = configRelativePath[0];
                        resolve(new ZennNewBook(workingDirectory.resolve(path)));
                    } else {
                        reject(new Error(`Book creation failed [unexpected stdout]: ${stdout}`));
                    }
                } else {
                    reject(new Error(`Book creation failed (exit code: ${code}): ${stderr}`));
                }
            });
        });
    }

    public readonly configUri: Uri;

    private constructor(configUri: Uri) {
        this.configUri = configUri;
    }
}
