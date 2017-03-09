# New File with Language Mode

## Summary
This extension adds two types of commands to open a new file with a specified language mode.

* `editor.newFile.withCurrentLanguageMode` will open a new file with the same language mode as the currently active file
* `editor.newFile.withLanguageMode.<languageId>` will open a new file with specified id as the language mode. The language must be first added to the configuration and a keybinding set up (described [below](#how-to-use)).

The motivation for the first is that if you are working in a project, you might know that you need a new file of the same type but you don't know what to name it yet. Don't waste time coming up with a name just so you can save it and set the language mode and don't waste time manually setting the language mode. Simply assign a keyboard shortcut and start coding.

The second command type is to help people that find themselves frequently opening markdown files to take throwaway notes in, or frequently opening typescript/powershell/python files to prototype scripts in, and want a quick way to get a scratchpad open in the language of their choice with the language features active.

## Inspiration:
A stackoverflow user asked if it was possible to create a .HTML file when opening a new file in [this question](https://stackoverflow.com/questions/42677180/is-there-a-way-to-make-visual-code-create-html-file-by-default/). As far as I know there is not a built in way, but the `workspace.openTextDocument` API allows specifying a language mode for untitled files, so I created an extension that can do that and more.

## How to Use:
The extension exposes a command called `editor.newFile.withCurrentLanguageMode` which can be added to the keybindings or can be triggered by searching for "Open new file with current language mode" in the command palette. Triggering that command will open a new file with the language mode of the current active document.

The extension also contributes a configuration setting called `editor.newFile.languageModes` which takes an array of language ids. These ids will then be read and used to create commands that can be configured to keyboard shortcuts as shown below:

settings.json:
```
    "editor.newFile.languageModes": ["markdown", "html"]
```

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

To find the language id, click on the language id in the lower right corner of the VS Code window OR open the command palette, type "Change Languae Mode", and press enter. This will bring up a list of the known languages. The value in parenthesis is the language id.

## See More

This is a part of the my [API Playground repository](https://www.github.com/hoovercj/vscode-api-playground). Each subdirectory is a self-contained extension that demonstrates a particular API, repros a bug, answers a stackoverflow question, etc.


## Apis Used:
* [Commands](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_commands) - The commands API provides a way to add commands which can be triggered from the command palette or via key bindings. As demonstrated in this extension, they can be generated dynamically at runtime to create rich, semantic commands.
* [Configuration](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_a-nameworkspaceconfigurationaspan-classcodeitem-id855workspaceconfigurationspan) - The Configuration API provides a way to interact with user and workspace settings.

## Release Notes

### 1.0.0
* Command: `editor.newFile.withCurrentLanguageMode`
* Command: `editor.newFile.withLanguageMode.<language id>`
* Configuration: `editor.newFile.languageModes`


### 0.0.1

Initial release with simple command for opening new file of a configured type.