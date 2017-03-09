# Focus Active Editor

## Summary
Each time the active editor changes, this extension makes sure the file tree on the left is collapsed and focuses on the currently active file. In addition with the visual highlight of the active file, this helps the eye see where in the folder hierarchy the active file is.

## Inspiration:
In [this question](https://stackoverflow.com/questions/42673828/how-to-collapse-explorer-folders-before-focusing-a-file-in-vcode), a stackoverflow user asked if it was possible to automatically collapse folders while switching between documents. To my knowledge, this is not possible without an extension, so I created.

## How to Use:
Simply install the extension. As you change documents you'll notice that all directories are collapsed except the one that contains the file you are currently editing.

## Apis Used:
* [window.onDidChangeActiveTextEditor]() - An event that is triggerd when the active text editor changes
* [commands.executeCommand]() - A function that allows executing built in commands or commands that are provided by the extension. In this case, I execute:
  * `workbench.files.action.collapseExplorerFolders` to collapse the folders
  * `workbench.files.action.showActiveFileInExplorer` to re-focus on the active file in the tree view which expands only the necessary directories
  * `workbench.action.focusActiveEditorGroup` to put the cursor focus back in the file that was opened

## See More

This is a part of the my API Playground repository. Each subdirectory is a self-contained extension that demonstrates a particular API, repros a bug, answers a stackoverflow question, etc.

## Release Notes

### 0.0.1

Initial release that collapses and then focuses the active file each time the active editor changes