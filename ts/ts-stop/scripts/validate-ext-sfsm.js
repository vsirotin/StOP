#!/usr/bin/env node
'use strict';

/**
 * validate-ext-sfsm.js — CLI tool to validate a complete extended SFSM model
 * (sfsm.ext.json) that uses the `components`-tree format defined by the
 * stop-sfsm-modeller skill.
 *
 * The validation has two phases:
 *
 * Phase 1: Extract the compact FA (behavior) from the components tree and
 *   run FaValidator on it. If errors occur, the script reports them.
 *
 * Phase 2: Cross-check the structure (events/commands metadata) against the
 *   behavior (transitions):
 *   - Every signal referenced in a transition must be documented in some
 *     component's events or commands.
 *   - Every command referenced in a transition must be documented in some
 *     component's commands.
 *   - Every FA name (key in the compact FA) must correspond to a component
 *     in the structure.
 *
 * Usage:
 *   node validate-ext-sfsm.js <sfsm.ext.json> [output-report.json]
 *
 * Exit codes:
 *   0 — valid (no errors; warnings are allowed).
 *   1 — validation errors found, or file/parse error.
 */

const fs = require('fs');
const path = require('path');
const { FaValidator } = require('../lib/sfsm');

// ── Argument parsing ────────────────────────────────────────────────────────

const rawArgs = process.argv.slice(2);

// Extract --suppress flag
let suppressRules = new Set();
const positionalArgs = [];
for (let i = 0; i < rawArgs.length; i++) {
    if (rawArgs[i] === '--suppress') {
        if (i + 1 >= rawArgs.length) {
            console.error('Error: --suppress requires a comma-separated list of rule numbers');
            process.exit(1);
        }
        for (const r of rawArgs[i + 1].split(',')) {
            suppressRules.add(r.trim());
        }
        i++; // skip the value
    } else {
        positionalArgs.push(rawArgs[i]);
    }
}

if (positionalArgs.length < 1 || positionalArgs.length > 2) {
    console.error('Usage: node validate-ext-sfsm.js <sfsm.ext.json> [output-report.json] [--suppress 6,10,M3]');
    process.exit(1);
}

const [inputArg, outputArg] = positionalArgs;
const inputFile = path.resolve(process.cwd(), inputArg);
const outputFile = outputArg ? path.resolve(process.cwd(), outputArg) : null;

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

// ── Walk the component tree ─────────────────────────────────────────────────

