import * as YAML from 'yaml';
import * as readline from 'readline';
import * as fs from 'fs';
import Uri from '../util/uri';

export default class MarkdownMeta {

    public static async loadMeta(uri: Uri): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const stream = fs.createReadStream(uri.fsPath());
            const readlineIF = readline.createInterface(stream);
            var yaml: string = "";
            var onMeta = false;
            var complete = false;
            readlineIF.on('line', line => {
                if (line.match(/^---$/)) {
                    if (onMeta) {
                        complete = true;
                        onMeta = false;
                        readlineIF.close();
                    } else {
                        onMeta = true;
                    }
                } else {
                    if (onMeta) {
                        yaml = yaml + line + "\n";
                    }
                }
            });
            readlineIF.on("close", () => {
                stream.close();
                if (complete) {
                    try {
                        resolve(YAML.parse(yaml));
                    } catch (e) {
                        resolve({});
                    }
                } else {
                    resolve({});
                }
            });
        });
    }
}
