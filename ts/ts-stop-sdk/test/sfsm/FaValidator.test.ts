import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";
import * as os from "os";

// ===========================================================================
// FaValidator – validate-fa CLI integration tests
//
// These tests exercise the `scripts/validate-fa.js` command-line tool, which
// validates an FA definition JSON file against the 14 structural rules and
// writes a PASSED/FAILED verdict (optionally to a report file).
// ===========================================================================

describe("FaValidator – validate-fa CLI", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "validate-fa-test-"));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function runValidateFa(args: string[]): { stdout: string; stderr: string; exitCode: number } {
        const scriptPath = path.resolve(__dirname, "../../scripts/validate-fa.js");
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

    const testDataDir = path.resolve(__dirname, "test-data/validate-fa");

    it("test_validateFaCli_valid_simple_exits_zero", () => {
        const faFile = path.join(testDataDir, "valid-simple.json");
        const { exitCode, stdout } = runValidateFa([faFile]);
        expect(exitCode).toBe(0);
        expect(stdout).toContain("PASSED");
    });

    it("test_validateFaCli_invalid_fa_exits_nonzero", () => {
        const faFile = path.join(testDataDir, "no-entry-state.json");
        const { exitCode, stderr } = runValidateFa([faFile]);
        expect(exitCode).not.toBe(0);
        expect(stderr).toContain("FAILED");
    });

    it("test_validateFaCli_output_written_to_file", () => {
        const outputFile = path.join(tmpDir, "report.json");
        const faFile = path.join(testDataDir, "valid-simple.json");
        const { exitCode } = runValidateFa([faFile, outputFile]);
        expect(exitCode).toBe(0);
        const report = JSON.parse(fs.readFileSync(outputFile, "utf-8"));
        expect(report.valid).toBe(true);
    });

    it("test_validateFaCli_missing_file_exits_nonzero", () => {
        const { exitCode, stderr } = runValidateFa(["/nonexistent/fa.json"]);
        expect(exitCode).not.toBe(0);
        expect(stderr).toContain("not found");
    });

    it("test_validateFaCli_too_few_args_exits_nonzero", () => {
        const { exitCode, stderr } = runValidateFa([]);
        expect(exitCode).not.toBe(0);
        expect(stderr).toContain("Usage:");
    });

    it("test_validateFaCli_too_many_args_exits_nonzero", () => {
        const { exitCode, stderr } = runValidateFa(["a", "b", "c"]);
        expect(exitCode).not.toBe(0);
        expect(stderr).toContain("Usage:");
    });
});