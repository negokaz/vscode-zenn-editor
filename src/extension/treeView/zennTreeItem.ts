import * as vscode from 'vscode';
import Uri from '../util/uri';


export abstract class ZennTreeItem extends vscode.TreeItem {

    abstract uri: Uri;

    abstract parent: ZennTreeItem | undefined;

    async getChildren(): Promise<ZennTreeItem[]> {
        return Promise.resolve([]);
    }

    async loadChildren(): Promise<ZennTreeItem[]> {
        return Promise.resolve([]);
    }

    async findItem(uri: Uri): Promise<ZennTreeItem | undefined> {
        const children = await this.getChildren();
        if (uri.contains(this.uri)) {
            if (uri.fsPath() === this.uri.fsPath()) {
                return this;
            } else if (children.length > 0) {
                const childResults =
                    await Promise.all(children.map(child => child.findItem(uri)));
                return childResults.find(v => v !== undefined);
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    abstract reload(): Promise<ZennTreeItem>;
}
