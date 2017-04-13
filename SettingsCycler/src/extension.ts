'use strict';
import { MessageOptions, ExtensionContext, workspace, WorkspaceConfiguration, window, commands as Commands, languages } from 'vscode';
import { ILogger, Logger, LogLevel } from './logger';

const deepEqual = require('deep-equal')

type Dictionary<V> = { [key: string]: V };

let ctx: ExtensionContext;
let customCommandDisposables = [];
let commandsSettings = [] as Command[];
var indexCache: Dictionary<number> = {};
let logger: ILogger;

export function activate(context: ExtensionContext) {
    ctx = context;
    initializeLogger();
    detectLegacySettings();
    createCommandsForSettings();
    ctx.subscriptions.push(Commands.registerCommand('settings.cycle', cycleSetting));
    workspace.onDidChangeConfiguration(onDidChangeConfiguration);
    logger.log("Activation complete");
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
    logger.info(`Cycle Setting: ${command.id}`);
    if (!command || !command.id) {
        logger.error("Error cycling setting: please specify an 'id'.");
        return;
    }
    
    if (!command.values) {
        logger.error(`Error cycling setting: no values provided for id ${command.id}`);
        return;
    }


    // Decide which scope (if at all) to set
    const config = workspace.getConfiguration();
    const commandSettings = getCommandSettings(command);
    const scope = getScopeForCommand(commandSettings, command.overrideWorkspaceSettings, config);
    if (scope === Scope.None) {
        const message = `Cannot cycle setting for ${command.id} as a setting already exists in the current workspace. Set \`"overrideWorkspaceSettings": true\` to override anyway.`;
        logger.warn(message)
        if (config.get('settings.cycle.warnOnWorkspaceSettingsCollisions', true)) {
            window.showWarningMessage(message); 
        }
        return;
    }
    const useGlobal = scope === Scope.Global;
    const currentSettings = getCurrentSettings(commandSettings, config, useGlobal)
    const index = getNextIndex(command, currentSettings, indexCache);
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

    logger.log(`"${command.id}" cycles these settings: ${[...allSettings].join(', ')}`);

    return allSettings;
}

function getCurrentSettings(settingsIds: Set<string>, config: WorkspaceConfiguration, useGlobal: boolean): Dictionary<any> {
    let currentOptions: Dictionary<any> = {};

    [...settingsIds].forEach(key => {
        let val = config.inspect(key);
        if (useGlobal) {
            currentOptions[key] = val.globalValue !== undefined ? val.globalValue : val.defaultValue;
        } else {
            currentOptions[key] = val.globalValue !== undefined ? val.workspaceValue : val.defaultValue;
        }
        logger.log('Reading current settings:');
        logger.log(`${key}: ${config.get(key)}`);
        logger.log(`-- Global: ${JSON.stringify(val.globalValue)}`);
        logger.log(`-- Workspace: ${JSON.stringify(val.workspaceValue)}`);
        logger.log(`-- Default: ${JSON.stringify(val.defaultValue)}`);
    });
    return currentOptions;
}

function getNextIndex(command: Command, currentSettings: Dictionary<any>, indexCache?: Dictionary<number>): number {

    if (indexCache && indexCache[command.id] !== undefined) {
        const cachedIndex = indexCache[command.id];
        const newIndex = (indexCache[command.id] + 1) % command.values.length;
        logger.log(`Cached ${command.id} index: ${cachedIndex}`);
        logger.log(`New ${command.id} index: ${newIndex}`);
        return newIndex;
    }

    // Note: This assumes that the list of settings will be the same at each stage
    for (let index = 0; index < command.values.length; index++) {
        const candidate = command.values[index];
        if (deepEqual(candidate, currentSettings)) {
            const newIndex = (index + 1) % command.values.length;
            logger.log(`New ${command.id} index: ${newIndex}`);
            return newIndex;
        }
    }

    logger.log(`New ${command.id} index: 0 - Actual settings don't match settings specified for ${command.id}.`);
    return 0;
}

function setNewSettings(newSettings: Dictionary<any>, config: WorkspaceConfiguration, useGlobal: boolean) {
    Object.keys(newSettings).forEach(key => {
        logger.info(`Setting ${key} in ${useGlobal ? 'global' : 'workspace'} settings: ${JSON.stringify(newSettings[key])}`);
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
        logger.log(`${setting.key} has a workspacevalue that will be overridden`);
        return Scope.Workspace;
    // If they don't say to override, set the scope to none.
    // This is because updating the settings won't do anything
    // anyway until the TODO above is addressed.    
    } else {
        return Scope.None;
    }
}

function createCommandsForSettings(): void {
    const config = workspace.getConfiguration('settings');
    const commands = config.get<Command[]>('cycle');

    // Don't dispose and create new commands these settings haven't changed
    if (deepEqual(commandsSettings, commands)) {
        logger.log(`Cycler Settings have not changed, don't create new commands`);
        return;
    }

    logger.info(`Registering commands for ${commands.map(command => command.id).join(', ')}`);
    disposeCustomCommands();
    commandsSettings = commands;
    commands.forEach(command => {
        customCommandDisposables.push(Commands.registerCommand(`settings.cycle.${command.id}`, () => {
            cycleSetting(command);
        }));
    });
}

function onDidChangeConfiguration() {
    initializeLogger();
    createCommandsForSettings();
}

function initializeLogger() {
    const logLevel = LogLevel[workspace.getConfiguration('settings.cycle').get('logLevel', 'error')];
    if (logger) {
        logger.setLogLevel(logLevel)
    } else {
        logger = new Logger(logLevel);
    }
}

function disposeCustomCommands(): void {
    customCommandDisposables.forEach(command => command.dispose());
    customCommandDisposables = [];
}

function detectLegacySettings(): void {
    const settingsConfiguration = workspace.getConfiguration('settings');
    const config = settingsConfiguration.inspect('cycle');
    const useGlobal = config.workspaceValue !== 'undefined';
    const settings: any = useGlobal ? config.globalValue : config.workspaceValue;

    if (!settings) {
        return;
    }

    const newSettings = [];
    for (let index = 0; index < settings.length; index++) {
        const oldSetting = settings[index];
        const id = oldSetting.setting;
        const oldValues = oldSetting.values;
        
        if (typeof(id) !== "string" || oldValues.length <= 0) {
            return;
        }

        const newValues = [];
        oldValues.map(value => {
            const newValue = {};
            newValue[id] = value
            newValues.push(newValue);
        });

        const newSetting = {
            id,
            values: newValues
        } as Command;
        newSettings.push(newSetting)
    }

    if (newSettings.length > 0) {
        logger.log(`Found ${newSettings.length} legacy settings`);
        window.showInformationMessage("Settings Cycler's configuration schema has changed. Automatically update your settings?", "Yes").then(value => {
            if (value === "Yes") {
                logger.log(`Converting ${newSettings.length} legacy settings to new settings.`);
                settingsConfiguration.update('cycle', newSettings, useGlobal);
            }
        });
    }
}


// this method is called when your extension is deactivated
export function deactivate() {
    disposeCustomCommands();
    logger.dispose();
    ctx.subscriptions.forEach(subscription => subscription.dispose())
}