// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import PreviewViewManager from './preview/previewViewManager';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.commands.executeCommand('setContext', 'zenn-editor.activated', true);

	context.subscriptions.push(
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
