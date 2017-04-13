/* --------------------------------------------------------------------------------------------
 * Copyright (c) Cody Hoover. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { OutputChannel, window } from 'vscode';

export enum LogLevel {
    none,
    error,
    warn,
    info,
    log
}

export interface ILogger {
    setLogLevel(level: LogLevel): void;
    error(message: string): void;
    warn(message: string): void;
    info(message: string): void;
    log(message: string): void;
    dispose(): void;
}

export class Logger implements ILogger {
    private level: LogLevel;
    private outputChannel: OutputChannel;

    public constructor(level: LogLevel = LogLevel.error) {
        this.level = level;
        this.outputChannel = window.createOutputChannel('Settings Cycler');
    }

    public setLogLevel(level: LogLevel): void {
        console.log('Settings Cycler: Log level ' + level);
        this.level = level;
    }

    public log(message: string): void {
        if (this.level >= LogLevel.log) {
            console.log('Settings Cycler: ' + message);
            this.outputChannel.appendLine(message);
        }
    }

    public info(message: string): void {
        if (this.level >= LogLevel.info) {
            console.info('Settings Cycler: ' + message);
            this.outputChannel.appendLine(message);
        }
    }

    public warn(message: string): void {
        if (this.level >= LogLevel.warn) {
            console.warn('Settings Cycler: ' + message);
            this.outputChannel.appendLine(message);
        }
    }

    public error(message: string): void {
        if (this.level >= LogLevel.error) {
            console.error('Settings Cycler: ' + message);
            this.outputChannel.appendLine(message);
        }
    }

    public dispose(): void {
        if (this.outputChannel) {
            this.outputChannel.dispose();
        }
    }
}
