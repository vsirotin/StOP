#!/usr/bin/env node
/**
 * Compare two compact SFSM JSON files
 * Usage: node compare-compact-jsons.js <json-a> <json-b>
 */

const fs = require('fs');

// ============ MAIN ============
function main() {
  const [jsonAPath, jsonBPath] = process.argv.slice(2);
  
  if (!jsonAPath || !jsonBPath) {
    console.error('Usage: node compare-compact-jsons.js <json-a> <json-b>');
    process.exit(1);
  }

  try {
    const jsonA = JSON.parse(fs.readFileSync(jsonAPath, 'utf-8'));
    const jsonB = JSON.parse(fs.readFileSync(jsonBPath, 'utf-8'));
    
    console.log('\n======== SFSM COMPACT JSON COMPARISON ========\n');
    console.log(`File A: ${jsonAPath}`);
    console.log(`File B: ${jsonBPath}\n`);
    
    compareJsons(jsonA, jsonB);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// ============ COMPARISON LOGIC ============

function compareJsons(jsonA, jsonB) {
  const fasA = Object.keys(jsonA);
  const fasB = Object.keys(jsonB);
  
  console.log('--- FA NAMES ---');
  console.log(`A: [${fasA.join(', ')}] (${fasA.length} FAs)`);
  console.log(`B: [${fasB.join(', ')}] (${fasB.length} FAs)`);
  
  const missingInB = fasA.filter(fa => !fasB.includes(fa));
  const missingInA = fasB.filter(fa => !fasA.includes(fa));
  
  if (missingInB.length > 0) {
    console.log(`  ❌ Missing in B: ${missingInB.join(', ')}`);
  }
  if (missingInA.length > 0) {
    console.log(`  ❌ Missing in A: ${missingInA.join(', ')}`);
  }
  
  const commonFas = fasA.filter(fa => fasB.includes(fa));
  if (commonFas.length === fasA.length && commonFas.length === fasB.length) {
    console.log(`  ✓ All FAs match\n`);
  } else {
    console.log();
  }
  
  // Compare transitions per FA
  console.log('--- TRANSITIONS PER FA ---');
  let totalTransitionsA = 0;
  let totalTransitionsB = 0;
  let totalDifferences = 0;
  
  for (const fa of commonFas) {
    const transA = jsonA[fa] || [];
    const transB = jsonB[fa] || [];
    
    totalTransitionsA += transA.length;
    totalTransitionsB += transB.length;
    
    console.log(`\nFA: ${fa}`);
    console.log(`  A: ${transA.length} transitions`);
    console.log(`  B: ${transB.length} transitions`);
    
    // Normalize transitions for comparison
    const transANorm = transA.map(tr => normalizeTransition(tr));
    const transBNorm = transB.map(tr => normalizeTransition(tr));
    
    // Find missing and extra transitions
    const missingInBTrans = [];
    const missingInATrans = [];
    
    for (let i = 0; i < transANorm.length; i++) {
      const trStr = transANorm[i];
      const found = transBNorm.some(t => t === trStr);
      if (!found) {
        missingInBTrans.push(transA[i]);
      }
    }
    
    for (let i = 0; i < transBNorm.length; i++) {
      const trStr = transBNorm[i];
      const found = transANorm.some(t => t === trStr);
      if (!found) {
        missingInATrans.push(transB[i]);
      }
    }
    
    if (missingInBTrans.length === 0 && missingInATrans.length === 0) {
      console.log(`  ✓ All transitions match`);
    } else {
      if (missingInBTrans.length > 0) {
        console.log(`  ❌ Missing in B (${missingInBTrans.length}):`);
        for (const tr of missingInBTrans) {
          console.log(`     ${JSON.stringify(tr)}`);
        }
        totalDifferences += missingInBTrans.length;
      }
      if (missingInATrans.length > 0) {
        console.log(`  ❌ Extra in B / Missing in A (${missingInATrans.length}):`);
        for (const tr of missingInATrans) {
          console.log(`     ${JSON.stringify(tr)}`);
        }
        totalDifferences += missingInATrans.length;
      }
    }
  }
  
  // Summary
  console.log('\n--- SUMMARY ---');
  console.log(`Total FAs:        A=${fasA.length}, B=${fasB.length}`);
  console.log(`Total transitions: A=${totalTransitionsA}, B=${totalTransitionsB}`);
  console.log(`Total differences: ${totalDifferences}`);
  
  if (totalDifferences === 0 && fasA.length === fasB.length && totalTransitionsA === totalTransitionsB) {
    console.log('\n✓ FILES ARE IDENTICAL');
  } else {
    console.log('\n❌ FILES DIFFER');
  }
  console.log();
}

function normalizeTransition(tr) {
  // Transition format: [from, signal, to] or [from, signal, to, command]
  if (tr.length === 3) {
    return `${tr[0]}|${tr[1]}|${tr[2]}`;
  } else if (tr.length === 4) {
    return `${tr[0]}|${tr[1]}|${tr[2]}|${tr[3]}`;
  }
  return '';
}

main();
