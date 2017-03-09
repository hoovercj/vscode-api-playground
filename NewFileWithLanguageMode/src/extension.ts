'use strict';
import { ExtensionContext, workspace, window, commands } from 'vscode';

let ctx: ExtensionContext;

export function activate(context: ExtensionContext) {
    ctx = context;
    const command = commands.registerCommand('editor.newFile.withLanguageMode', () => {
        const language = workspace.getConfiguration('editor.newFile').get('defaultLanguageMode', null);

        const options = language ? {language} : null;
        workspace.openTextDocument(options).then((document) => window.showTextDocument(document));
    });
    ctx.subscriptions.push(command);
}

// this method is called when your extension is deactivated
export function deactivate() {
    ctx.subscriptions.forEach(subscription => subscription.dispose())
}