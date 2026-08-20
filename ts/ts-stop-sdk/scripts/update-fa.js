#!/usr/bin/env node
'use strict';

/**
 * update-fa.js — CLI tool to apply an FA update file to a source FA JSON file.
 *
 * Invoked via npm scripts:
 *   npm run update-full-fa    -- --source=<path> --update=<path> [--result=<path>]
 *   npm run update-compact-fa -- --source=<path> --update=<path> [--result=<path>]
 *
 * If --result is omitted, the output file is named <source-basename>-updated.json.
 *
 * Requires the library to be built first: npm run build
 */

const fs   = require('fs');
const path = require('path');
const { updateFullFA, updateCompactFA } = require('@vsirotin/ts-stop/sfsm');

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

const args = {};
for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.+)$/);
    if (match) args[match[1]] = match[2];
}

const format = args['format'];
if (!format || !['full', 'compact'].includes(format)) {
    console.error('Error: --format=full|compact is required (set by the npm script).');
    process.exit(1);
}

if (!args['source']) {
    console.error('Error: --source=<path> is required.');
    console.error(`Usage: npm run update-${format}-fa -- --source=<path> --update=<path> [--result=<path>]`);
    process.exit(1);
}

if (!args['update']) {
    console.error('Error: --update=<path> is required.');
    console.error(`Usage: npm run update-${format}-fa -- --source=<path> --update=<path> [--result=<path>]`);
    process.exit(1);
}

// ---------------------------------------------------------------------------
// Resolve paths
// ---------------------------------------------------------------------------

const sourceFile = path.resolve(process.cwd(), args['source']);
const updateFile = path.resolve(process.cwd(), args['update']);

let resultFile;
if (args['result']) {
    resultFile = path.resolve(process.cwd(), args['result']);
} else {
    const ext  = path.extname(sourceFile);
    const base = path.basename(sourceFile, ext);
    const dir  = path.dirname(sourceFile);
    resultFile = path.join(dir, `${base}-updated${ext}`);
}

// ---------------------------------------------------------------------------
// Load & validate
// ---------------------------------------------------------------------------

if (!fs.existsSync(sourceFile)) {
    console.error(`Error: Source file not found: ${sourceFile}`);
    process.exit(1);
}

if (!fs.existsSync(updateFile)) {
    console.error(`Error: Update file not found: ${updateFile}`);
    process.exit(1);
}

let source, update;
try {
    source = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
} catch (err) {
    console.error(`Error: Failed to parse source JSON: ${err.message}`);
    process.exit(1);
}

try {
    update = JSON.parse(fs.readFileSync(updateFile, 'utf-8'));
} catch (err) {
    console.error(`Error: Failed to parse update JSON: ${err.message}`);
    process.exit(1);
}

// ---------------------------------------------------------------------------
// Apply update
// ---------------------------------------------------------------------------

let result;
try {
    result = format === 'full'
        ? updateFullFA(source, update)
        : updateCompactFA(source, update);
} catch (err) {
    console.error(`Error: Update failed: ${err.message}`);
    process.exit(1);
}

fs.writeFileSync(resultFile, JSON.stringify(result, null, 4), 'utf-8');
console.log(`Updated FA written to: ${resultFile}`);
