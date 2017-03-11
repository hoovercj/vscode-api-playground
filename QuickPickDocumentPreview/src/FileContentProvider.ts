'use strict';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * A content provider that provides content by reading from files.
 * This is useful for exposing bundled source or documentation
 * files in a readonly preview form, especially in a quickpick setting.
 * 
 * @export FileContentProvider as the default class.
 * @class FileContentProvider.
 * @implements {vscode.TextDocumentContentProvider}
 */
export default class FileContentProvider implements vscode.TextDocumentContentProvider {

	public _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private pathProvider: (filename: string) => string;
    private uri;

    public filename;
    public cache = {};

    public constructor(uri: vscode.Uri, pathProvider: (filename: string) => string) {
        this.uri = uri;
        this.pathProvider = pathProvider;
    }

	get onDidChange() {
		return this._onDidChange.event;
	}

    /**
     * This is called any time `vscode.workspace.openTextDocument` or `vscode.previewHtml`
     * are called with a uri that matches the scheme this provider is registered for.
     * It is also called any time the onDidChange event is fired with a matching uri scheme.
     * 
     * @param {vscode.Uri} uri The uri to provide content for.
     * @returns {(string | Thenable<string>)} The content for the uri.
     * 
     * @memberOf FileContentProvider
     */
    public provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
        // If there isn't currently any file selected, just return an empty string.
        if (!this.filename) {
            return '';
        }

        // If there is a cached version of the file contents available, return that.
        if (this.cache[this.filename] != null) {
            return this.cache[this.filename].getText();
        }

        // If there isn't a cached version, use the pathProvider to get the file path
        // from the filename, "open" the text document to get the text and cache it,
        // and return the text.
        return vscode.workspace.openTextDocument(new vscode.Uri().with({scheme: 'file', path: path.join(this.pathProvider(this.filename))})).then(doc => {
            this.cache[this.filename] = doc;
            return doc.getText();
        });
    }

    public clearCache() {
        this.cache = {};
    }

    /**
     * Given a filename, triggers an update of the contents
     * of files provided by this content provider.
     * 
     * @param {string} filename The name of the file to use for contents.
     * 
     * @memberOf FileContentProvider
     */
    public update(filename: string) {
        this.filename = filename;
        this._onDidChange.fire(this.uri);
    }
}