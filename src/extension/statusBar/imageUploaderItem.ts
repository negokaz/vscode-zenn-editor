import * as vscode from 'vscode';

export default class ImageUploaderItem {

    public static create(): ImageUploaderItem {
       return new ImageUploaderItem();
    }

    private readonly statusBarItem: vscode.StatusBarItem;

    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.statusBarItem.text = '$(cloud-upload) Upload Image';
        this.statusBarItem.tooltip = 'Zenn Editor: 画像のアップロード';
        this.statusBarItem.command = 'zenn-editor.open-image-uploader';
    }

    public show(): void {
        this.statusBarItem.show();
    }

    public hide(): void {
        this.statusBarItem.hide();
    }
}
