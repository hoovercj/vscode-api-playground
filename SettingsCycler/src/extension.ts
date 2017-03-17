'use strict';
import { ExtensionContext, workspace, window, commands as Commands, languages, WorkspaceConfiguration } from 'vscode';

const deepEqual = require('deep-equal')

let ctx: ExtensionContext;
let customCommands = [];
export function activate(context: ExtensionContext) {
    ctx = context;
    createCommandsForSettings();

    registerUtilityCommands()

    workspace.onDidChangeConfiguration(() => createCommandsForSettings());
}

interface Command {
    setting: string;
    values: any[];
    // scope: string;
}

interface CurrentSetting {
    value: any,
    global: boolean
}

function registerUtilityCommands() {
    Commands.registerCommand('settings.cycle.show', function () {
        const config = workspace.getConfiguration();
        const commands = workspace.getConfiguration('settings').get<Command[]>('cycle');
        window.showQuickPick(commands.reduce(function(o, c) {
            o.push(`${c.setting} : ${ JSON.stringify(getCurrentSetting(c, config).value) }`)
            return o
        },[])).then((selection:string) => {
            if(selection) {
                const setting = selection.split(' : ')
                if(setting.length) {
                    var command = commands.filter(cmd => {
                        return cmd.setting == setting[0]
                    })
                    if(command.length) cycleSetting(command[0])
                }
            }
        })
    })
}

function getCurrentSetting(command: Command, config: WorkspaceConfiguration): CurrentSetting {
    if (!command.setting) {
        return;
    }

    // Cycle the setting
    const setting = config.inspect(command.setting);
    const global = useGlobal(command, setting);
    // The current value should be the current value with respect
    // to the result of useGlobal. 
    let currentValue = global ? setting.globalValue : setting.workspaceValue;
    if (currentValue == null) {
        currentValue = setting.defaultValue;
    }
    return {value: currentValue, global: global}
}

function cycleSetting(command: Command): void {
    const config = workspace.getConfiguration();

    let current = getCurrentSetting(command, config)
    const newValue = getNewValue(command, current.value);

    config.update(command.setting, newValue, current.global);
}

function getNewValue(command: Command, currentValue: any): any {
    // Find the index of the current value in the command values array,
    // or -1 if the current value is not one of the configured values
    
    const values = command.values || [true, false];
    let index = values.findIndex(commandValue => {
        return deepEqual(commandValue, currentValue);
    });

    if (index == null) {
        index = -1;
    }

    // Index points to the index of the current value in the command values array or -1.
    // Adding 1 to the index will point to the next value in the command values array,
    // or it will point to the first value in the case that current value wasn't found.
    // If the index was incremented past the last value, modulus will wrap it to the beginning.
    return values[(index + 1) % values.length];
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