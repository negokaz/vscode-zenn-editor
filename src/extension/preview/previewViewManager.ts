import * as vscode from 'vscode';
import ImageUploaderItem from '../statusBar/imageUploaderItem';
import PreviewView from './previewView';
import Uri from '../util/uri';

export default class PreviewViewManager {

    public static create(): PreviewViewManager {
        return new PreviewViewManager();
    }

    private imageUploaderStatusbarItem = ImageUploaderItem.create();

    private previewView: PreviewView | undefined;

    private constructor() {}

    public async openPreview(uri: Uri, context: vscode.ExtensionContext): Promise<void> {
        if (this.previewView) {
            this.previewView.open(uri);
            this.previewView.reveal();
        } else {
            this.previewView = await PreviewView.create(context);
            this.previewView.open(uri);
            this.previewView.onDidClose(() => {
                this.previewView = undefined;
                this.imageUploaderStatusbarItem.hide();
            });
            this.imageUploaderStatusbarItem.show();
        }
    }

    public async changePreviewDocument(document: vscode.TextDocument): Promise<void> {
        if (this.previewView) {
            this.previewView.changePreviewDocument(document);
        }
    }
}
