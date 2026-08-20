#!/usr/bin/env node
'use strict';

/**
 * gen-commands.js — CLI tool to generate a commands.json file from an
 * extended SFSM model (sfsm.ext.json) and an outcome-selection file.
 *
 * The FaRunner's command loop (via CommandInterpreter) needs a
 * `commands.json` mapping each command name to the single result signal
 * that should be fed back for a given use case. A command in the model
 * may declare multiple possible result signals (e.g. weightCheck can
 * produce "Weight valid" or "Weight invalid"); the outcome-selection
 * file picks exactly one per command.
 *
 * Usage:
 *   node gen-commands.js <sfsm.ext.json> <outcomes.json> <output.json>
 *
 * Parameters:
 *   sfsm.ext.json — the extended SFSM model file (components-tree format).
 *   outcomes.json  — a JSON object mapping each fully-qualified command name
 *                    to the selected result signal, e.g.:
 *                    { "Weight-checker.weightCheck": "Weight-checker>Weight valid" }
 *   output.json    — path for the generated commands.json.
 *
 * The script validates that every selected signal is among the command's
 * declared signals in the model, and that every command used in the
 * behavior is covered. Exits 0 on success, 1 on error.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length !== 3) {
    console.error('Usage: node gen-commands.js <sfsm.ext.json> <outcomes.json> <output.json>');
    process.exit(1);
}

const [modelPath, outcomesPath, outputPath] = args.map(
    (a) => path.resolve(process.cwd(), a)
);

// ── Load files ──────────────────────────────────────────────────────────────

let model, outcomes;
for (const [label, file, target] of [
    ['Model', modelPath, 'model'],
    ['Outcomes', outcomesPath, 'outcomes']
]) {
    if (!fs.existsSync(file)) {
        console.error(`Error: ${label} file not found: ${file}`);
        process.exit(1);
    }
    try {
        if (target === 'model') model = JSON.parse(fs.readFileSync(file, 'utf-8'));
        else outcomes = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (err) {
        console.error(`Error: Failed to parse ${label} JSON: ${err.message}`);
        process.exit(1);
    }
}

// ── Walk the component tree: collect commands and behavior commands ─────────

function walkComponent(componentDef, name, ctx) {
    if (componentDef && Array.isArray(componentDef.commands)) {
        for (const cmd of componentDef.commands) {
            if (typeof cmd === 'object' && cmd !== null) {
                for (const [cmdName, cmdDef] of Object.entries(cmd)) {
                    // Command keys are fully-qualified (e.g. "Weight-checker.weightCheck")
                    const fullName = cmdName.includes('.') ? cmdName : `${name}.${cmdName}`;
                    const signals = [];
                    if (cmdDef && Array.isArray(cmdDef.signals)) {
                        for (const sigWrapper of cmdDef.signals) {
                            if (typeof sigWrapper === 'object' && sigWrapper !== null) {
                                for (const sigName of Object.keys(sigWrapper)) {
                                    signals.push(sigName);
                                }
                            }
                        }
                    }
                    ctx.declaredCommands.set(fullName, signals);
                }
            }
        }
    }
    if (componentDef && Array.isArray(componentDef.ts)) {
        for (const t of componentDef.ts) {
            if (t[3]) ctx.behaviorCommands.add(t[3]);
        }
    }
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

const ctx = { declaredCommands: new Map(), behaviorCommands: new Set() };
if (model && Array.isArray(model.components)) {
    for (const wrapper of model.components) {
        if (typeof wrapper === 'object' && wrapper !== null) {
            for (const [rootName, rootDef] of Object.entries(wrapper)) {
                walkComponent(rootDef, rootName, ctx);
            }
        }
    }
}

// ── Validate outcomes against declared commands ────────────────────────────

const errors = [];
const result = {};

for (const [cmdName, selectedSignal] of Object.entries(outcomes)) {
    const declared = ctx.declaredCommands.get(cmdName);
    if (!declared) {
        errors.push(`Command "${cmdName}" not found in the model.`);
        continue;
    }
    if (!declared.includes(selectedSignal)) {
        errors.push(
            `Signal "${selectedSignal}" is not a declared result of command "${cmdName}". ` +
            `Declared signals: [${declared.join(', ')}].`
        );
        continue;
    }
    result[cmdName] = selectedSignal;
}

// Check that every behavior command is covered
for (const cmd of ctx.behaviorCommands) {
    if (!(cmd in result)) {
        errors.push(`Command "${cmd}" is used in the behavior but not covered by the outcomes.`);
    }
}

if (errors.length > 0) {
    console.error('gen-commands: validation failed:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
}

// ── Write output ─────────────────────────────────────────────────────────────

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf-8');
console.log(`commands.json written to: ${outputPath}`);
console.log(`Commands: ${Object.keys(result).length}`);
