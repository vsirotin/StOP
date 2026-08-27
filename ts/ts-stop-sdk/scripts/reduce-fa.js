#!/usr/bin/env node
'use strict';

/**
 * reduce-fa.js — CLI tool to convert an extended FA JSON file to compact format.
 *
 * Usage:
 *   npm run reduce-fa -- <path/to/extended-fa.json>
 *
 * Output:
 *   Writes the compact definition to <input>-compact.json in the same directory.
 *
 * Requires the library to be built first: npm run build
 */

const fs = require('fs');
const path = require('path');
const { reduceFA } = require('@vsirotin/ts-stop/sfsm');

const inputArg = process.argv[2];

if (!inputArg) {
    console.error('Error: No input file specified.');
    console.error('Usage: npm run reduce-fa -- <path/to/extended-fa.json>');
    process.exit(1);
}

const inputFile = path.resolve(process.cwd(), inputArg);

if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
}

let definition;
try {
    definition = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
} catch (err) {
    console.error(`Error: Failed to parse JSON from ${inputFile}: ${err.message}`);
    process.exit(1);
}

const compact = reduceFA(definition);

const ext = path.extname(inputFile);
const base = path.basename(inputFile, ext);
const dir = path.dirname(inputFile);
const outputFile = path.join(dir, `${base}-compact${ext}`);

// Serialize with transitions inline: ["state", "signal", "newState", "cmd?"]
const json = JSON.stringify(compact, null, 4).replace(
    /\[\s*\n\s*"([^"]+)",\s*\n\s*"([^"]+)",\s*\n\s*"([^"]+)"(?:,\s*\n\s*"([^"]+)")?\s*\n\s*\]/g,
    (_, a, b, c, d) => d ? `["${a}", "${b}", "${c}", "${d}"]` : `["${a}", "${b}", "${c}"]`
);
fs.writeFileSync(outputFile, json, 'utf-8');
console.log(`Reduced FA written to: ${outputFile}`);
