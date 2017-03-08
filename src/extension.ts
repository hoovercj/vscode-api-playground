'use strict';
import { ExtensionContext } from 'vscode';

let ctx: ExtensionContext;

export function activate(context: ExtensionContext) {
    ctx = context;
    // Extension here
}

// this method is called when your extension is deactivated
export function deactivate() {
    ctx.subscriptions.forEach(subscription => subscription.dispose())
}