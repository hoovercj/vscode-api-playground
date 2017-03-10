# New File with Language Mode

## Summary
This extension adds two types of commands to open a new file with a specified language mode.

* `editor.newFile.withCurrentLanguageMode` will open a new file with the same language mode as the currently active file
* `editor.newFile.withLanguageMode.<languageId>` will open a new file with specified id as the language mode. Commands are automatically created for each language known to VS Code, so you only need to set up a keybinding (described [below](#how-to-use)).

The motivation for the first is that if you are working in a project, you might know that you need a new file of the same type but you don't know what to name it yet. Don't waste time coming up with a name just so you can save it and set the language mode and don't waste time manually setting the language mode. Simply assign a keyboard shortcut and start coding.

The second command type is to help people that find themselves frequently opening markdown files to take throwaway notes in, or frequently opening typescript/powershell/python files to prototype scripts in, and want a quick way to get a scratchpad open in the language of their choice with the language features active.

## Inspiration:
A stackoverflow user asked if it was possible to create a .HTML file when opening a new file in [this question](https://stackoverflow.com/questions/42677180/is-there-a-way-to-make-visual-code-create-html-file-by-default/). As far as I know there is not a built in way, but the `workspace.openTextDocument` API allows specifying a language mode for untitled files, so I created an extension that can do that and more.

## How to Use:
The extension exposes a command called `editor.newFile.withCurrentLanguageMode` which can be added to the keybindings or can be triggered by searching for "Open new file with current language mode" in the command palette. Triggering that command will open a new file with the language mode of the current active document.

The extension also creates commands for each language that can be bound to keybindings. I've shown two examples below:

keybindings.json:
```
{
    "key": "ctrl+shift+t 1",
    "command": "editor.newFile.withLanguageMode.markdown",
    "when": ""
},
{
    "key": "ctrl+shift+t 2",
    "command": "editor.newFile.withLanguageMode.html",
    "when": ""
}
```

To find the language id, click on the language id in the lower right corner of the VS Code window OR open the command palette, type "Change Languae Mode", and press enter. This will bring up a list of the known languages. The value in parenthesis is the language id. You should also be able to see a list of the available commands at the bottom of the keybindings editor.

## See More

This is a part of the my [API Playground repository](https://www.github.com/hoovercj/vscode-api-playground). Each subdirectory is a self-contained extension that demonstrates a particular API, repros a bug, answers a stackoverflow question, etc.


## Apis Used:
* [Commands](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_commands) - The commands API provides a way to add commands which can be triggered from the command palette or via key bindings. As demonstrated in this extension, they can be generated dynamically at runtime to create rich, semantic commands.
* [Languages](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_languages) - The languages API handles language specific features for VS Code. It exposes advanced features such as symbol navigation, formatting, etc. but in this extension I am only using it to get the list of supported languages.

## Release Notes

### 1.1.0
* REMOVED Configuration: `editor.newFile.languageModes`, now commands are created automatically so any existing commands should still work

### 1.0.0
* Added Command: `editor.newFile.withCurrentLanguageMode`
* Added Command: `editor.newFile.withLanguageMode.<language id>`
* Added Configuration: `editor.newFile.languageModes`


### 0.0.1

Initial release with simple command for opening new file of a configured type.