function walkComponent(componentDef, name, ctx) {
    ctx.componentNames.add(name);

    if (componentDef && Array.isArray(componentDef.ts)) {
        ctx.compactFa[name] = componentDef.ts;
    }

    // Collect signals from events
    if (componentDef && Array.isArray(componentDef.events)) {
        for (const event of componentDef.events) {
            if (typeof event === 'object' && event !== null) {
                for (const eventDef of Object.values(event)) {
                    if (eventDef && Array.isArray(eventDef.signals)) {
                        for (const sigWrapper of eventDef.signals) {
                            if (typeof sigWrapper === 'object' && sigWrapper !== null) {
                                for (const sigName of Object.keys(sigWrapper)) {
                                    ctx.structureSignals.add(sigName);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Collect commands and their result signals
    if (componentDef && Array.isArray(componentDef.commands)) {
        for (const cmd of componentDef.commands) {
            if (typeof cmd === 'object' && cmd !== null) {
                for (const [cmdName, cmdDef] of Object.entries(cmd)) {
                    ctx.structureCommands.add(cmdName);
                    if (cmdDef && Array.isArray(cmdDef.signals)) {
                        for (const sigWrapper of cmdDef.signals) {
                            if (typeof sigWrapper === 'object' && sigWrapper !== null) {
                                for (const sigName of Object.keys(sigWrapper)) {
                                    ctx.structureSignals.add(sigName);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Recurse into children
    if (componentDef && Array.isArray(componentDef.components)) {
        for (const wrapper of componentDef.components) {
            if (typeof wrapper === 'object' && wrapper !== null) {
                for (const [childName, childDef] of Object.entries(wrapper)) {
                    walkComponent(childDef, childName, ctx);
                }
            }
        }
    }
}

const ctx = {
    compactFa: {},
    structureSignals: new Set(),
    structureCommands: new Set(),
    componentNames: new Set()
};

if (model && Array.isArray(model.components)) {
    for (const wrapper of model.components) {
        if (typeof wrapper === 'object' && wrapper !== null) {
            for (const [rootName, rootDef] of Object.entries(wrapper)) {
                walkComponent(rootDef, rootName, ctx);
            }
        }
    }
}

// ── Phase 1: Validate the compact FA with FaValidator ───────────────────────

const validator = new FaValidator();
const faResult = validator.validate(ctx.compactFa);

const errors = [];
const warnings = [];

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

// ── Phase 2: Cross-check structure vs. behavior ────────────────────────────

const behaviorSignals = new Set();
const behaviorCommands = new Set();

for (const [faName, transitions] of Object.entries(ctx.compactFa)) {
    for (const t of transitions) {
        behaviorSignals.add(t[1]);
        if (t[3]) {
            behaviorCommands.add(t[3]);
        }
    }
}

// 2a: FA names in behavior must exist as components
for (const faName of Object.keys(ctx.compactFa)) {
    if (!ctx.componentNames.has(faName)) {
        errors.push({
            phase: 'Structure-behavior mapping',
            rule: 'M1',
            message: `FA "${faName}" in behavior has no corresponding component in the structure.`
        });
    }
}

// 2b: Signals in behavior should be documented in structure
for (const sig of behaviorSignals) {
    if (ctx.structureSignals.size > 0 && !ctx.structureSignals.has(sig)) {
        warnings.push({
            phase: 'Structure-behavior mapping',
            rule: 'M2',
            message: `Signal "${sig}" in behavior is not documented in the structure (events/commands).`
        });
    }
}

// 2c: Commands in behavior should be documented in structure
for (const cmd of behaviorCommands) {
    if (ctx.structureCommands.size > 0 && !ctx.structureCommands.has(cmd)) {
        warnings.push({
            phase: 'Structure-behavior mapping',
            rule: 'M3',
            message: `Command "${cmd}" in behavior is not documented in the structure (commands).`
        });
    }
}

// 2d: Signals in structure should be used in behavior
for (const sig of ctx.structureSignals) {
    if (!behaviorSignals.has(sig)) {
        warnings.push({
            phase: 'Structure-behavior mapping',
            rule: 'M4',
            message: `Signal "${sig}" in structure is not used in behavior.`
        });
    }
}

// 2e: Commands in structure should be used in behavior
for (const cmd of ctx.structureCommands) {
    if (!behaviorCommands.has(cmd)) {
        warnings.push({
            phase: 'Structure-behavior mapping',
            rule: 'M5',
            message: `Command "${cmd}" in structure is not used in behavior.`
        });
    }
}

// ── Apply suppression filter ────────────────────────────────────────────────
// Remove warnings whose rule (as a string) is in the suppressRules set.
// FA-validation rules are numbers (e.g. 6, 10); M-rules are strings (e.g. "M3").
// Both are matched as strings: "6" matches rule 6, "M3" matches rule "M3".

const filteredWarnings = warnings.filter((w) => {
    return !suppressRules.has(String(w.rule));
});

// ── Build report ────────────────────────────────────────────────────────────

const report = {
    valid: errors.length === 0,
    errorCount: errors.length,
    warningCount: filteredWarnings.length,
    errors: errors,
    warnings: filteredWarnings
};

const json = JSON.stringify(report, null, 2);

if (outputFile) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, `${json}\n`, 'utf-8');
    console.log(`Validation report written to: ${outputFile}`);
} else {
    console.log(json);
}

if (errors.length > 0) {
    console.error(`Validation FAILED: ${errors.length} error(s), ${filteredWarnings.length} warning(s).`);
    process.exit(1);
} else {
    console.log(`Validation PASSED: ${filteredWarnings.length} warning(s).`);
    process.exit(0);
}

