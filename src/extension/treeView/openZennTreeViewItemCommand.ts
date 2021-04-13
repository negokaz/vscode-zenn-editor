import * as vscode from 'vscode';
import Uri from '../util/uri';

export class OpenZennTreeViewItemCommand implements vscode.Command {

    public readonly title: string = "";
    public readonly command: string = "zenn-editor.open-tree-view-item";
    public readonly arguments: any[];

    constructor(uri: Uri) {
        this.arguments = [uri.underlying];
    }
}
