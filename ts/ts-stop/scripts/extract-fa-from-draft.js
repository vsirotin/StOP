#!/usr/bin/env node
'use strict';

/**
 * extract-fa-from-draft.js — CLI tool to extract a compact SFSM JSON definition
 * from an extended-transitions draft document (markdown).
 *
 * The script reads a markdown file containing extended transitions (as produced
 * by the stop-sfsm-drafter skill), extracts all transition lines, groups them
 * by FA name (the prefix before ":" in the from-state), and writes the result
 * as a JSON file ready for validation and testing.
 *
 * Usage:
 *   node extract-fa-from-draft.js <input.md> [output.json]
 *
 * Parameters:
 *   input.md    — Markdown file containing extended transitions (e.g., sfsm-drafter-example.md).
 *   output.json — (Optional) Path for the output JSON file. If omitted, the
 *                 output is written to <input-basename>.json in the same directory.
 *
 * Exit codes:
 *   0 — success.
 *   1 — file not found, no transitions found, or parse error.
 *
 * Example:
 *   node extract-fa-from-draft.js sfsm-drafter-example.md
 *   → writes sfsm-drafter-example.json
 *
 *   node extract-fa-from-draft.js sfsm-drafter-example.md turnstile-fa.json
 *   → writes turnstile-fa.json
 */

const fs = require('fs');
const path = require('path');

// ── Argument parsing ────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length < 1 || args.length > 2) {
    console.error('Usage: node extract-fa-from-draft.js <input.md> [output.json]');
    process.exit(1);
}

const [inputPath, outputPath] = args;

const inputFile = path.resolve(process.cwd(), inputPath);
const outputFile = outputPath
    ? path.resolve(process.cwd(), outputPath)
    : path.join(path.dirname(inputFile), path.basename(inputFile, '.md') + '.json');

// ── Validate input file exists ──────────────────────────────────────────────

if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
}

// ── Read input file ─────────────────────────────────────────────────────────

const content = fs.readFileSync(inputFile, 'utf-8');
const lines = content.split('\n');

// ── Extract transition lines ───────────────────────────────────────────────

/**
 * A transition line is a line that starts with "[" (after trimming whitespace)
 * and ends with "]" (after trimming whitespace). It should be a valid JSON array.
 * Lines starting with "//" (comments) are skipped.
 */
const transitionLines = [];
const parseErrors = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (line === '' || line.startsWith('//') || line.startsWith('```')) {
        continue;
    }

    // Check if the line looks like a transition array
    if (line.startsWith('[') && line.endsWith(']')) {
        try {
            const parsed = JSON.parse(line);
            if (Array.isArray(parsed) && parsed.length >= 3) {
                transitionLines.push({ line: i + 1, transition: parsed });
            } else {
                parseErrors.push(`Line ${i + 1}: Array has fewer than 3 elements: ${line}`);
            }
        } catch (err) {
            parseErrors.push(`Line ${i + 1}: Failed to parse JSON: ${err.message}`);
        }
    }
}

// ── Report parse errors (warnings) ──────────────────────────────────────────

if (parseErrors.length > 0) {
    console.error('Warnings:');
    for (const err of parseErrors) {
        console.error(`  ${err}`);
    }
}

// ── Check if any transitions were found ─────────────────────────────────────

if (transitionLines.length === 0) {
    console.error('Error: No transition lines found in the input file.');
    console.error('       Transition lines must start with "[" and end with "]" and be valid JSON arrays.');
    process.exit(1);
}

// ── Group transitions by FA name ────────────────────────────────────────────

/**
 * The FA name is the prefix of the from-state (the part before the first ":").
 * If the from-state has no ":", the entire from-state is used as the FA name.
 *
 * Example:
 *   "Turnstile:I" → FA name "Turnstile"
 *   "Weight Checker:E_Weight_Checked" → FA name "Weight Checker"
 *   "locked" → FA name "locked"
 */
const faGroups = {};
const faOrder = []; // Track insertion order for consistent output

for (const { line, transition } of transitionLines) {
    const fromState = transition[0];
    const colonIndex = fromState.indexOf(':');

    let faName;
    if (colonIndex > 0) {
        faName = fromState.substring(0, colonIndex);
    } else {
        faName = fromState;
    }

    if (!faGroups[faName]) {
        faGroups[faName] = [];
        faOrder.push(faName);
    }

    faGroups[faName].push(transition);
}

// ── Build output object (preserving insertion order) ───────────────────────

const output = {};
for (const faName of faOrder) {
    output[faName] = faGroups[faName];
}

// ── Write output file ───────────────────────────────────────────────────────

const json = JSON.stringify(output, null, 2);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${json}\n`, 'utf-8');

// ── Print summary ───────────────────────────────────────────────────────────

console.log(`Extracted ${transitionLines.length} transition(s) in ${faOrder.length} FA group(s):`);
for (const faName of faOrder) {
    console.log(`  ${faName}: ${faGroups[faName].length} transition(s)`);
}
console.log(`Output written to: ${outputFile}`);

process.exit(0);