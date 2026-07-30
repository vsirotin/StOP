#!/usr/bin/env node
'use strict';

/**
 * run-fa.js — CLI tool to run a finite automaton (FA) through a sequence of
 * signals and write the resulting transition trace to a file.
 *
 * This is the command-line counterpart of the FaRunner + CommandInterpreter
 * classes (see src/sfsm/tools/runner/). It loads a compact FA definition from a
 * JSON file, feeds a list of signals into it, and writes a human-readable trace
 * of the transitions that fired — one line per transition:
 *
 *     from-state, signal, to-state, command
 *
 * (the `, command` part is omitted when the transition has no command).
 *
 * Usage:
 *   node run-fa.js <fa.json> <signals.txt> <output.txt> [commands.json]
 *
 * Parameters:
 *   fa.json       — JSON file containing the FA definition in compact form
 *                   (Record<string, Transition[]>).
 *   signals.txt   — Text file containing the signals to feed, one per line.
 *                   Blank lines and lines starting with "#" are ignored.
 *   output.txt    — Path for the output trace file. If it exists, it is
 *                   overwritten.
 *   commands.json — (Optional) JSON file with a command→signal mapping
 *                   (Record<string, string>). When provided, every command
 *                   emitted by the FA is translated into a signal via this
 *                   mapping and fed back into the FA (the "command loop").
 *                   When omitted, commands consume the next signal from the
 *                   signals file instead.
 *
 * Exit codes:
 *   0 — success, trace written to the output file.
 *   1 — usage error, missing file, parse error, or runtime error.
 */

const fs = require('fs');
const path = require('path');
const { Sfsm, FaRunner, CommandInterpreter } = require('../lib/sfsm');

// ── Argument parsing ────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length < 3 || args.length > 4) {
    console.error('Usage: node run-fa.js <fa.json> <signals.txt> <output.txt> [commands.json]');
    process.exit(1);
}

const [faPath, signalsPath, outputPath, commandsPath] = args;

const faFile = path.resolve(process.cwd(), faPath);
const signalsFile = path.resolve(process.cwd(), signalsPath);
const outputFile = path.resolve(process.cwd(), outputPath);
const commandsFile = commandsPath ? path.resolve(process.cwd(), commandsPath) : null;

// ── Validate input files exist ──────────────────────────────────────────────

for (const [label, file] of [
    ['FA definition', faFile],
    ['Signals', signalsFile]
]) {
    if (!fs.existsSync(file)) {
        console.error(`Error: ${label} file not found: ${file}`);
        process.exit(1);
    }
}

if (commandsFile && !fs.existsSync(commandsFile)) {
    console.error(`Error: Command interpretation file not found: ${commandsFile}`);
    process.exit(1);
}

// ── Load FA definition ──────────────────────────────────────────────────────

let faDefinition;
try {
    faDefinition = JSON.parse(fs.readFileSync(faFile, 'utf-8'));
} catch (err) {
    console.error(`Error: Failed to parse FA JSON from ${faFile}: ${err.message}`);
    process.exit(1);
}

// ── Load signals ────────────────────────────────────────────────────────────

let rawSignals;
try {
    rawSignals = fs.readFileSync(signalsFile, 'utf-8');
} catch (err) {
    console.error(`Error: Failed to read signals file ${signalsFile}: ${err.message}`);
    process.exit(1);
}

// Parse signals: one per line, skip blank lines and comments (#).
const signals = rawSignals
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

if (signals.length === 0) {
    console.error(`Error: No signals found in ${signalsFile}`);
    process.exit(1);
}

// ── Load command interpretation (optional) ─────────────────────────────────

let interpreter = null;
if (commandsFile) {
    let commandMap;
    try {
        commandMap = JSON.parse(fs.readFileSync(commandsFile, 'utf-8'));
    } catch (err) {
        console.error(`Error: Failed to parse command interpretation JSON from ${commandsFile}: ${err.message}`);
        process.exit(1);
    }
    interpreter = new CommandInterpreter(commandMap);
}

// ── Run the FA ──────────────────────────────────────────────────────────────

const sfsm = new Sfsm();
sfsm.loadFA(faDefinition);

const runner = new FaRunner(sfsm, signals);
if (interpreter) {
    runner.setCommandInterpreter(interpreter);
}

let trace;
try {
    trace = runner.run();
} catch (err) {
    console.error(`Error: FA execution failed: ${err.message}`);
    // Still write whatever trace was produced before the error, so the user
    // can inspect the partial run.
    trace = sfsm.getLog()
        .map((entry) => {
            const base = `${entry.state}, ${entry.signal}, ${entry.newState}`;
            return entry.command ? `${base}, ${entry.command}` : base;
        })
        .join('\n');
    if (trace) {
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        fs.writeFileSync(outputFile, `${trace}\n`, 'utf-8');
        console.error(`Partial trace written to: ${outputFile}`);
    }
    process.exit(1);
}

// ── Write output ────────────────────────────────────────────────────────────

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${trace}\n`, 'utf-8');
console.log(`Trace written to: ${outputFile}`);
console.log(`Final state: ${sfsm.getHeadState()}`);