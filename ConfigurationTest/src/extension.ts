'use strict';
import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('configtest');

    // The default value is set to 0 despite not being set in package.json
    const defaultValue = config.inspect('number').defaultValue;

    // As a consequence, the 5 here is ignored
    const value = config.get('number', 5);

    vscode.window.showInformationMessage(`defaultValue = ${defaultValue} / value = ${value}`);
}

// this method is called when your extension is deactivated
export function deactivate() {
}