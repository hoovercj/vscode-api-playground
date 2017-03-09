# New File with Language Mode

## Summary
This extension adds a command to open a new file with a specified language mode. The idea being, if you primarily create typescript projects, rather than "ctrl+n" opening an untitled file with no type (or type text), you can use this command to open a file that will default to being in typescript mode.

## Inspiration:
A stackoverflow user asked if it was possible to create a .HTML file when opening a new file in [this question](https://stackoverflow.com/questions/42677180/is-there-a-way-to-make-visual-code-create-html-file-by-default/). As far as I know there is not a built in way, but the `workspace.openTextDocument` API allows specifying a language mode for untitled files, so I created an extension that can.

## How to Use:
The extension exposes a command called `editor.newFile.withLanguageMode` which can be added to the keybindings or can be triggered by searching for "Open new file with default language mode" in the command palette.

Triggering that command will open a new file with the language mode specified in the user or workspace setting `editor.newFile.defaultLanguageMode`. For example, to always open HTML files, use the setting:

```
"editor.newFile.defaultLanguageMode": "html"
```

## Possible Enhancements
* Add a command that will default to opening a new file of the same type as the currently active file

## Apis Used:
* [Commands](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_commands) - The commands API provides a way to add commands which can be triggered from the command palette or via key bindings
* [Configuration](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_a-nameworkspaceconfigurationaspan-classcodeitem-id855workspaceconfigurationspan) - The Configuration API provides a way to interact with user and workspace settings.

## See More

This is a part of the my API Playground repository. Each subdirectory is a self-contained extension that demonstrates a particular API, repros a bug, answers a stackoverflow question, etc.

## Release Notes

### 0.0.1

Initial release with simple command for opening new file of a configured type.