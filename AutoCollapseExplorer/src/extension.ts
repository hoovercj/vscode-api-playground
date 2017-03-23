'use strict';
import { ExtensionContext, commands, workspace, window, Disposable } from 'vscode';

let collapse: boolean = undefined;
let activeEditorDisposable: Disposable;
let configDisposable: Disposable;
export function activate(context: ExtensionContext) {
    initialize();
    const configDisposable = workspace.onDidChangeConfiguration(() => initialize());
}

function executeCommands() {
    if (collapse && window.activeTextEditor) {
        commands.executeCommand('workbench.files.action.collapseExplorerFolders').then(() => {
            commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
        }).then(() => {
            commands.executeCommand('workbench.action.focusActiveEditorGroup');
        });
    }
}

function initialize() {
    const config = workspace.getConfiguration('explorer').get('autoCollapse', true);

    if (collapse === config) {
        return;
    }

    collapse = config;

    if (collapse) {
        activeEditorDisposable = window.onDidChangeActiveTextEditor(executeCommands);
    } else {
        activeEditorDisposable.dispose();
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
    activeEditorDisposable.dispose();
    configDisposable.dispose();
}