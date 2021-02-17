import * as vscode from 'vscode';
import PreviewView from './previewView';

export default class PreviewViewManager {

    public static create(): PreviewViewManager {
        return new PreviewViewManager();
    }

    private previewView: PreviewView | undefined;

    private constructor() {}

    public async openPreview(uri: vscode.Uri, context: vscode.ExtensionContext): Promise<void> {
        if (this.previewView) {
            this.previewView.reveal();
        } else {
            this.previewView = await PreviewView.open(uri, context);
            this.previewView.onDidClose(() => {
                this.previewView = undefined;
            });
        }
    }
}
