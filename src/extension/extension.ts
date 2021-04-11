// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import PreviewViewManager from './preview/previewViewManager';
import { ZennTreeViewProvider } from './treeView/zennTreeViewProvider';
import ExtensionResource from './resource/extensionResource';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.commands.executeCommand('setContext', 'zenn-editor.activated', true);

    const zennViewProvider = new ZennTreeViewProvider(new ExtensionResource(context));
	context.subscriptions.push(
        vscode.window.registerTreeDataProvider('zenn', zennViewProvider),
        vscode.commands.registerCommand('zenn-editor.refresh-tree-view', () => zennViewProvider.refresh()),
        vscode.commands.registerCommand('zenn-editor.open-tree-view-item', openTreeViewItem()),
		vscode.commands.registerCommand('zenn-editor.preview', previewDocument(context)),
        vscode.commands.registerCommand('zenn-editor.open-image-uploader', openImageUploader()),
	);
	console.log('zenn-editor is now active');
}

// this method is called when your extension is deactivated
export function deactivate() {}

const previewViewManager = PreviewViewManager.create();

function previewDocument(context: vscode.ExtensionContext) {
	return (uri?: vscode.Uri) => {
        if (uri) {
		    previewViewManager.openPreview(uri, context);
        }
	};
}

function openImageUploader() {
    return () => {
        vscode.env.openExternal(vscode.Uri.parse('https://zenn.dev/dashboard/uploader'));
    };
}

function openTreeViewItem() {
    return (uri?: vscode.Uri) => {
        if (uri) {
            vscode.commands.executeCommand('vscode.open', uri, { viewColumn: vscode.ViewColumn.One });
        }
    }
}
