import { Sfsm } from '../../src/sfsm/Sfsm';
import { FaDefinition, FaNode, LogEntry } from '../../src/sfsm/types';
import { ICommandReceiver } from '../../src/sfsm/interfaces';

/**
 * Sfsm logging tests.
 *
 * These tests exercise the SFSM engine's logging behaviour in isolation
 * (no TransceiverHub, no external simulators): log accumulation, step
 * numbering, log-entry metadata (stack/state/signal/rule/newState/command),
 * the getLog() copy-on-read guarantee, exit-state reset at root, and the
 * $-suffix data-forwarding rules for commands. The FA definitions are
 * embedded directly in this file using the extended FaNode format so the
 * log entries carry human-readable names alongside the raw identifiers.
 */

/**
 * A minimal ICommandReceiver implementation that records every command
 * received, so tests can assert on the command stream without pulling in
 * TransceiverHub or any other higher-level class.
 */
class RecordingReceiver implements ICommandReceiver {
    public calls: Array<{ command: string; data?: unknown }> = [];

    receiveCommand(command: string, data?: unknown): void {
        this.calls.push({ command, data });
    }

    reset(): void {
        this.calls = [];
    }
}

/**
 * Embedded SFSM definitions used across the log tests.
 *
 * The turnstile FA below is intentionally self-contained: it uses the
 * extended FaNode format with states, signals, commands and ts so that the
 * resulting LogEntry objects carry human-readable names alongside the raw
 * identifiers. This mirrors the style of Sfsm.joker.test.ts, where the FA
 * definition lives inside the test file instead of being loaded from an
 * external JSON resource.
 */
const turnstileFa: FaDefinition = {
    Turnstile: {
        states: {
            'I': { name: 'Initial' },
            'Locked': { name: 'Locked' },
            'Unlocked': { name: 'Unlocked' },
            'E_ok': { name: 'Ok' }
        },
        signals: {
            'coin': { name: 'Coin inserted' },
            'push': { name: 'Push' },
            'reset': { name: 'Reset' }
        },
        commands: {
            'lock': { name: 'Lock', receiver: 'TurnstileController' },
            'unlock': { name: 'Unlock', receiver: 'TurnstileController' }
        },
        ts: [
            ['I', 'coin', 'Unlocked'],
            ['I', 'push', 'Locked'],
            ['Locked', 'coin', 'Unlocked', 'unlock'],
            ['Unlocked', 'push', 'Locked', 'lock'],
            ['Locked', 'reset', 'E_ok'],
            ['Unlocked', 'reset', 'E_ok']
        ]
    }
};

