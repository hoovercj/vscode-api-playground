'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import FileContentProvider from './FileContentProvider';

// The command to trigger this extension.
const COMMAND = 'licenses.preview';

// The scheme to provide content for (i.e the 'file' part of 'file://<filepath>').
const SCHEME = 'licensepreview';
// This will show up as the tab title.
const PATH = 'license.preview';
// Since we want to reuse a single preview pane, we define one uri up front to reuse.
const URI = new vscode.Uri().with({scheme: SCHEME, path: PATH}); 

let ctx: vscode.ExtensionContext;
let filenames = [] as string[];

export function activate(context: vscode.ExtensionContext) {
    ctx = context;
    const directoryPath = context.asAbsolutePath('licenses');

    // Since the files we need are bundled with the extension,
    // we Populate the list of filenames asyncronously as the
    // extension activates so we don't have to do it every time
    // the command is invoked.
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }

        filenames = files;
    });

    // This function allows the TextDocumentContentProvider
    // to map filenames to full paths without having to know
    // if the filenames passed in are absolute or relative,
    // or what they are relative to.
    const pathProvider = (filename: string) => {
        return path.join(directoryPath, filename);
    }

    const provider = new FileContentProvider(URI, pathProvider);

    // Registering a provider for a given scheme means that all calls to "vscode.workspace.openTextDocument"
    // or "vscode.previewHtml" will get their content from the provider.
    const disposable1 = vscode.workspace.registerTextDocumentContentProvider(SCHEME, provider);

    const disposable2 = vscode.commands.registerCommand(COMMAND, async () =>
    {
        provider.clearCache();
 
        // Open a document with the predefined URI and then show it.
        const doc = await vscode.workspace.openTextDocument(URI);
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : vscode.ViewColumn.One;
        const editor = await vscode.window.showTextDocument(doc, column, true); 

        // Show a quick pick with a list of licenses.
        const pick = await vscode.window.showQuickPick(filenames, {
            // Each time a new item is focused, pass the selection to the provider.
            // This will make VS Code refresh the document contents to show the new item.
            onDidSelectItem: async (license) => provider.update(license)
        });

        // If nothing was selected and the currently active editor is the preview editor, close it.
        if (!pick && vscode.window.activeTextEditor.document.uri.scheme === URI.scheme) {
            vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        }

        // TODO: Next VS Code update has the ability to provide content to the file.
        // Use that instead of leaving the preview editor open.
        // const content = await provider.provideTextDocumentContent(URI);
        // vscode.workspace.openTextDocument({language: 'markdown', content: content})
    });

    context.subscriptions.push(disposable1, disposable2);
}

// This method is called when your extension is deactivated.
export function deactivate() {
    ctx.subscriptions.forEach(subscription => subscription.dispose());
}