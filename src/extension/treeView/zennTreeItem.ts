import * as vscode from 'vscode';


export abstract class ZennTreeItem extends vscode.TreeItem {
    async children(): Promise<ZennTreeItem[]> {
        return Promise.resolve([]);
    }
}
