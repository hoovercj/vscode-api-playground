'use strict';
import { ExtensionContext, workspace, WorkspaceConfiguration, window, commands as Commands, languages } from 'vscode';

const deepEqual = require('deep-equal')

type Dictionary<V> = { [key: string]: V };

let ctx: ExtensionContext;
let customCommands = [];
var indexCache: Dictionary<number> = {};

export function activate(context: ExtensionContext) {
    ctx = context;
    createCommandsForSettings();

    workspace.onDidChangeConfiguration(() => createCommandsForSettings());
}

enum Scope {
    Global,
    Workspace,
    None
}

class Command {
    id: string;
    values: Dictionary<any>[];
    overrideWorkspaceSettings: boolean
}

function cycleSetting(command: Command): void {
    if (!command || !command.id) {
        // window.showErrorMessage(`Please make sure your 'args' is not empty`);
        return;
    }
    
    const config = workspace.getConfiguration();

    if (!command.values) {
        // TODO: Assume the id is a setting and toggle it
        return;
    }    

    // Decide which scope (if at all) to set
    const commandSettings = getCommandSettings(command);
    const scope = getScopeForCommand(commandSettings, command.overrideWorkspaceSettings, config);
    if (scope === Scope.None) {
        // vscode.window.showErrorMessage(`We cannot toggle option ${val.key} as it is overriden in current workspace. Set \`"overrideWorkspaceSettings": true\` for this setting to override anyway.`); 
        return;
    }
    const useGlobal = scope === Scope.Global;
    const currentSettings = getCurrentSettings(commandSettings, config, useGlobal)
    const index = getNextIndex(command, config, indexCache);
    setNewSettings(command.values[index], config, useGlobal);
    indexCache[command.id] = index;
}

function getCommandSettings(command: Command): Set<string> {
    const allSettings = new Set<string>();
    command.values.forEach(value => 
        Object.keys(value).forEach(setting => 
            allSettings.add(setting)
        )
    );

    return allSettings;
}

function getCurrentSettings(settingsIds: Set<string>, config: WorkspaceConfiguration, useGlobal: boolean): Dictionary<any> {
    let currentOptions: Dictionary<any> = {};
    for (let key of Object.keys(settingsIds.values())) {
        let val = config.inspect(key);
        if (useGlobal) {
            currentOptions[key] = val.globalValue !== undefined ? val.globalValue : val.defaultValue;
        } else {
            currentOptions[key] = val.globalValue !== undefined ? val.workspaceValue : val.defaultValue;
        }
    }
    return currentOptions;
}

function getNextIndex(command: Command, currentSettings: Dictionary<any>, indexCache?: Dictionary<number>): number {

    if (indexCache && indexCache[command.id] !== undefined) {
        return (indexCache[command.id] + 1) % command.values.length;
    }

    // TODO: This assumes that the list of settings will be the same at each stage
    for (let index = 0; index < command.values.length; index++) {
        const candidate = command.values[index];
        if (deepEqual(candidate, currentSettings)) {
            return (index + 1) % command.values.length;;
        }
    }

    return 0;
}

function setNewSettings(newSettings: Dictionary<any>, config: WorkspaceConfiguration, useGlobal: boolean) {
    Object.keys(newSettings).forEach(key => {
        config.update(key, newSettings[key], useGlobal);
    });
}

function getScopeForCommand(settingsIds: Set<string>, overrideWorkspaceSettings: boolean, config: WorkspaceConfiguration): Scope {

    let scope = Scope.Global;

    for (let key of settingsIds.values()) {
        let setting = config.inspect(key);
        let settingScope = getScopeForSetting(overrideWorkspaceSettings, setting);
        if (settingScope === Scope.None) {
            return Scope.None;
        } else if (settingScope === Scope.Workspace) {
            scope = settingScope;
        }
    }
    return scope;
}

function getScopeForSetting(overrideWorkspaceSettings: boolean, setting: { key: string; globalValue?: {}; workspaceValue?: {}; }): Scope {
    // TODO: If the scope is specified as global and the workspace setting shadows it, it doesn't update
    // Scope is removed from package.json until the above behavior is changed

    const hasWorkspaceValue = setting.workspaceValue != null;
    
    // Default to global if there is no workspace setting
    if (!hasWorkspaceValue) {
        return Scope.Global;
    // If there is a workspace setting, only override it if
    // the settings say to.
    } else if (overrideWorkspaceSettings) {
        return Scope.Workspace;
    // If they don't say to override, set the scope to none.
    // This is because updating the settings won't do anything
    // anyway until the TODO above is addressed.    
    } else {
        return Scope.None;
    }
}

function createCommandsForSettings(): void {
    disposeCustomCommands();
    const config = workspace.getConfiguration('settings');
    const commands = config.get<Command[]>('cycle');

    commands.forEach(command => {
        customCommands.push(Commands.registerCommand(`settings.cycle.${command.id}`, () => {
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