import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";
import * as os from "os";

// ===========================================================================
// run-fa CLI — integration tests
//
// These tests exercise the `scripts/run-fa.js` command-line tool, which is the
// CLI counterpart of the FaRunner + CommandInterpreter classes. The tool:
//
//   1. Loads a compact FA definition from a JSON file.
//   2. Reads a list of signals from a text file (one per line; # comments and
//      blank lines are ignored).
//   3. Optionally loads a command→signal mapping from a JSON file.
//   4. Runs the FA through the signals and writes the transition trace to an
//      output file (one line per transition: "FA:from, signal, FA:to, command").
//
// Two scenarios are tested, mirroring the FaRunner unit tests:
//
//   simple/  — the basic turnstile (no jokers, no commands, no sub-FAs).
//   stacked/ — the turnstile with a CheckCoin sub-FA, driven via command
//              interpretation (the FA self-drives through the command loop).
//
// The test data lives under test/sfsm/test-data/run-fa/, analogous to the
// merge-fas test data structure.
// ===========================================================================

const testDataDir = path.resolve(__dirname, "test-data/run-fa");

describe("run-fa CLI", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "run-fa-test-"));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    /**
     * Run the run-fa.js script with the given arguments and return its
     * stdout, stderr, and exit code.
     */
    function runFa(args: string[]): { stdout: string; stderr: string; exitCode: number } {
        const scriptPath = path.resolve(__dirname, "../../scripts/run-fa.js");
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

    // -------------------------------------------------------------------------
    // Scenario 1: Simple turnstile (no commands, no sub-FAs)
    //
    //   FA:      I → locked → unlocked → locked
    //   Signals: start, coin, push
    //   Output:  3-line trace with no commands
    // -------------------------------------------------------------------------

    describe("simple turnstile (no commands)", () => {
        const dir = path.join(testDataDir, "simple");

        it("test_runFaCli_simple_turnstile_trace_matches_expectation", () => {
            const outputFile = path.join(tmpDir, "trace.txt");
            const faFile = path.join(dir, "turnstile-fa.json");
            const signalsFile = path.join(dir, "signals.txt");
            const expectedFile = path.join(dir, "expected-trace.txt");

            const { exitCode, stdout } = runFa([faFile, signalsFile, outputFile]);

            expect(exitCode).toBe(0);
            expect(stdout).toContain("Final state: locked");

            const result = fs.readFileSync(outputFile, "utf-8");
            const expected = fs.readFileSync(expectedFile, "utf-8");
            expect(result).toBe(expected);
        });

        it("test_runFaCli_simple_overwrites_existing_output_file", () => {
            const outputFile = path.join(tmpDir, "trace.txt");
            // Pre-create the output file with stale content.
            fs.writeFileSync(outputFile, "STALE CONTENT\n", "utf-8");

            const faFile = path.join(dir, "turnstile-fa.json");
            const signalsFile = path.join(dir, "signals.txt");

            const { exitCode } = runFa([faFile, signalsFile, outputFile]);

            expect(exitCode).toBe(0);
            const result = fs.readFileSync(outputFile, "utf-8");
            expect(result).not.toContain("STALE");
            expect(result).toContain("Turnstile:I, start, Turnstile:locked");
        });
    });

    // -------------------------------------------------------------------------
    // Scenario 2: Stacked turnstile with command interpretation
    //
    //   FA:      Turnstile (root) + CheckCoin (sub-FA)
    //   Signals: start, coin  (only — the rest come from the command loop)
    //   Commands: check-weight → weight-ok, check-form → coin-ok, unlock → push
    //   Output:  7-line trace spanning both FAs
    //
    // This is the most interesting scenario: the FA emits commands, the
    // interpreter translates them back into signals, and the stacked sub-FA
    // (CheckCoin) is pushed/popped as part of the run.
    // -------------------------------------------------------------------------

    describe("stacked turnstile with command interpretation", () => {
        const dir = path.join(testDataDir, "stacked");

        it("test_runFaCli_stacked_with_commands_trace_matches_expectation", () => {
            const outputFile = path.join(tmpDir, "trace.txt");
            const faFile = path.join(dir, "turnstile-fa.json");
            const signalsFile = path.join(dir, "signals.txt");
            const commandsFile = path.join(dir, "commands.json");
            const expectedFile = path.join(dir, "expected-trace.txt");

            const { exitCode, stdout } = runFa([faFile, signalsFile, outputFile, commandsFile]);

            expect(exitCode).toBe(0);
            expect(stdout).toContain("Final state: locked");

            const result = fs.readFileSync(outputFile, "utf-8");
            const expected = fs.readFileSync(expectedFile, "utf-8");
            expect(result).toBe(expected);
        });

        it("test_runFaCli_stacked_without_commands_uses_signals_from_list", () => {
            // Without the commands file, the FA's commands consume the next
            // signal from the signals list. We provide the full signal list
            // (including sub-FA signals) to complete the happy path.
            const outputFile = path.join(tmpDir, "trace.txt");
            const faFile = path.join(dir, "turnstile-fa.json");
            const expectedFile = path.join(dir, "expected-trace.txt");

            // Write a signals file with the full sequence.
            const fullSignalsFile = path.join(tmpDir, "signals-full.txt");
            fs.writeFileSync(
                fullSignalsFile,
                "start\ncoin\nweight-ok\ncoin-ok\npush\n",
                "utf-8"
            );

            const { exitCode } = runFa([faFile, fullSignalsFile, outputFile]);

            expect(exitCode).toBe(0);
            const result = fs.readFileSync(outputFile, "utf-8");
            const expected = fs.readFileSync(expectedFile, "utf-8");
            expect(result).toBe(expected);
        });
    });

    // -------------------------------------------------------------------------
    // Error handling
    // -------------------------------------------------------------------------

    describe("error handling", () => {
        const simpleDir = path.join(testDataDir, "simple");

        it("test_runFaCli_missing_fa_file_exits_nonzero", () => {
            const outputFile = path.join(tmpDir, "trace.txt");
            const signalsFile = path.join(simpleDir, "signals.txt");

            const { exitCode, stderr } = runFa(["/nonexistent/fa.json", signalsFile, outputFile]);

            expect(exitCode).not.toBe(0);
            expect(stderr).toContain("FA definition file not found");
        });

        it("test_runFaCli_missing_signals_file_exits_nonzero", () => {
            const outputFile = path.join(tmpDir, "trace.txt");
            const faFile = path.join(simpleDir, "turnstile-fa.json");

            const { exitCode, stderr } = runFa([faFile, "/nonexistent/signals.txt", outputFile]);

            expect(exitCode).not.toBe(0);
            expect(stderr).toContain("Signals file not found");
        });

        it("test_runFaCli_missing_commands_file_exits_nonzero", () => {
            const outputFile = path.join(tmpDir, "trace.txt");
            const faFile = path.join(simpleDir, "turnstile-fa.json");
            const signalsFile = path.join(simpleDir, "signals.txt");

            const { exitCode, stderr } = runFa([faFile, signalsFile, outputFile, "/nonexistent/commands.json"]);

            expect(exitCode).not.toBe(0);
            expect(stderr).toContain("Command interpretation file not found");
        });

        it("test_runFaCli_too_few_args_exits_nonzero", () => {
            const { exitCode, stderr } = runFa(["only-one-arg"]);

            expect(exitCode).not.toBe(0);
            expect(stderr).toContain("Usage:");
        });

        it("test_runFaCli_too_many_args_exits_nonzero", () => {
            const { exitCode, stderr } = runFa(["a", "b", "c", "d", "e"]);

            expect(exitCode).not.toBe(0);
            expect(stderr).toContain("Usage:");
        });

        it("test_runFaCli_empty_signals_file_exits_nonzero", () => {
            const outputFile = path.join(tmpDir, "trace.txt");
            const faFile = path.join(simpleDir, "turnstile-fa.json");
            const emptySignals = path.join(tmpDir, "empty.txt");
            fs.writeFileSync(emptySignals, "# only comments\n\n", "utf-8");

            const { exitCode, stderr } = runFa([faFile, emptySignals, outputFile]);

            expect(exitCode).not.toBe(0);
            expect(stderr).toContain("No signals found");
        });
    });
});