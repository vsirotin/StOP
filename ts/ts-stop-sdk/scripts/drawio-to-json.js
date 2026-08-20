#!/usr/bin/env node
/**
 * Convert draw.io UML state diagram back to compact SFSM JSON
 * Usage: node drawio-to-json.js <input-drawio> <output-json>
 */

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// ============ MAIN ============
async function main() {
  const [inputDrawioPath, outputJsonPath] = process.argv.slice(2);
  
  if (!inputDrawioPath || !outputJsonPath) {
    console.error('Usage: node drawio-to-json.js <input-drawio> <output-json>');
    process.exit(1);
  }

  try {
    const drawioContent = fs.readFileSync(inputDrawioPath, 'utf-8');
    const json = await convertDrawioToJson(drawioContent);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputJsonPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputJsonPath, JSON.stringify(json, null, 2));
    console.log(`Generated: ${outputJsonPath}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// ============ CONVERSION LOGIC ============

async function convertDrawioToJson(drawioContent) {
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(drawioContent);
  
  const root = result.mxfile.diagram[0].mxGraphModel[0].root[0];
  const mxCells = root.mxCell || [];
  
  // Parse cells
  const cellsMap = new Map(); // id -> cell info
  const transitionsByFa = new Map(); // faName -> [transitions]
  const faNames = new Set();
  
  for (const cell of mxCells) {
    const id = cell.$.id;
    const style = cell.$.style || '';
    const value = cell.$.value || '';
    
    // Extract SFSM metadata from style
    const sfsmRole = extractStyleAttr(style, 'sfsmRole');
    const sfsmFa = extractStyleAttr(style, 'sfsmFa');
    const sfsmKey = extractStyleAttr(style, 'sfsmKey');
    const sfsmSignal = extractStyleAttr(style, 'sfsmSignal');
    const sfsmCommand = extractStyleAttr(style, 'sfsmCommand');
    
    if (sfsmFa) {
      faNames.add(sfsmFa);
      if (!transitionsByFa.has(sfsmFa)) {
        transitionsByFa.set(sfsmFa, []);
      }
    }
    
    cellsMap.set(id, {
      id,
      value,
      sfsmRole,
      sfsmFa,
      sfsmKey,
      sfsmSignal,
      sfsmCommand,
      source: cell.$.source,
      target: cell.$.target
    });
  }
  
  // Build transitions
  for (const [faName] of transitionsByFa) {
    const faTransitions = [];
    
    // Iterate through cells to find transition edges for this FA
    for (const cell of mxCells) {
      const cellId = cell.$.id;
      const cellInfo = cellsMap.get(cellId);
      
      if (!cellInfo) continue;
      if (cellInfo.sfsmRole !== 'transition' || cellInfo.sfsmFa !== faName) continue;
      
      const sourceId = cell.$.source;
      const targetId = cell.$.target;
      
      if (!sourceId || !targetId) continue;
      
      const sourceCell = cellsMap.get(sourceId);
      const targetCell = cellsMap.get(targetId);
      
      if (!sourceCell || !targetCell) continue;
      
      // Determine from state
      let fromState;
      if (sourceCell.sfsmRole === 'initial') {
        fromState = 'I';
      } else if (sourceCell.sfsmKey) {
        fromState = sourceCell.sfsmKey;
      } else {
        continue;
      }
      
      // Determine to state
      const toState = targetCell.sfsmKey;
      if (!toState) continue;
      
      const signal = cellInfo.sfsmSignal;
      const command = cellInfo.sfsmCommand;
      
      // Build transition tuple
      if (command && command.trim()) {
        faTransitions.push([fromState, signal, toState, command]);
      } else {
        faTransitions.push([fromState, signal, toState]);
      }
    }
    
    transitionsByFa.set(faName, faTransitions);
  }
  
  // Build compact JSON
  const compactJson = {};
  for (const faName of faNames) {
    compactJson[faName] = transitionsByFa.get(faName) || [];
  }
  
  return compactJson;
}

function extractStyleAttr(style, attrName) {
  const regex = new RegExp(`${attrName}=([^;]+)`);
  const match = style.match(regex);
  return match ? match[1] : '';
}

main();
