import { ChildProcessWithoutNullStreams } from "child_process";
import Uri from '../util/uri';

export default class ZennNewArticle {

    public static resolve(process: ChildProcessWithoutNullStreams, workingDirectory: Uri): Promise<ZennNewArticle> {
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
                    const newArticlePath = stdout.trim();
                    if (newArticlePath.startsWith('article')) {
                        // 0.1.86 以降
                        resolve(new ZennNewArticle(workingDirectory.resolve(newArticlePath)));
                    } else {
                        // 0.1.85 以前
                        resolve(new ZennNewArticle(workingDirectory.resolve('articles', newArticlePath)));
                    }
                } else {
                    reject(new Error(`Article creation failed (exit code: ${code}): ${stderr}`));
                }
            });
        });
    }

    public readonly articleUri: Uri;

    private constructor(articleUri: Uri) {
        this.articleUri = articleUri;
    }
}
