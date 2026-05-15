/**
 * @jest-environment node
 *
 * Tests for the reduceFA library function and the reduce-fa CLI script as
 * exposed by the installed @vsirotin/ts-stop package.
 *
 * Round-trip tests that require physical-device simulators are intentionally
 * omitted here — they live in ts-stop/test where the simulators reside.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import * as os from 'os';
import { FaDefinition, Transition, reduceFA } from '@vsirotin/ts-stop/sfsm';

const testDataDir = path.resolve(__dirname, '../../../ts-stop/test/sfsm/test-data');
const scriptsDir = path.resolve(__dirname, '../../node_modules/@vsirotin/ts-stop/scripts');
const projectRoot = path.resolve(__dirname, '../..');

function loadExtendedFa(): FaDefinition {
    return JSON.parse(fs.readFileSync(path.join(testDataDir, 'turnstile-fa.json'), 'utf-8')) as FaDefinition;
}

function loadCompactFa(): FaDefinition {
    return JSON.parse(fs.readFileSync(path.join(testDataDir, 'turnstile-fa-compact.json'), 'utf-8')) as FaDefinition;
}

// ---------------------------------------------------------------------------
// reduceFA – output shape
// ---------------------------------------------------------------------------

describe('reduceFA – output shape', () => {
    let reduced: FaDefinition;

    beforeAll(() => {
        reduced = reduceFA(loadExtendedFa());
    });

    it('should return a non-null object', () => {
        expect(typeof reduced).toBe('object');
        expect(reduced).not.toBeNull();
    });

    it('all values in the output should be Transition arrays', () => {
        for (const [, value] of Object.entries(reduced)) {
            expect(Array.isArray(value)).toBe(true);
        }
    });

    it('should contain all FA names: TS, PP, BPP, CPP', () => {
        expect(Object.keys(reduced)).toContain('TS');
        expect(Object.keys(reduced)).toContain('PP');
        expect(Object.keys(reduced)).toContain('BPP');
        expect(Object.keys(reduced)).toContain('CPP');
    });

    it('TS transitions should match the original ts array', () => {
        const tsTransitions = reduced['TS'] as Transition[];
        expect(tsTransitions).toEqual([
            ['I', 'TS.s', 'L'],
            ['L', 'BR.bc$', 'PP'],
            ['L', 'CR.cc$', 'PP'],
            ['PP', 'BA.n', 'U', 'TS.ut'],
            ['PP', 'CA.n', 'U', 'TS.ut'],
            ['PP', 'CH.d', 'U', 'TS.ut'],
            ['PP', 'RE.d', 'L', 'TS.l'],
            ['U', 'TS.to', 'L', 'TS.l'],
            ['U', 'TS.ps', 'L', 'TS.l']
        ]);
    });

    it('BPP transitions should match the original ts array', () => {
        const bppTransitions = reduced['BPP'] as Transition[];
        expect(bppTransitions).toEqual([
            ['I', 'BR.bc$', 'C', 'BC.c$'],
            ['C', 'BC.p$', 'A', 'BA.a$'],
            ['C', 'BC.r$', 'E_R'],
            ['A', 'BA.c$', 'E_C'],
            ['A', 'BA.n', 'E_N']
        ]);
    });

    it('CPP transitions should match the original ts array', () => {
        const cppTransitions = reduced['CPP'] as Transition[];
        expect(cppTransitions).toEqual([
            ['I', 'CR.cc$', 'CW', 'CC.cw$'],
            ['CW', 'CC.p$', 'CF', 'CC.cf$'],
            ['CF', 'CC.p$', 'A', 'CA.a$'],
            ['CW', 'CC.r$', 'E_R'],
            ['CF', 'CC.r$', 'E_R'],
            ['A', 'CA.c$', 'E_C'],
            ['A', 'CA.n', 'E_N']
        ]);
    });
});

// ---------------------------------------------------------------------------
// reduceFA – already-compact input
// ---------------------------------------------------------------------------

describe('reduceFA – already-compact input is returned unchanged', () => {
    it('should return the same structure for compact input', () => {
        const compact = loadCompactFa();
        const result = reduceFA(compact);
        expect(result).toEqual(compact);
    });
});

// ---------------------------------------------------------------------------
// reduceFA – single-level FA
// ---------------------------------------------------------------------------

describe('reduceFA – single-level extended FA', () => {
    it('should reduce a single-level extended FA correctly', () => {
        const singleFa: FaDefinition = {
            BPP: {
                ts: [
                    ['I', 'BR.bc$', 'C', 'BC.c$'],
                    ['C', 'BC.p$', 'A', 'BA.a$'],
                    ['C', 'BC.r$', 'E_R'],
                    ['A', 'BA.c$', 'E_C'],
                    ['A', 'BA.n', 'E_N']
                ]
            }
        };

        const result = reduceFA(singleFa);
        expect(Object.keys(result)).toEqual(['BPP']);
        expect(Array.isArray(result['BPP'])).toBe(true);
        expect(result['BPP']).toEqual((singleFa['BPP'] as import('@vsirotin/ts-stop/sfsm').FaNode).ts);
    });
});

// ---------------------------------------------------------------------------
// reduce-fa CLI – integration tests
// ---------------------------------------------------------------------------

describe('reduce-fa CLI', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reduce-fa-test-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function runReduceFa(args: string[]): { stdout: string; stderr: string; exitCode: number } {
        const scriptPath = path.join(scriptsDir, 'reduce-fa.js');
        const result = childProcess.spawnSync(
            process.execPath,
            [scriptPath, ...args],
            { encoding: 'utf-8', cwd: projectRoot }
        );
        return {
            stdout: result.stdout ?? '',
            stderr: result.stderr ?? '',
            exitCode: result.status ?? 1
        };
    }

    it('test_reduceFaCli_extended_produces_compact_equal_to_expected', () => {
        const inputFile = path.join(testDataDir, 'turnstile-fa.json');
        const expectedFile = path.join(testDataDir, 'turnstile-fa-compact.json');

        // reduce-fa writes to <basename>-compact.json next to the input file,
        // so we copy the input to tmpDir to keep test-data pristine.
        const copiedInput = path.join(tmpDir, 'turnstile-fa.json');
        fs.copyFileSync(inputFile, copiedInput);

        const { exitCode } = runReduceFa([copiedInput]);

        expect(exitCode).toBe(0);
        const outputFile = path.join(tmpDir, 'turnstile-fa-compact.json');
        expect(fs.existsSync(outputFile)).toBe(true);
        const result: FaDefinition = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        const expected: FaDefinition = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));
        expect(result).toEqual(expected);
    });

    it('test_reduceFaCli_already_compact_returns_same_structure', () => {
        const inputFile = path.join(testDataDir, 'turnstile-fa-compact.json');
        const copiedInput = path.join(tmpDir, 'turnstile-fa-compact.json');
        fs.copyFileSync(inputFile, copiedInput);

        const { exitCode } = runReduceFa([copiedInput]);

        expect(exitCode).toBe(0);
        const outputFile = path.join(tmpDir, 'turnstile-fa-compact-compact.json');
        expect(fs.existsSync(outputFile)).toBe(true);
        const result: FaDefinition = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        const input: FaDefinition = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
        expect(result).toEqual(input);
    });

    it('test_reduceFaCli_missing_argument_exits_nonzero', () => {
        const { exitCode } = runReduceFa([]);
        expect(exitCode).not.toBe(0);
    });
});
