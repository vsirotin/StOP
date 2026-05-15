/**
 * @jest-environment node
 *
 * Integration tests for the mergeFAs library function and the merge-fas /
 * merge-fas-from-dir CLI scripts as exposed by the installed @vsirotin/ts-stop package.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import * as os from 'os';
import { FaDefinition, mergeFAs } from '@vsirotin/ts-stop/sfsm';

// Test data lives in the ts-stop sub-project (shared source of truth).
const testDataDir = path.resolve(__dirname, '../../../ts-stop/test/sfsm/test-data/merge-fas');

// Scripts are installed into this project's node_modules from the package.
const scriptsDir = path.resolve(__dirname, '../../node_modules/@vsirotin/ts-stop/scripts');
const projectRoot = path.resolve(__dirname, '../..');

// ---------------------------------------------------------------------------
// mergeFAs – unit tests
// ---------------------------------------------------------------------------

describe('mergeFAs', () => {
    it('should reduce extended definitions and merge into compact output', () => {
        const inputA: FaDefinition = {
            TS: {
                states: {
                    PP: {
                        states: {
                            BPP: {
                                ts: [['I', 'BR.bc$', 'E_N']]
                            }
                        },
                        ts: [['I', 'BR.bc$', 'BPP']]
                    }
                },
                ts: [['I', 'TS.s', 'PP']]
            }
        };

        const inputB: FaDefinition = {
            AUX: [['I', 'A.s', 'E_N']]
        };

        const { merged, warnings } = mergeFAs([inputA, inputB]);

        expect(warnings).toEqual([]);
        expect(merged).toEqual({
            TS: [['I', 'TS.s', 'PP']],
            PP: [['I', 'BR.bc$', 'BPP']],
            BPP: [['I', 'BR.bc$', 'E_N']],
            AUX: [['I', 'A.s', 'E_N']]
        });
    });

    it('should keep compact input unchanged before merge', () => {
        const compactA: FaDefinition = { A: [['I', 'A.s', 'E_N']] };
        const compactB: FaDefinition = { B: [['I', 'B.s', 'E_N']] };

        const { merged, warnings } = mergeFAs([compactA, compactB]);

        expect(warnings).toEqual([]);
        expect(merged).toEqual({
            A: [['I', 'A.s', 'E_N']],
            B: [['I', 'B.s', 'E_N']]
        });
    });

    it('should overwrite duplicate FA keys from later inputs and report warnings', () => {
        const inputA: FaDefinition = {
            TS: [['I', 'TS.s', 'L']],
            PP: [['I', 'PP.s', 'E_N']]
        };
        const inputB: FaDefinition = {
            PP: [['I', 'PP.s2', 'E_P']],
            TS: [['I', 'TS.s2', 'U']]
        };

        const { merged, warnings } = mergeFAs([inputA, inputB]);

        expect(merged).toEqual({
            TS: [['I', 'TS.s2', 'U']],
            PP: [['I', 'PP.s2', 'E_P']]
        });
        expect(warnings).toHaveLength(2);
        expect(warnings[0]).toContain("Duplicate FA key 'PP'");
        expect(warnings[1]).toContain("Duplicate FA key 'TS'");
    });
});

// ---------------------------------------------------------------------------
// merge-fas CLI – integration tests
// ---------------------------------------------------------------------------

describe('merge-fas CLI', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-fas-test-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function runMergeFas(args: string[]): { stdout: string; stderr: string; exitCode: number } {
        const scriptPath = path.join(scriptsDir, 'merge-fas.js');
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

    it('test_mergeFasCli_three_compact_parts_equal_expectation', () => {
        const resultFile = path.join(tmpDir, 'result.json');
        const part1 = path.join(testDataDir, 'input', 'part1.json');
        const part2 = path.join(testDataDir, 'input', 'part2.json');
        const part3 = path.join(testDataDir, 'input', 'part3.json');
        const expectationFile = path.join(testDataDir, 'expectation.json');

        const { exitCode } = runMergeFas([`--result=${resultFile}`, `${part1},${part2}`, part3]);

        expect(exitCode).toBe(0);
        const result: FaDefinition = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
        const expected: FaDefinition = JSON.parse(fs.readFileSync(expectationFile, 'utf-8'));
        expect(result).toEqual(expected);
    });

    it('test_mergeFasCli_duplicate_key_warns_last_wins', () => {
        const resultFile = path.join(tmpDir, 'result.json');
        const part1 = path.join(testDataDir, 'input', 'part1.json');

        const { exitCode, stderr, stdout } = runMergeFas([`--result=${resultFile}`, part1, part1]);

        expect(exitCode).toBe(0);
        expect(stdout + stderr).toMatch(/Duplicate FA key 'TS'/);
    });

    it('test_mergeFasCli_missing_result_flag_exits_nonzero', () => {
        const part1 = path.join(testDataDir, 'input', 'part1.json');
        const { exitCode } = runMergeFas([part1]);
        expect(exitCode).not.toBe(0);
    });

    it('test_mergeFasCli_no_input_files_exits_nonzero', () => {
        const resultFile = path.join(tmpDir, 'result.json');
        const { exitCode } = runMergeFas([`--result=${resultFile}`]);
        expect(exitCode).not.toBe(0);
    });
});

// ---------------------------------------------------------------------------
// merge-fas-from-dir CLI – integration tests
// ---------------------------------------------------------------------------

describe('merge-fas-from-dir CLI', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-fas-from-dir-test-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function runMergeFasFromDir(args: string[]): { stdout: string; stderr: string; exitCode: number } {
        const scriptPath = path.join(scriptsDir, 'merge-fas-from-dir.js');
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

    it('test_mergeFasFromDirCli_input_dir_equals_expectation', () => {
        const resultFile = path.join(tmpDir, 'result.json');
        const inputDir = path.join(testDataDir, 'input');
        const expectationFile = path.join(testDataDir, 'expectation.json');

        const { exitCode } = runMergeFasFromDir([`--input-dir=${inputDir}`, `--result=${resultFile}`]);

        expect(exitCode).toBe(0);
        const result: FaDefinition = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
        const expected: FaDefinition = JSON.parse(fs.readFileSync(expectationFile, 'utf-8'));
        expect(result).toEqual(expected);
    });

    it('test_mergeFasFromDirCli_missing_input_dir_exits_nonzero', () => {
        const resultFile = path.join(tmpDir, 'result.json');
        const { exitCode } = runMergeFasFromDir([`--result=${resultFile}`]);
        expect(exitCode).not.toBe(0);
    });

    it('test_mergeFasFromDirCli_nonexistent_dir_exits_nonzero', () => {
        const resultFile = path.join(tmpDir, 'result.json');
        const { exitCode } = runMergeFasFromDir([`--input-dir=/nonexistent/dir`, `--result=${resultFile}`]);
        expect(exitCode).not.toBe(0);
    });

    it('test_mergeFasFromDirCli_empty_dir_exits_nonzero', () => {
        const resultFile = path.join(tmpDir, 'result.json');
        const emptyDir = path.join(tmpDir, 'empty');
        fs.mkdirSync(emptyDir);
        const { exitCode } = runMergeFasFromDir([`--input-dir=${emptyDir}`, `--result=${resultFile}`]);
        expect(exitCode).not.toBe(0);
    });
});