describe('Sfsm logging', () => {
    let sfsm: Sfsm;
    let receiver: RecordingReceiver;

    beforeEach(() => {
        sfsm = new Sfsm();
        receiver = new RecordingReceiver();
        sfsm.setCommandReceiver(receiver);
        sfsm.loadFA(turnstileFa);
    });

    test('log is empty right after loadFA', () => {
        expect(sfsm.getLog()).toEqual([]);
    });

    test('each processed signal appends exactly one log entry', () => {
        sfsm.receiveSignal('coin');
        sfsm.receiveSignal('push');
        sfsm.receiveSignal('coin');

        const log = sfsm.getLog();
        expect(log).toHaveLength(3);
        expect(log.map(e => e.step)).toEqual([1, 2, 3]);
    });

    test('log entry captures stack, state, signal and rule for a head-FA transition', () => {
        sfsm.receiveSignal('coin');

        const entry = sfsm.getLog()[0];
        expect(entry.stack).toEqual(['Turnstile']);
        expect(entry.state).toBe('I');
        expect(entry.stateName).toBe('Initial');
        expect(entry.signal).toBe('coin');
        expect(entry.signalName).toBe('Coin inserted');
        expect(entry.rule).toBe('2.1');
        expect(entry.newStack).toEqual(['Turnstile']);
        expect(entry.newState).toBe('Unlocked');
        expect(entry.newStateName).toBe('Unlocked');
        expect(entry.command).toBeUndefined();
    });

    test('log entry records command metadata when a command is fired', () => {
        sfsm.receiveSignal('coin');   // I -> Unlocked (no command)
        sfsm.receiveSignal('push');   // Unlocked -> Locked, fires lock

        const entry = sfsm.getLog()[1];
        expect(entry.command).toBe('lock');
        expect(entry.commandName).toBe('Lock');
        expect(entry.receiver).toBe('TurnstileController');
        expect(receiver.calls).toHaveLength(1);
        expect(receiver.calls[0].command).toBe('lock');
    });

    test('log entry step numbers are sequential and 1-based', () => {
        for (let i = 0; i < 5; i++) {
            sfsm.receiveSignal(i % 2 === 0 ? 'coin' : 'push');
        }
        expect(sfsm.getLog().map(e => e.step)).toEqual([1, 2, 3, 4, 5]);
    });

    test('getLog returns a copy so external mutation does not affect the engine', () => {
        sfsm.receiveSignal('coin');
        const log = sfsm.getLog();
        log.push({} as LogEntry);
        expect(sfsm.getLog()).toHaveLength(1);
    });

    test('exit-state transition at root resets the root FA to entry state', () => {
        sfsm.receiveSignal('coin');    // I -> Unlocked
        sfsm.receiveSignal('reset');   // Unlocked -> E_ok -> root resets to I

        const log = sfsm.getLog();
        // Two signals produce two log entries; the reset entry lands in E_ok
        // before the engine resets the root FA back to its entry state.
        expect(log).toHaveLength(2);
        const resetEntry = log[1];
        expect(resetEntry.state).toBe('Unlocked');
        expect(resetEntry.newState).toBe('E_ok');
        expect(resetEntry.rule).toBe('2.1');
        // After the reset the head state is back to the entry state.
        expect(sfsm.getHeadState()).toBe('I');
    });

    test('command without $ suffix does not propagate signal data', () => {
        // Replace transitions with one that fires a no-arg command.
        const fa: FaDefinition = {
            DataFA: {
                states: { 'I': { name: 'Initial' }, 'A': { name: 'A' } },
                signals: { 'go': { name: 'Go' } },
                commands: { 'ping': { name: 'Ping', receiver: 'PingController' } },
                ts: [['I', 'go', 'A', 'ping']]
            }
        };
        const local = new Sfsm();
        const rec = new RecordingReceiver();
        local.setCommandReceiver(rec);
        local.loadFA(fa);

        local.receiveSignal('go', { payload: 42 });

        expect(rec.calls).toHaveLength(1);
        expect(rec.calls[0].command).toBe('ping');
        // 'ping' has no $ suffix, so data is not forwarded.
        expect(rec.calls[0].data).toBeUndefined();
    });

    test('command with $ suffix forwards signal data to the receiver', () => {
        const fa: FaDefinition = {
            DataFA: {
                states: { 'I': { name: 'Initial' }, 'A': { name: 'A' } },
                signals: { 'go': { name: 'Go' } },
                commands: { 'ping$': { name: 'Ping', receiver: 'PingController' } },
                ts: [['I', 'go', 'A', 'ping$']]
            }
        };
        const local = new Sfsm();
        const rec = new RecordingReceiver();
        local.setCommandReceiver(rec);
        local.loadFA(fa);

        local.receiveSignal('go', { payload: 42 });

        expect(rec.calls).toHaveLength(1);
        expect(rec.calls[0].command).toBe('ping$');
        expect(rec.calls[0].data).toEqual({ payload: 42 });
    });

    test('command with $ suffix but no signal data triggers missing-data error policy', () => {
        const fa: FaDefinition = {
            DataFA: {
                states: { 'I': { name: 'Initial' }, 'A': { name: 'A' } },
                signals: { 'go': { name: 'Go' } },
                commands: { 'ping$': { name: 'Ping', receiver: 'PingController' } },
                ts: [['I', 'go', 'A', 'ping$']]
            }
        };
        const local = new Sfsm({ byMissingData: 'error' });
        const rec = new RecordingReceiver();
        local.setCommandReceiver(rec);
        local.loadFA(fa);

        expect(() => local.receiveSignal('go')).toThrow(/expects data/);
    });

    test('missing transition triggers error policy by default', () => {
        // 'push' has no transition from state I in this trimmed FA.
        const fa: FaDefinition = {
            TrimFA: {
                states: { 'I': { name: 'Initial' }, 'A': { name: 'A' } },
                signals: { 'go': { name: 'Go' } },
                ts: [['I', 'go', 'A']]
            }
        };
        const local = new Sfsm();
        local.loadFA(fa);

        expect(() => local.receiveSignal('push')).toThrow(/no transition/);
    });

    test('missing transition with log_warning policy records nothing in the log', () => {
        const fa: FaDefinition = {
            TrimFA: {
                states: { 'I': { name: 'Initial' }, 'A': { name: 'A' } },
                signals: { 'go': { name: 'Go' } },
                ts: [['I', 'go', 'A']]
            }
        };
        const local = new Sfsm({ byMissingTransition: 'log_warning' });
        local.loadFA(fa);

        // Suppress the expected warning.
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        local.receiveSignal('push');
        warnSpy.mockRestore();

        expect(local.getLog()).toEqual([]);
    });
});