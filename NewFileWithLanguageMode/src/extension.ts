'use strict';
import { ExtensionContext, workspace, window, commands, languages } from 'vscode';

let ctx: ExtensionContext;
let customCommands = [];
export function activate(context: ExtensionContext) {
    ctx = context;
    createCommandsForLanguages();

    const command = commands.registerCommand('editor.newFile.withCurrentLanguageMode', () => {
        const language = window.activeTextEditor.document.languageId
        openTextDocumentWithLanguageId(language);
    });

    ctx.subscriptions.push(command);
}

/**
 * Opens a text document with the provided language id.
 * If no id is provided, or the id is an empty string,
 * a document with no language mode will be opened.
 * @param {string} language The id of the language mode to open the document with.
 */
function openTextDocumentWithLanguageId(language: string): void {
    const options = language ? {language} : null;
    workspace.openTextDocument(options).then((document) => window.showTextDocument(document));
}

/**
 * Creates a new command for every valid language id.
 * It gets the list of languages from vscode,
 * and for each language it creates a command
 * of the form `editor.newFile.withLanguageMode.<language>`.
 * These can then be configured to be triggered via keyboard shortcuts.
 */
function createCommandsForLanguages(): void {
    disposeCustomCommands();
    languages.getLanguages().then(languageList => {
        languageList.forEach(language => {
            customCommands.push(commands.registerCommand(`editor.newFile.withLanguageMode.${language}`, () => {
                openTextDocumentWithLanguageId(language)
            }));
        });
    });
}

function disposeCustomCommands(): void {
    customCommands.forEach(command => command.dispose());
    customCommands = [];
}

// this method is called when your extension is deactivated
export function deactivate() {
    disposeCustomCommands();
    ctx.subscriptions.forEach(subscription => subscription.dispose())
}