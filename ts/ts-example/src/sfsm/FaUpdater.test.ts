/**
 * @jest-environment node
 *
 * Tests for the updateCompactFA / updateFullFA library functions and the
 * update-fa CLI script as exposed by the installed @vsirotin/ts-stop package.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import * as os from 'os';
import { FaDefinition, FaUpdate, updateCompactFA, updateFullFA, loadFAFromFile } from '@vsirotin/ts-stop/sfsm';

const testDataDir = path.resolve(__dirname, '../../../ts-stop/test/sfsm/test-data');
const scriptsDir = path.resolve(__dirname, '../../node_modules/@vsirotin/ts-stop/scripts');
const projectRoot = path.resolve(__dirname, '../..');

function load(name: string): FaDefinition {
    return loadFAFromFile(path.join(testDataDir, name));
}

// ---------------------------------------------------------------------------
// updateCompactFA – unit tests
// ---------------------------------------------------------------------------

describe('updateCompactFA', () => {

    describe('remove', () => {
        it('should remove the named FA from the result', () => {
            const result = updateCompactFA(load('turnstile-fa-compact.json'), { remove: ['CPP'] });
            expect(Object.keys(result)).not.toContain('CPP');
        });

        it('should keep all other FAs when removing one', () => {
            const result = updateCompactFA(load('turnstile-fa-compact.json'), { remove: ['CPP'] });
            expect(Object.keys(result)).toContain('TS');
            expect(Object.keys(result)).toContain('PP');
            expect(Object.keys(result)).toContain('BPP');
        });

        it('should prune transitions targeting the removed FA from all remaining FAs', () => {
            const result = updateCompactFA(load('turnstile-fa-compact.json'), { remove: ['CPP'] });
            for (const transitions of Object.values(result)) {
                for (const t of transitions as [string, string, string, string?][]) {
                    expect(t[2]).not.toBe('CPP');
                }
            }
        });

        it('should not mutate the source definition', () => {
            const source = load('turnstile-fa-compact.json');
            const sourceCopy = JSON.parse(JSON.stringify(source));
            updateCompactFA(source, { remove: ['CPP'] });
            expect(source).toEqual(sourceCopy);
        });
    });

    describe('add', () => {
        it('should add a new FA key that was not in the source', () => {
            const update: FaUpdate = { add: { 'CCPP': [['I', 'CCRD.sw$', 'C', 'CCRD.c$']] } };
            const result = updateCompactFA(load('turnstile-fa-compact.json'), update);
            expect(Object.keys(result)).toContain('CCPP');
        });

        it('should replace an existing FA key with the new transitions', () => {
            const newTs: [string, string, string][] = [['I', 'X.y', 'Z']];
            const result = updateCompactFA(load('turnstile-fa-compact.json'), { add: { TS: newTs } });
            expect(result['TS']).toEqual(newTs);
        });
    });

    describe('round-trip: coins → credit card', () => {
        it('should produce the expected cc compact FA', () => {
            const result = updateCompactFA(
                load('turnstile-fa-compact.json'),
                load('turnstile-to-cc-update-compact.json') as unknown as FaUpdate
            );
            expect(result).toEqual(load('turnstile-fa-compact-cc.json'));
        });

        it('result should have TS, PP, BPP, CCPP keys', () => {
            const result = updateCompactFA(
                load('turnstile-fa-compact.json'),
                load('turnstile-to-cc-update-compact.json') as unknown as FaUpdate
            );
            expect(Object.keys(result)).toEqual(['TS', 'PP', 'BPP', 'CCPP']);
        });

        it('result should not contain CPP', () => {
            const result = updateCompactFA(
                load('turnstile-fa-compact.json'),
                load('turnstile-to-cc-update-compact.json') as unknown as FaUpdate
            );
            expect(Object.keys(result)).not.toContain('CPP');
        });

        it('TS transitions should use CCRD.sw$ and not CR.cc$', () => {
            const result = updateCompactFA(
                load('turnstile-fa-compact.json'),
                load('turnstile-to-cc-update-compact.json') as unknown as FaUpdate
            );
            const signals = (result['TS'] as [string, string, string][]).map(t => t[1]);
            expect(signals).toContain('CCRD.sw$');
            expect(signals).not.toContain('CR.cc$');
        });
    });
});

// ---------------------------------------------------------------------------
// updateFullFA – unit tests
// ---------------------------------------------------------------------------

describe('updateFullFA', () => {

    describe('remove', () => {
        it('should remove the named sub-FA from its parent states', () => {
            const result = updateFullFA(load('turnstile-fa.json'), { remove: ['CPP'] }) as any;
            expect(Object.keys(result['TS']['states']['PP']['states'])).not.toContain('CPP');
        });

        it('should prune parent ts transitions targeting the removed FA', () => {
            const result = updateFullFA(load('turnstile-fa.json'), { remove: ['CPP'] }) as any;
            const targets = (result['TS']['states']['PP']['ts'] as [string, string, string][]).map(t => t[2]);
            expect(targets).not.toContain('CPP');
        });

        it('should keep sibling FAs (BPP) untouched', () => {
            const result = updateFullFA(load('turnstile-fa.json'), { remove: ['CPP'] }) as any;
            expect(Object.keys(result['TS']['states']['PP']['states'])).toContain('BPP');
        });

        it('should not mutate the source definition', () => {
            const source = load('turnstile-fa.json');
            const sourceCopy = JSON.parse(JSON.stringify(source));
            updateFullFA(source, { remove: ['CPP'] });
            expect(source).toEqual(sourceCopy);
        });
    });

    describe('add (replace)', () => {
        it('should replace the root FA when its key is in add', () => {
            const newTs = { states: {}, signals: {}, commands: {}, ts: [['I', 'X.y', 'Z'] as [string, string, string]] };
            const result = updateFullFA(load('turnstile-fa.json'), { add: { TS: newTs } }) as any;
            expect(result['TS']['ts']).toEqual([['I', 'X.y', 'Z']]);
        });

        it('should replace a nested FA (PP) in-place', () => {
            const newPp = { states: {}, signals: {}, commands: {}, ts: [['I', 'X.y', 'Z'] as [string, string, string]] };
            const result = updateFullFA(load('turnstile-fa.json'), { add: { PP: newPp } }) as any;
            expect(result['TS']['states']['PP']['ts']).toEqual([['I', 'X.y', 'Z']]);
        });
    });

    describe('round-trip: coins → credit card', () => {
        it('should produce the expected cc extended FA', () => {
            const result = updateFullFA(
                load('turnstile-fa.json'),
                load('turnstile-to-cc-update-full.json') as unknown as FaUpdate
            );
            expect(result).toEqual(load('turnstile-fa-cc.json'));
        });

        it('PP states should contain CCPP and not CPP', () => {
            const result = updateFullFA(
                load('turnstile-fa.json'),
                load('turnstile-to-cc-update-full.json') as unknown as FaUpdate
            ) as any;
            const ppStates = result['TS']['states']['PP']['states'];
            expect(Object.keys(ppStates)).toContain('CCPP');
            expect(Object.keys(ppStates)).not.toContain('CPP');
        });

        it('TS transitions should use CCRD.sw$ and not CR.cc$', () => {
            const result = updateFullFA(
                load('turnstile-fa.json'),
                load('turnstile-to-cc-update-full.json') as unknown as FaUpdate
            ) as any;
            const signals = (result['TS']['ts'] as [string, string, string][]).map(t => t[1]);
            expect(signals).toContain('CCRD.sw$');
            expect(signals).not.toContain('CR.cc$');
        });
    });
});

// ---------------------------------------------------------------------------
// update-fa CLI – integration tests
// ---------------------------------------------------------------------------

describe('update-fa CLI', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'update-fa-test-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function runUpdateFa(format: 'compact' | 'full', args: string[]): { stdout: string; stderr: string; exitCode: number } {
        const scriptPath = path.join(scriptsDir, 'update-fa.js');
        const result = childProcess.spawnSync(
            process.execPath,
            [scriptPath, `--format=${format}`, ...args],
            { encoding: 'utf-8', cwd: projectRoot }
        );
        return {
            stdout: result.stdout ?? '',
            stderr: result.stderr ?? '',
            exitCode: result.status ?? 1
        };
    }

    it('test_updateFaCli_compact_round_trip_produces_expected_output', () => {
        const resultFile = path.join(tmpDir, 'result.json');
        const source = path.join(testDataDir, 'turnstile-fa-compact.json');
        const update = path.join(testDataDir, 'turnstile-to-cc-update-compact.json');
        const expected = path.join(testDataDir, 'turnstile-fa-compact-cc.json');

        const { exitCode } = runUpdateFa('compact', [`--source=${source}`, `--update=${update}`, `--result=${resultFile}`]);

        expect(exitCode).toBe(0);
        const result: FaDefinition = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
        expect(result).toEqual(JSON.parse(fs.readFileSync(expected, 'utf-8')));
    });

    it('test_updateFaCli_full_round_trip_produces_expected_output', () => {
        const resultFile = path.join(tmpDir, 'result.json');
        const source = path.join(testDataDir, 'turnstile-fa.json');
        const update = path.join(testDataDir, 'turnstile-to-cc-update-full.json');
        const expected = path.join(testDataDir, 'turnstile-fa-cc.json');

        const { exitCode } = runUpdateFa('full', [`--source=${source}`, `--update=${update}`, `--result=${resultFile}`]);

        expect(exitCode).toBe(0);
        const result: FaDefinition = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
        expect(result).toEqual(JSON.parse(fs.readFileSync(expected, 'utf-8')));
    });

    it('test_updateFaCli_missing_source_exits_nonzero', () => {
        const update = path.join(testDataDir, 'turnstile-to-cc-update-compact.json');
        const { exitCode } = runUpdateFa('compact', [`--update=${update}`]);
        expect(exitCode).not.toBe(0);
    });

    it('test_updateFaCli_missing_update_exits_nonzero', () => {
        const source = path.join(testDataDir, 'turnstile-fa-compact.json');
        const { exitCode } = runUpdateFa('compact', [`--source=${source}`]);
        expect(exitCode).not.toBe(0);
    });
});
