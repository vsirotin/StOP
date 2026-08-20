#!/usr/bin/env node
'use strict';

/**
 * extract-sfsm.js — CLI tool to extract the compact FA definition (behavior)
 * from an extended SFSM model file (sfsm.ext.json) that uses the
 * `components`-tree format defined by the stop-sfsm-modeller skill.
 *
 * The skill's sfsm.ext.json nests components under a `components` array of
 * single-key wrapper objects. Each component may carry:
 *   - `ts`        : Transition[]  (the FA's transitions)
 *   - `events`    : event metadata (senders)
 *   - `commands`  : command metadata (receivers)
 *   - `components`: child component wrappers (sub-FAs)
 *
 * This script walks the tree, collects every `ts` array keyed by the
 * component name, and writes the result as a flat
 * `Record<string, Transition[]>` — the compact multi-FA format that
 * `Sfsm.loadFA()` and `run-fa.js` consume directly.
 *
 * Usage:
 *   node extract-sfsm.js <sfsm.ext.json> [output.json]
 *
 * Parameters:
 *   sfsm.ext.json — the extended SFSM model file.
 *   output.json   — (Optional) path for the compact FA. If omitted, writes
 *                   <input-basename>-compact.json next to the input.
 *
 * Exit codes:
 *   0 — compact FA written successfully.
 *   1 — usage error, missing file, parse error, or no transitions found.
 */

const fs = require('fs');
const path = require('path');

// ── Argument parsing ────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length < 1 || args.length > 2) {
    console.error('Usage: node extract-sfsm.js <sfsm.ext.json> [output.json]');
    process.exit(1);
}

const [inputArg, outputArg] = args;
const inputFile = path.resolve(process.cwd(), inputArg);

if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
}

// ── Load JSON ────────────────────────────────────────────────────────────────

let model;
try {
    model = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
} catch (err) {
    console.error(`Error: Failed to parse JSON from ${inputFile}: ${err.message}`);
    process.exit(1);
}

// ── Walk the component tree and collect ts arrays ───────────────────────────

/**
 * Recursively walk the components tree, collecting every component's `ts`
 * array into the `result` map, keyed by component name.
 *
 * Each element of a `components` array is a wrapper object with a single key
 * (the component name) mapping to the component definition.
 *
 * @param {any} componentDef — the component definition object (value side of the wrapper).
 * @param {string} name — the component name (key side of the wrapper).
 * @param {Record<string, any[]>} result — accumulator: componentName → Transition[].
 */
function collectTransitions(componentDef, name, result) {
    if (componentDef && Array.isArray(componentDef.ts)) {
        result[name] = componentDef.ts;
    }

    if (componentDef && Array.isArray(componentDef.components)) {
        for (const wrapper of componentDef.components) {
            if (typeof wrapper === 'object' && wrapper !== null) {
                for (const [childName, childDef] of Object.entries(wrapper)) {
                    collectTransitions(childDef, childName, result);
                }
            }
        }
    }
}

const compactFa = {};

if (model && Array.isArray(model.components)) {
    for (const wrapper of model.components) {
        if (typeof wrapper === 'object' && wrapper !== null) {
            for (const [rootName, rootDef] of Object.entries(wrapper)) {
                collectTransitions(rootDef, rootName, compactFa);
            }
        }
    }
}

// ── Validate result ─────────────────────────────────────────────────────────

const faCount = Object.keys(compactFa).length;
const transitionCount = Object.values(compactFa).reduce(
    (sum, ts) => sum + ts.length, 0
);

if (faCount === 0 || transitionCount === 0) {
    console.error('Error: No FA transitions found in the model. ' +
        'Ensure the model contains components with `ts` arrays.');
    process.exit(1);
}

// ── Serialize ────────────────────────────────────────────────────────────────

// Determine output path
let outputFile;
if (outputArg) {
    outputFile = path.resolve(process.cwd(), outputArg);
} else {
    const ext = path.extname(inputFile);
    const base = path.basename(inputFile, ext);
    const dir = path.dirname(inputFile);
    outputFile = path.join(dir, `${base}-compact${ext}`);
}

// Pretty-print with transitions inline: ["state", "signal", "newState", "cmd?"]
const json = JSON.stringify(compactFa, null, 4).replace(
    /\[\s*\n\s*"([^"]+)",\s*\n\s*"([^"]+)",\s*\n\s*"([^"]+)"(?:,\s*\n\s*"([^"]+)")?\s*\n\s*\]/g,
    (_, a, b, c, d) => d ? `["${a}", "${b}", "${c}", "${d}"]` : `["${a}", "${b}", "${c}"]`
);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${json}\n`, 'utf-8');

console.log(`Compact FA written to: ${outputFile}`);
console.log(`FAs: ${faCount}, transitions: ${transitionCount}`);
