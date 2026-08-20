#!/usr/bin/env node
'use strict';

/**
 * merge-fas-from-dir.js — CLI tool to recursively merge all FA JSON files from a directory.
 *
 * Usage:
 *   node scripts/merge-fas-from-dir.js --input-dir=<path/to/dir> --result=<path/to/result.json>
 *
 * Behavior:
 * - Recursively finds all .json files in the input directory (including subdirectories).
 * - Sorts files alphabetically by full path for consistent merge order.
 * - Each input file is reduced with reduceFA semantics.
 * - Already compact files are used unchanged.
 * - Duplicate FA keys are overwritten by the latest file and reported as warnings.
 * - Output is a single merged compact FA definition.
 */

const fs = require('fs');
const path = require('path');
const { mergeFAs } = require('@vsirotin/ts-stop/sfsm');

const args = process.argv.slice(2);
const options = {};

for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.+)$/);
    if (match) {
        options[match[1]] = match[2];
    }
}

if (!options['input-dir']) {
    console.error('Error: --input-dir=<path> is required.');
    console.error('Usage: node scripts/merge-fas-from-dir.js --input-dir=<path/to/dir> --result=<path/to/result.json>');
    process.exit(1);
}

if (!options.result) {
    console.error('Error: --result=<path> is required.');
    console.error('Usage: node scripts/merge-fas-from-dir.js --input-dir=<path/to/dir> --result=<path/to/result.json>');
    process.exit(1);
}

const inputDir = path.resolve(process.cwd(), options['input-dir']);
const resultFile = path.resolve(process.cwd(), options.result);

// Verify input directory exists
if (!fs.existsSync(inputDir) || !fs.statSync(inputDir).isDirectory()) {
    console.error(`Error: Input directory not found or not a directory: ${inputDir}`);
    process.exit(1);
}

/**
 * Recursively find all .json files in a directory.
 */
function findJsonFiles(dir, baseDir = dir) {
    const files = [];
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...findJsonFiles(fullPath, baseDir));
        } else if (entry.endsWith('.json')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Check if a definition is in compact format.
 */
function isCompactDefinition(definition) {
    const entries = Object.entries(definition);
    return entries.length > 0 && entries.every(([, value]) => Array.isArray(value));
}

// Find all JSON files
const jsonFiles = findJsonFiles(inputDir).sort();

if (jsonFiles.length === 0) {
    console.error(`Error: No JSON files found in input directory: ${inputDir}`);
    process.exit(1);
}

console.log(`Found ${jsonFiles.length} JSON file(s) in ${inputDir}`);

const definitions = [];

for (let i = 0; i < jsonFiles.length; i++) {
    const file = jsonFiles[i];
    const relPath = path.relative(inputDir, file);
    let definition;

    try {
        definition = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (err) {
        console.error(`Error: Failed to parse JSON from ${file}: ${err.message}`);
        process.exit(1);
    }

    if (isCompactDefinition(definition)) {
        console.log(`Info: Input #${i + 1} is already compact and will be used as-is: ${relPath}`);
    } else {
        console.log(`Info: Input #${i + 1} is extended and will be reduced: ${relPath}`);
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
