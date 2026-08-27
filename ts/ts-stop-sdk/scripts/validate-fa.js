#!/usr/bin/env node
'use strict';

/**
 * validate-fa.js — CLI tool to validate a finite automaton (FA) definition in
 * compact or extended JSON format against a set of structural rules.
 *
 * This is the command-line counterpart of the FaValidator class
 * (see src/sfsm/tools/runner/FaValidator.ts). It loads a JSON file containing
 * an FA definition, runs all validation rules, and prints the results.
 *
 * Usage:
 *   node validate-fa.js <fa.json> [output.json]
 *
 * Parameters:
 *   fa.json     — JSON file containing the FA definition (compact or extended).
 *   output.json — (Optional) Path for the validation report. If omitted, the
 *                 report is printed to stdout.
 *
 * Exit codes:
 *   0 — valid (no errors; warnings are allowed).
 *   1 — validation errors found, or file/parse error.
 */

const fs = require('fs');
const path = require('path');
const { FaValidator } = require('@vsirotin/ts-stop/sfsm');

// ── Argument parsing ────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length < 1 || args.length > 2) {
    console.error('Usage: node validate-fa.js <fa.json> [output.json]');
    process.exit(1);
}

const [faPath, outputPath] = args;

const faFile = path.resolve(process.cwd(), faPath);
const outputFile = outputPath ? path.resolve(process.cwd(), outputPath) : null;

// ── Validate input file exists ──────────────────────────────────────────────

if (!fs.existsSync(faFile)) {
    console.error(`Error: FA definition file not found: ${faFile}`);
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

// ── Validate ────────────────────────────────────────────────────────────────

const validator = new FaValidator();
const result = validator.validate(faDefinition);

// ── Format output ───────────────────────────────────────────────────────────

const report = {
    valid: result.valid,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    errors: result.errors.map(e => ({
        rule: e.rule,
        message: e.message,
        faName: e.faName,
        transition: e.transition
    })),
    warnings: result.warnings.map(w => ({
        rule: w.rule,
        message: w.message,
        faName: w.faName,
        transition: w.transition
    }))
};

const json = JSON.stringify(report, null, 2);

if (outputFile) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, `${json}\n`, 'utf-8');
    console.log(`Validation report written to: ${outputFile}`);
} else {
    console.log(json);
}

// ── Exit with appropriate code ──────────────────────────────────────────────

if (!result.valid) {
    console.error(`Validation FAILED: ${result.errors.length} error(s), ${result.warnings.length} warning(s).`);
    process.exit(1);
} else {
    console.log(`Validation PASSED: ${result.warnings.length} warning(s).`);
    process.exit(0);
}