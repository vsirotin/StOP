#!/usr/bin/env node
'use strict';

/**
 * merge-fas.js — CLI tool to reduce and merge multiple FA JSON files.
 *
 * Usage:
 *   npm run merge-fas -- --result=<path/to/result.json> <file1[,file2,...]> [file3 ...]
 *
 * Behavior:
 * - Each input file is reduced with reduceFA semantics.
 * - Already compact files are used unchanged.
 * - Duplicate FA keys are overwritten by the latest file and reported as warnings.
 */

const fs = require('fs');
const path = require('path');
const { mergeFAs } = require('../lib/sfsm');

const args = process.argv.slice(2);
const options = {};
const rawFiles = [];

for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.+)$/);
    if (match) {
        options[match[1]] = match[2];
    } else {
        rawFiles.push(arg);
    }
}

if (!options.result) {
    console.error('Error: --result=<path> is required.');
    console.error('Usage: npm run merge-fas -- --result=<path/to/result.json> <file1[,file2,...]> [file3 ...]');
    process.exit(1);
}

const inputFiles = rawFiles
    .flatMap((chunk) => chunk.split(','))
    .map((s) => s.trim())
    .filter(Boolean);

if (inputFiles.length === 0) {
    console.error('Error: At least one input file is required.');
    console.error('Usage: npm run merge-fas -- --result=<path/to/result.json> <file1[,file2,...]> [file3 ...]');
    process.exit(1);
}

const resolvedInputFiles = inputFiles.map((f) => path.resolve(process.cwd(), f));
const resultFile = path.resolve(process.cwd(), options.result);

for (const file of resolvedInputFiles) {
    if (!fs.existsSync(file)) {
        console.error(`Error: Input file not found: ${file}`);
        process.exit(1);
    }
}

function isCompactDefinition(definition) {
    const entries = Object.entries(definition);
    return entries.length > 0 && entries.every(([, value]) => Array.isArray(value));
}

const definitions = [];

for (let i = 0; i < resolvedInputFiles.length; i++) {
    const file = resolvedInputFiles[i];
    let definition;
    try {
        definition = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (err) {
        console.error(`Error: Failed to parse JSON from ${file}: ${err.message}`);
        process.exit(1);
    }

    if (isCompactDefinition(definition)) {
        console.log(`Info: Input #${i + 1} is already compact and will be used as-is: ${file}`);
    } else {
        console.log(`Info: Input #${i + 1} is extended and will be reduced: ${file}`);
    }

    definitions.push(definition);
}

const { merged, warnings } = mergeFAs(definitions);

for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
}

const json = JSON.stringify(merged, null, 4).replace(
    /\[\s*\n\s*"([^"]+)",\s*\n\s*"([^"]+)",\s*\n\s*"([^"]+)"(?:,\s*\n\s*"([^"]+)")?\s*\n\s*\]/g,
    (_, a, b, c, d) => d ? `["${a}", "${b}", "${c}", "${d}"]` : `["${a}", "${b}", "${c}"]`
);

fs.mkdirSync(path.dirname(resultFile), { recursive: true });
fs.writeFileSync(resultFile, `${json}\n`, 'utf-8');
console.log(`Merged compact FA written to: ${resultFile}`);
