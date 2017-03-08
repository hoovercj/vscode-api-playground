'use strict';
import { ExtensionContext, commands, workspace, window } from 'vscode';

let ctx: ExtensionContext;

export function activate(context: ExtensionContext) {
    ctx = context;

    window.onDidChangeActiveTextEditor(() => {
        commands.executeCommand('workbench.files.action.collapseExplorerFolders').then(() => {
            commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
        }).then(() => {
            commands.executeCommand('workbench.action.focusActiveEditorGroup');
        });
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
    ctx.subscriptions.forEach(subscription => subscription.dispose())
}