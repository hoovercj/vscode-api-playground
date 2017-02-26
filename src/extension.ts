'use strict';
import { ExtensionContext } from 'vscode';
import { SymbolKindIconPreviewDocumentSymbolProvider } from './symbolKindIconPreviewDocumentSymbolProvider';

let ctx: ExtensionContext;

export function activate(context: ExtensionContext) {
    ctx = context;
    const symbolKindPreviewDocumentSymbolProvider = new SymbolKindIconPreviewDocumentSymbolProvider(context);
    symbolKindPreviewDocumentSymbolProvider.register();
}

// this method is called when your extension is deactivated
export function deactivate() {
    ctx.subscriptions.forEach(subscription => subscription.dispose())
}