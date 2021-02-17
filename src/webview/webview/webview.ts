import '../full-page-iframe.css';

// This API provided by vscode:
// https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-a-webview-to-an-extension
declare let acquireVsCodeApi: any;

window.addEventListener('DOMContentLoaded', () => {
    const proxy = document.querySelector('iframe#zenn-proxy');
    if (proxy && proxy instanceof HTMLIFrameElement && proxy.contentWindow) {
        activate(proxy.contentWindow);
    } else {
        console.error("iframe not available");
    }
});

function activate(proxyWindow: Window) {

    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
        // forward message
        const message = event.data;
        if (message.source === 'proxy') {
            vscode.postMessage(message);
        } else {
            proxyWindow.postMessage(message, '*');
        }
    });
}
