'use strict';
import { ExtensionContext, workspace, window, commands as Commands, languages } from 'vscode';

const deepEqual = require('deep-equal')

let ctx: ExtensionContext;
let customCommands = [];
export function activate(context: ExtensionContext) {
    ctx = context;
    createCommandsForSettings();

    workspace.onDidChangeConfiguration(() => createCommandsForSettings());
}

interface Command {
    setting: string;
    values: any[];
    // scope: string;
}

function cycleSetting(command: Command): void {
    if (!command.setting || command.values.length === 0) {
        return;
    }
    
    // Cycle the setting
    const config = workspace.getConfiguration();
    const setting = config.inspect(command.setting);
    const global = useGlobal(command, setting);
    // The current value should be the current value with respect
    // to the result of useGlobal. 
    let currentValue = global ? setting.globalValue : setting.workspaceValue;
    if (currentValue == null) {
        currentValue = setting.defaultValue;
    }
    const newValue = getNewValue(command, currentValue);

    config.update(command.setting, newValue, global);
}

function getNewValue(command: Command, currentValue: any): any {
    // Find the index of the current value in the command values array,
    // or -1 if the current value is not one of the configured values
    let index = command.values.findIndex(commandValue => {
        return deepEqual(commandValue, currentValue);
    });

    if (index == null) {
        index = -1;
    }

    // Index points to the index of the current value in the command values array or -1.
    // Adding 1 to the index will point to the next value in the command values array,
    // or it will point to the first value in the case that current value wasn't found.
    // If the index was incremented past the last value, modulus will wrap it to the beginning.
    return command.values[(index + 1) % command.values.length];
}

function useGlobal(command: Command, setting: { key: string; globalValue?: {}; workspaceValue?: {}; }): boolean {
    // TODO: If the scope is specified as global and the workspace setting shadows it, it doesn't update
    // Scope is removed from package.json until the above behavior is changed

    // Command settings take priority
    // if (command.scope === 'user') {
    //     return true;
    // } else if (command.scope === 'workspace') {
    //     return false;
    // }
    // After command settings, replace the innermost setting
    if (setting.workspaceValue != null) {
        return false;
    } else if (setting.globalValue != null) {
        return true;
    }

    // If there is no setting, default to workspace
    return false;
}

function createCommandsForSettings(): void {
    disposeCustomCommands();
    const config = workspace.getConfiguration('settings');
    const commands = config.get<Command[]>('cycle');

    commands.forEach(command => {
        customCommands.push(Commands.registerCommand(`settings.cycle.${command.setting}`, () => {
            cycleSetting(command);
        }));
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