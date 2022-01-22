import { ChildProcessWithoutNullStreams } from "child_process";

export default class ZennVersion {

    public static create(version: string): ZennVersion {
        return new ZennVersion(version);
    }

    public static resolve(process: ChildProcessWithoutNullStreams): Promise<ZennVersion> {
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
                    resolve(new ZennVersion(stdout.trim()));
                } else {
                    reject(new Error(`Cannot resolve version (exit code: ${code}): ${stderr}`));
                }
            });
        });
    }

    public readonly major: number;

    public readonly minor: number;

    public readonly patch: number;

    public readonly displayVersion: string;

    private constructor(version: string) {
        const normalized = version.match(/[0-9]+\.[0-9]+\.[0-9]+/);
        this.displayVersion = (normalized && normalized[0] ? normalized[0] : "0.0.0");
        const [major, minor, patch] = this.displayVersion.split('.');
        this.major = parseInt(major);
        this.minor = parseInt(minor);
        this.patch = parseInt(patch);
    }

    compare(other: ZennVersion): number {
        if (this.major > other.major) {
            return 1;
        } else if (this.major < other.major) {
            return -1;
        } else { // common major
            if (this.minor > other.minor) {
                return 1;
            } else if (this.minor < other.minor) {
                return -1;
            } else { // common minor
                if (this.patch > other.patch) {
                    return 1;
                } else if (this.patch < other.patch) {
                    return -1;
                } else { // common patch
                    return 0;
                }
            }
        }
    }

    toString(): string {
        return this.displayVersion;
    }
}
