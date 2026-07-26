#!/usr/bin/env node

/**
 * Simple import test to verify @vsirotin/ts-stop package works correctly
 * after local installation or npm deployment.
 */

try {
  console.log('Testing @vsirotin/ts-stop imports...\n');

  // Test main export
  const { Sfsm } = require('@vsirotin/ts-stop');
  console.log('✅ Main export works: Sfsm imported');

  // Test sfsm submodule export
  const { FaDefinition } = require('@vsirotin/ts-stop/sfsm');
  console.log('✅ Submodule export works: FaDefinition imported from sfsm');

  // Test CLI tools are present
  const fs = require('fs');
  const path = require('path');
  
  const scriptsPath = path.join(__dirname, '../node_modules/@vsirotin/ts-stop/scripts');
  const scripts = [
    'reduce-fa.js',
    'merge-fas.js',
    'merge-fas-from-dir.js',
    'update-fa.js',
    'json-to-drawio.js',
    'drawio-to-json.js',
    'compare-compact-jsons.js'
  ];

  const missingScripts = scripts.filter(script => !fs.existsSync(path.join(scriptsPath, script)));
  if (missingScripts.length === 0) {
    console.log(`✅ All 7 CLI tools present in scripts/`);
  } else {
    console.log(`❌ Missing scripts: ${missingScripts.join(', ')}`);
    process.exit(1);
  }

  // Test tutorial is present
  const tutorialPath = path.join(__dirname, '../node_modules/@vsirotin/ts-stop/tutorial');
  if (fs.existsSync(tutorialPath)) {
    console.log('✅ Tutorial directory present');
  } else {
    console.log('❌ Tutorial directory missing');
    process.exit(1);
  }

  // Test AI skills are present
  const aiSkillsPath = path.join(__dirname, '../node_modules/@vsirotin/ts-stop/ai/skills');
  if (fs.existsSync(aiSkillsPath)) {
    console.log('✅ AI skills directory present');
  } else {
    console.log('❌ AI skills directory missing');
    process.exit(1);
  }

  console.log('\n✅ All tests passed! Package is ready to use.');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
