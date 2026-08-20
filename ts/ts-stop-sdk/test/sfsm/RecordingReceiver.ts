import { ICommandReceiver } from "@vsirotin/ts-stop";

/**
 * Minimal ICommandReceiver that records every command received.
 */
export class RecordingReceiver implements ICommandReceiver {
    public calls: Array<{ command: string; data?: unknown; }> = [];

    receiveCommand(command: string, data?: unknown): void {
        this.calls.push({ command, data });
    }

    reset(): void {
        this.calls = [];
    }

    getCommandNames(): readonly string[] {
        return this.calls.map(call => call.command);
    }
}