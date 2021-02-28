import * as vscode from 'vscode';
import ImageUploaderItem from '../statusBar/imageUploaderItem';
import PreviewView from './previewView';

export default class PreviewViewManager {

    public static create(): PreviewViewManager {
        return new PreviewViewManager();
    }

    private imageUploaderStatusbarItem = ImageUploaderItem.create();

    private previewView: PreviewView | undefined;

    private constructor() {}

    public async openPreview(uri: vscode.Uri, context: vscode.ExtensionContext): Promise<void> {
        if (this.previewView) {
            this.previewView.reveal();
        } else {
            this.previewView = await PreviewView.open(uri, context);
            this.previewView.onDidClose(() => {
                this.previewView = undefined;
                this.imageUploaderStatusbarItem.hide();
            });
            this.imageUploaderStatusbarItem.show();
        }
    }
}
