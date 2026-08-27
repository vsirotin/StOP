#!/usr/bin/env node

/**
 * Simple import test to verify the @vsirotin/ts-stop-sdk package works
 * correctly after local installation or npm deployment.
 *
 * It verifies:
 *  - the SDK package (@vsirotin/ts-stop-sdk) resolves and exposes both the
 *    core library (re-exported from @vsirotin/ts-stop) and the Node-only
 *    loader helpers (loadFAFromFile / loadFAFromURL),
 *  - the SDK ships its CLI tools, tutorial, and AI skills.
 */

try {
  console.log('Testing @vsirotin/ts-stop-sdk imports...\n');

  // Test SDK main export (re-exports the core library + Node helpers)
  const sdk = require('@vsirotin/ts-stop-sdk');
  if (typeof sdk.Sfsm !== 'function') throw new Error('Sfsm not exported by SDK');
  console.log('✅ SDK exports Sfsm (re-exported from @vsirotin/ts-stop)');

  if (typeof sdk.loadFAFromFile !== 'function') throw new Error('loadFAFromFile missing');
  console.log('✅ SDK exports loadFAFromFile (Node-only helper)');

  if (typeof sdk.FaRunner !== 'function') throw new Error('FaRunner missing');
  console.log('✅ SDK exports FaRunner');

  // Verify the SDK package itself is present with its scripts/tutorial/skills
  const fs = require('fs');
  const path = require('path');

  // Resolve to the SDK's main file (lib/index.js), then walk up to the package root
  const sdkMainFile = require.resolve('@vsirotin/ts-stop-sdk');
  const sdkPath = path.resolve(path.dirname(sdkMainFile), '..');
  const sdkVersion = JSON.parse(fs.readFileSync(path.join(sdkPath, 'package.json'), 'utf-8')).version;
  console.log(`✅ SDK package found (version ${sdkVersion})`);

  const scripts = [
    'reduce-fa.js',
    'merge-fas.js',
    'merge-fas-from-dir.js',
    'update-fa.js',
    'json-to-drawio.js',
    'drawio-to-json.js',
    'compare-compact-jsons.js'
  ];
  const missingScripts = scripts.filter(script => !fs.existsSync(path.join(sdkPath, 'scripts', script)));
  if (missingScripts.length !== 0) {
    throw new Error(`Missing SDK scripts: ${missingScripts.join(', ')}`);
  }
  console.log('✅ All CLI tools present in SDK scripts/');

  const tutorialPath = path.join(sdkPath, 'tutorial');
  if (!fs.existsSync(tutorialPath)) throw new Error('Tutorial directory missing');
  console.log('✅ SDK tutorial directory present');

  const aiSkillsPath = path.join(sdkPath, 'ai', 'skills');
  if (!fs.existsSync(aiSkillsPath)) throw new Error('AI skills directory missing');
  console.log('✅ SDK ai/skills directory present');

  console.log('\n✅ All tests passed! SDK package is ready to use.');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
