#!/usr/bin/env node
/**
 * Convert SFSM compact-format FA JSON to draw.io UML state diagram
 * Each FA is a separate container, sub-FAs are nested containers with light grey background
 * Usage: node json-to-drawio.js <input-json> <output-drawio>
 */

const fs = require('fs');
const path = require('path');
const ELK = require('elkjs').default;

const elk = new ELK();

// ============ MAIN ============
async function main() {
  const [inputJsonPath, outputDrawioPath] = process.argv.slice(2);
  
  if (!inputJsonPath || !outputDrawioPath) {
    console.error('Usage: node json-to-drawio.js <input-json> <output-drawio>');
    process.exit(1);
  }

  try {
    const faData = JSON.parse(fs.readFileSync(inputJsonPath, 'utf-8'));
    const drawio = await generateDrawio(faData);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputDrawioPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputDrawioPath, drawio);
    console.log(`Generated: ${outputDrawioPath}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// ============ CONVERSION LOGIC ============

async function generateDrawio(faData) {
  const allFaNames = Object.keys(faData);
  const cellsMap = new Map();
  const edgeList = [];
  const stateNodeMap = new Map(); // `${faKey}:${state}` -> nodeId
  
  let containerYOffset = 20; // Track vertical position of containers
  
  // Process each FA and create its container with nested states
  for (const faName of allFaNames) {
    containerYOffset = await processFAWithContainer(faName, faData, allFaNames, cellsMap, edgeList, stateNodeMap, containerYOffset);
  }
  
  // Convert to drawio
  return buildDrawioXml(cellsMap, edgeList);
}

async function processFAWithContainer(faKey, faData, allFaNames, cellsMap, edgeList, stateNodeMap, containerYPos) {
  const transitions = faData[faKey];
  const states = new Set();
  const exitStates = new Set();
  const subFaStates = new Set();
  
  // Collect state information
  for (const tr of transitions) {
    const [from, signal, to] = tr;
    states.add(from);
    states.add(to);
    
    if (to.startsWith('E_')) {
      exitStates.add(to);
    }
    if (allFaNames.includes(to)) {
      subFaStates.add(to);
    }
  }
  
  // Build ELK graph structure for this FA's layout
  const elkChildren = [];
  const nodePositions = new Map(); // nodeId -> {x, y}
  
  // Initial state
  const initId = `init-${faKey}`;
  elkChildren.push({
    id: initId,
    width: 20,
    height: 20
  });
  
  // Other states
  for (const state of states) {
    if (state === 'I') continue;
    
    const nodeId = `state-${faKey}-${state}`;
    let width = 120;
    let height = 50;
    
    if (exitStates.has(state)) {
      width = 70;
      height = 70;
    } else if (subFaStates.has(state)) {
      // Sub-FA: much smaller size
      width = 100;
      height = 60;
    }
    
    elkChildren.push({
      id: nodeId,
      width: width,
      height: height,
      labels: [{ text: state }]
    });
  }
  
  // Build ELK edges for this FA
  const elkEdges = [];
  for (const tr of transitions) {
    const [from, signal, to] = tr;
    const fromId = from === 'I' ? `init-${faKey}` : `state-${faKey}-${from}`;
    const toId = `state-${faKey}-${to}`;
    
    elkEdges.push({
      id: `tr-${faKey}-${from}-${to}`,
      sources: [fromId],
      targets: [toId],
      labels: [{ text: signal }]
    });
  }
  
  // Layout this FA using ELK
  const graph = {
    id: `graph-${faKey}`,
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '30',
      'elk.spacing.edgeNode': '15',
      'elk.layered.spacing.edgeNodeBetweenLayers': '20'
    },
    children: elkChildren,
    edges: elkEdges
  };
  
  try {
    const layout = await elk.layout(graph);
    
    // Extract positions from layout
    if (layout.children) {
      for (const node of layout.children) {
        nodePositions.set(node.id, { x: Math.round(node.x || 0), y: Math.round(node.y || 0) });
      }
    }
  } catch (err) {
    console.warn(`Warning: ELK layout failed for ${faKey}, using default positions`);
  }
  
  // Create cells for this FA's states
  // Initial state
  const initPos = nodePositions.get(initId) || { x: 20, y: 20 };
  cellsMap.set(initId, {
    id: initId,
    value: '',
    style: `ellipse;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#000000;sfsmRole=initial;sfsmFa=${faKey};`,
    x: initPos.x,
    y: initPos.y,
    width: 20,
    height: 20,
    parent: `container-${faKey}`
  });
  stateNodeMap.set(`${faKey}:I`, initId);
  
  // Other states
  for (const state of states) {
    if (state === 'I') continue;
    
    const nodeId = `state-${faKey}-${state}`;
    const pos = nodePositions.get(nodeId) || { x: 20, y: 80 };
    let style = '';
    let width = 120;
    let height = 50;
    
    if (exitStates.has(state)) {
      style = `ellipse;whiteSpace=wrap;html=1;strokeWidth=3;fillColor=#FFFFFF;sfsmRole=exit;sfsmFa=${faKey};sfsmKey=${state};`;
      width = 70;
      height = 70;
    } else if (subFaStates.has(state)) {
      // Sub-FA: light grey container, smaller size
      style = `rounded=0;whiteSpace=wrap;html=1;fillColor=#E8E8E8;strokeColor=#999999;strokeWidth=2;sfsmRole=subfa;sfsmFa=${faKey};sfsmKey=${state};`;
      width = 100;
      height = 60;
    } else {
      style = `rounded=1;whiteSpace=wrap;html=1;arcSize=20;sfsmRole=state;sfsmFa=${faKey};sfsmKey=${state};`;
    }
    
    cellsMap.set(nodeId, {
      id: nodeId,
      value: state,
      style: style,
      x: pos.x,
      y: pos.y,
      width: width,
      height: height,
      parent: `container-${faKey}`
    });
    stateNodeMap.set(`${faKey}:${state}`, nodeId);
  }
  
  // Calculate container size based on layout
  let maxX = 40;
  let maxY = 40;
  for (const [, pos] of nodePositions) {
    maxX = Math.max(maxX, pos.x + 150);
    maxY = Math.max(maxY, pos.y + 100);
  }
  
  const containerWidth = Math.max(280, maxX + 40);
  const containerHeight = Math.max(140, maxY + 40);
  
  // Create container for FA at specified Y position
  const containerId = `container-${faKey}`;
  cellsMap.set(containerId, {
    id: containerId,
    value: faKey,
    style: `swimlane;whiteSpace=wrap;html=1;startSize=35;fontStyle=1;rounded=1;sfsmRole=facontainer;sfsmFa=${faKey};`,
    x: 20,
    y: containerYPos,
    width: containerWidth,
    height: containerHeight,
    parent: '1'
  });
  
  // Create transitions
  let transitionCounter = 0;
  for (const tr of transitions) {
    const [from, signal, to, command] = tr;
    const fromState = from === 'I' ? 'I' : from;
    const sourceId = stateNodeMap.get(`${faKey}:${fromState}`);
    const targetId = stateNodeMap.get(`${faKey}:${to}`);
    
    if (!sourceId || !targetId) continue;
    
    const edgeLabel = command ? `${signal} / ${to}:${command}` : signal;
    const edgeId = `tr-${faKey}-${transitionCounter++}`;
    const isLoop = from === to;
    
    let style = `edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;sfsmRole=transition;sfsmFa=${faKey};sfsmSignal=${signal};sfsmCommand=${command || ''};`;
    if (isLoop) {
      style += `exitX=0.25;exitY=0;exitDx=0;exitDy=0;entryX=0.75;entryY=0;entryDx=0;entryDy=0;`;
    }
    
    edgeList.push({
      id: edgeId,
      value: edgeLabel,
      style: style,
      source: sourceId,
      target: targetId,
      parent: '1'
    });
  }
  
  // Return next Y position for next container (with some spacing)
  return containerYPos + containerHeight + 30;
}

function buildDrawioXml(cellsMap, edgeList) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron">
  <diagram id="sfsm-diagram" name="Page-1">
    <mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
`;
  
  for (const [cellId, cell] of cellsMap) {
    xml += `        <mxCell id="${cell.id}" value="${escapeXml(cell.value)}" style="${cell.style}" vertex="1" parent="${cell.parent}">
          <mxGeometry x="${cell.x}" y="${cell.y}" width="${cell.width}" height="${cell.height}" as="geometry"/>
        </mxCell>
`;
  }
  
  for (const edge of edgeList) {
    xml += `        <mxCell id="${edge.id}" value="${escapeXml(edge.value)}" style="${edge.style}" edge="1" parent="${edge.parent}" source="${edge.source}" target="${edge.target}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
`;
  }
  
  xml += `      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  
  return xml;
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

main();
