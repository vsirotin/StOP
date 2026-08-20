#!/usr/bin/env node
'use strict';

/**
 * validate-whole-sfsm.js — CLI tool to validate a complete SFSM model
 * consisting of a structure JSON and a behavior JSON.
 *
 * This script performs two phases of validation:
 *
 * Phase 1: Run validate-fa.js on the behavior JSON.
 *   If errors occur, the script breaks and reports them.
 *
 * Phase 2: Check 1:1 mapping between structure.json and behavior.json:
 *   - Signals (names) referenced in behavior.json must exist in structure.json
 *   - Commands (names) referenced in behavior.json must exist in structure.json
 *   - FA-names (keys) in behavior.json must match component-keys in structure.json
 *
 * Usage:
 *   node validate-whole-sfsm.js <structure.json> <behavior.json> [output-report.json]
 *
 * Parameters:
 *   structure.json    — JSON file containing the component structure.
 *   behavior.json     — JSON file containing the FA behavior (compact transitions).
 *   output-report.json — (Optional) Path for the validation report. If omitted,
 *                        the report is printed to stdout.
 *
 * Exit codes:
 *   0 — valid (no errors; warnings are allowed).
 *   1 — validation errors found, or file/parse error.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { FaValidator } = require('../lib/sfsm');

// ── Argument parsing ────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length < 2 || args.length > 3) {
    console.error('Usage: node validate-whole-sfsm.js <structure.json> <behavior.json> [output-report.json]');
    process.exit(1);
}

const [structurePath, behaviorPath, outputPath] = args;

const structureFile = path.resolve(process.cwd(), structurePath);
const behaviorFile = path.resolve(process.cwd(), behaviorPath);
const outputFile = outputPath ? path.resolve(process.cwd(), outputPath) : null;

// ── Validate input files exist ──────────────────────────────────────────────

for (const [label, file] of [
    ['Structure', structureFile],
    ['Behavior', behaviorFile]
]) {
    if (!fs.existsSync(file)) {
        console.error(`Error: ${label} file not found: ${file}`);
        process.exit(1);
    }
}

// ── Load JSON files ─────────────────────────────────────────────────────────

let structure, behavior;
try {
    structure = JSON.parse(fs.readFileSync(structureFile, 'utf-8'));
} catch (err) {
    console.error(`Error: Failed to parse structure JSON from ${structureFile}: ${err.message}`);
    process.exit(1);
}

try {
    behavior = JSON.parse(fs.readFileSync(behaviorFile, 'utf-8'));
} catch (err) {
    console.error(`Error: Failed to parse behavior JSON from ${behaviorFile}: ${err.message}`);
    process.exit(1);
}

// ── Phase 1: Validate behavior JSON with FaValidator ───────────────────────

const validator = new FaValidator();
const faResult = validator.validate(behavior);

const errors = [];
const warnings = [];

// Collect FA validation errors
for (const e of faResult.errors) {
    errors.push({
        phase: 'FA validation',
        rule: e.rule,
        message: e.message,
        faName: e.faName,
        transition: e.transition
    });
}

for (const w of faResult.warnings) {
    warnings.push({
        phase: 'FA validation',
        rule: w.rule,
        message: w.message,
        faName: w.faName,
        transition: w.transition
    });
}

// ── Phase 2: Check 1:1 mapping between structure and behavior ──────────────

// Only proceed to Phase 2 if Phase 1 has no errors
if (faResult.errors.length === 0) {

    // 2a: Extract all component names from structure.json
    function extractComponentNames(obj, names) {
        if (!names) names = new Set();
        if (obj && typeof obj === 'object') {
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    extractComponentNames(item, names);
                }
            } else {
                for (const key of Object.keys(obj)) {
                    if (key === 'components') {
                        extractComponentNames(obj[key], names);
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        // This key is a component name
                        names.add(key);
                        if (obj[key].components) {
                            extractComponentNames(obj[key].components, names);
                        }
                    }
                }
            }
        }
        return names;
    }

    const structureComponents = extractComponentNames(structure);

    // 2b: Extract FA names (keys) from behavior.json
    const behaviorFANames = new Set(Object.keys(behavior));

    // 2c: Check FA-names in behavior match component-keys in structure
    for (const faName of behaviorFANames) {
        if (!structureComponents.has(faName)) {
            errors.push({
                phase: 'Structure-behavior mapping',
                rule: 'M1',
                message: `FA name "${faName}" in behavior.json has no corresponding component key in structure.json.`,
                faName: faName
            });
        }
    }

    for (const compName of structureComponents) {
        if (!behaviorFANames.has(compName)) {
            warnings.push({
                phase: 'Structure-behavior mapping',
                rule: 'M2',
                message: `Component "${compName}" in structure.json has no corresponding FA in behavior.json.`,
                faName: compName
            });
        }
    }

    // 2d: Extract all signals and commands from behavior.json transitions
    const behaviorSignals = new Set();
    const behaviorCommands = new Set();

    for (const [faName, transitions] of Object.entries(behavior)) {
        for (const t of transitions) {
            if (t.length >= 2) {
                behaviorSignals.add(t[1]); // signal is element 1
            }
            if (t.length >= 4) {
                behaviorCommands.add(t[3]); // command is element 3
            }
        }
    }

    // 2e: Extract all signals and commands from structure.json
    // Signals are in "signals" arrays within events, and in command result lists
    // Commands are in "commands" arrays
    const structureSignals = new Set();
    const structureCommands = new Set();

    function extractFromComponent(compObj) {
        if (!compObj || typeof compObj !== 'object') return;

        // Extract events and their signals
        if (compObj.events) {
            for (const event of compObj.events) {
                if (typeof event === 'object') {
                    for (const eventName of Object.keys(event)) {
                        const eventDef = event[eventName];
                        if (eventDef && eventDef.signals) {
                            for (const sig of eventDef.signals) {
                                if (typeof sig === 'object') {
                                    for (const sigName of Object.keys(sig)) {
                                        structureSignals.add(sigName);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Extract commands and their result signals
        if (compObj.commands) {
            for (const cmd of compObj.commands) {
                if (typeof cmd === 'object') {
                    for (const cmdName of Object.keys(cmd)) {
                        structureCommands.add(cmdName);
                        const cmdDef = cmd[cmdName];
                        if (cmdDef && cmdDef.results) {
                            for (const result of cmdDef.results) {
                                if (typeof result === 'object') {
                                    for (const resultName of Object.keys(result)) {
                                        structureSignals.add(resultName);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Recurse into sub-components
        if (compObj.components) {
            for (const subComp of compObj.components) {
                if (typeof subComp === 'object') {
                    for (const subName of Object.keys(subComp)) {
                        extractFromComponent(subComp[subName]);
                    }
                }
            }
        }
    }

    // Navigate the structure to extract signals and commands
    if (structure.components) {
        for (const comp of structure.components) {
            if (typeof comp === 'object') {
                for (const compName of Object.keys(comp)) {
                    extractFromComponent(comp[compName]);
                }
            }
        }
    }

    // 2f: Check signals in behavior exist in structure
    for (const sig of behaviorSignals) {
        if (structureSignals.size > 0 && !structureSignals.has(sig)) {
            warnings.push({
                phase: 'Structure-behavior mapping',
                rule: 'M3',
                message: `Signal "${sig}" in behavior.json is not documented in structure.json.`,
            });
        }
    }

    // 2g: Check commands in behavior exist in structure
    for (const cmd of behaviorCommands) {
        if (structureCommands.size > 0 && !structureCommands.has(cmd)) {
            warnings.push({
                phase: 'Structure-behavior mapping',
                rule: 'M4',
                message: `Command "${cmd}" in behavior.json is not documented in structure.json.`,
            });
        }
    }

    // 2h: Check signals in structure exist in behavior
    for (const sig of structureSignals) {
        if (!behaviorSignals.has(sig)) {
            warnings.push({
                phase: 'Structure-behavior mapping',
                rule: 'M5',
                message: `Signal "${sig}" in structure.json is not used in behavior.json.`,
            });
        }
    }

    // 2i: Check commands in structure exist in behavior
    for (const cmd of structureCommands) {
        if (!behaviorCommands.has(cmd)) {
            warnings.push({
                phase: 'Structure-behavior mapping',
                rule: 'M6',
                message: `Command "${cmd}" in structure.json is not used in behavior.json.`,
            });
        }
    }
}

// ── Build report ────────────────────────────────────────────────────────────

const report = {
    valid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
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

if (errors.length > 0) {
    console.error(`Validation FAILED: ${errors.length} error(s), ${warnings.length} warning(s).`);
    process.exit(1);
} else {
    console.log(`Validation PASSED: ${warnings.length} warning(s).`);
    process.exit(0);
}