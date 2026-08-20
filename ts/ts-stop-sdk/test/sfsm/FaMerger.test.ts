import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";
import * as os from "os";
import { FaDefinition } from "@vsirotin/ts-stop";

const testDataDir = path.resolve(__dirname, "test-data/merge-fas");

// ---------------------------------------------------------------------------
// merge-fas CLI — integration tests using realistic turnstile test data
// ---------------------------------------------------------------------------

describe("merge-fas CLI", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "merge-fas-test-"));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function runMergeFas(args: string[]): { stdout: string; stderr: string; exitCode: number } {
        const scriptPath = path.resolve(__dirname, "../../scripts/merge-fas.js");
        const result = childProcess.spawnSync(
            process.execPath,
            [scriptPath, ...args],
            { encoding: "utf-8", cwd: path.resolve(__dirname, "../..") }
        );
        return {
            stdout: result.stdout ?? "",
            stderr: result.stderr ?? "",
            exitCode: result.status ?? 1
        };
    }

    it("test_mergeFasCli_three_compact_parts_equal_expectation", () => {
        const resultFile = path.join(tmpDir, "result.json");
        const part1 = path.join(testDataDir, "input", "part1.json");
        const part2 = path.join(testDataDir, "input", "part2.json");
        const part3 = path.join(testDataDir, "input", "part3.json");
        const expectationFile = path.join(testDataDir, "expectation.json");

        const { exitCode } = runMergeFas([`--result=${resultFile}`, `${part1},${part2}`, part3]);

        expect(exitCode).toBe(0);
        const result: FaDefinition = JSON.parse(fs.readFileSync(resultFile, "utf-8"));
        const expected: FaDefinition = JSON.parse(fs.readFileSync(expectationFile, "utf-8"));
        expect(result).toEqual(expected);
    });

    it("test_mergeFasCli_extended_source_reduces_to_same_as_parts", () => {
        const resultFile = path.join(tmpDir, "result.json");
        const extendedSource = path.resolve(__dirname, "test-data/turnstile-fa.json");
        const expectationFile = path.join(testDataDir, "expectation.json");

        const { exitCode } = runMergeFas([`--result=${resultFile}`, extendedSource]);

        expect(exitCode).toBe(0);
        const result: FaDefinition = JSON.parse(fs.readFileSync(resultFile, "utf-8"));
        const expected: FaDefinition = JSON.parse(fs.readFileSync(expectationFile, "utf-8"));
        expect(result).toEqual(expected);
    });

    it("test_mergeFasCli_duplicate_key_warns_last_wins", () => {
        const resultFile = path.join(tmpDir, "result.json");
        const part1 = path.join(testDataDir, "input", "part1.json");

        const { exitCode, stderr, stdout } = runMergeFas([`--result=${resultFile}`, part1, part1]);

        expect(exitCode).toBe(0);
        const allOutput = stdout + stderr;
        expect(allOutput).toMatch(/Duplicate FA key 'TS'/);
    });

    it("test_mergeFasCli_missing_result_flag_exits_nonzero", () => {
        const part1 = path.join(testDataDir, "input", "part1.json");
        const { exitCode } = runMergeFas([part1]);
        expect(exitCode).not.toBe(0);
    });

    it("test_mergeFasCli_no_input_files_exits_nonzero", () => {
        const resultFile = path.join(tmpDir, "result.json");
        const { exitCode } = runMergeFas([`--result=${resultFile}`]);
        expect(exitCode).not.toBe(0);
    });

    it("test_mergeFasCli_missing_input_file_exits_nonzero", () => {
        const resultFile = path.join(tmpDir, "result.json");
        const { exitCode } = runMergeFas([`--result=${resultFile}`, "/nonexistent/path.json"]);
        expect(exitCode).not.toBe(0);
    });
});
// ---------------------------------------------------------------------------
// merge-fas-from-dir CLI — integration tests using merge-fas/input directory
// ---------------------------------------------------------------------------

describe("merge-fas-from-dir CLI", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "merge-fas-from-dir-test-"));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function runMergeFasFromDir(args: string[]): { stdout: string; stderr: string; exitCode: number } {
        const scriptPath = path.resolve(__dirname, "../../scripts/merge-fas-from-dir.js");
        const result = childProcess.spawnSync(
            process.execPath,
            [scriptPath, ...args],
            { encoding: "utf-8", cwd: path.resolve(__dirname, "../..") }
        );
        return {
            stdout: result.stdout ?? "",
            stderr: result.stderr ?? "",
            exitCode: result.status ?? 1
        };
    }

    it("test_mergeFasFromDirCli_input_dir_equals_expectation", () => {
        const resultFile = path.join(tmpDir, "result.json");
        const inputDir = path.join(testDataDir, "input");
        const expectationFile = path.join(testDataDir, "expectation.json");

        const { exitCode } = runMergeFasFromDir([`--input-dir=${inputDir}`, `--result=${resultFile}`]);

        expect(exitCode).toBe(0);
        const result: FaDefinition = JSON.parse(fs.readFileSync(resultFile, "utf-8"));
        const expected: FaDefinition = JSON.parse(fs.readFileSync(expectationFile, "utf-8"));
        expect(result).toEqual(expected);
    });

    it("test_mergeFasFromDirCli_missing_input_dir_exits_nonzero", () => {
        const resultFile = path.join(tmpDir, "result.json");
        const { exitCode } = runMergeFasFromDir([`--result=${resultFile}`]);
        expect(exitCode).not.toBe(0);
    });

    it("test_mergeFasFromDirCli_missing_result_exits_nonzero", () => {
        const inputDir = path.join(testDataDir, "input");
        const { exitCode } = runMergeFasFromDir([`--input-dir=${inputDir}`]);
        expect(exitCode).not.toBe(0);
    });

    it("test_mergeFasFromDirCli_nonexistent_dir_exits_nonzero", () => {
        const resultFile = path.join(tmpDir, "result.json");
        const { exitCode } = runMergeFasFromDir([`--input-dir=/nonexistent/dir`, `--result=${resultFile}`]);
        expect(exitCode).not.toBe(0);
    });

    it("test_mergeFasFromDirCli_empty_dir_exits_nonzero", () => {
        const resultFile = path.join(tmpDir, "result.json");
        const emptyDir = path.join(tmpDir, "empty");
        fs.mkdirSync(emptyDir);

        const { exitCode } = runMergeFasFromDir([`--input-dir=${emptyDir}`, `--result=${resultFile}`]);

        expect(exitCode).not.toBe(0);
    });
});