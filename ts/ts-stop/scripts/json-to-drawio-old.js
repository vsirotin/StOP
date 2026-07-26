#!/usr/bin/env node
/**
 * Convert SFSM compact-format FA JSON to draw.io UML state diagram using ELK.js for hierarchical layout
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
  const rootFaName = getRootFaName(faData);
  const allFaNames = Object.keys(faData);
  
  // Build hierarchical graph structure
  const { cellsMap, edgeList } = await buildHierarchicalGraph(rootFaName, faData, allFaNames);
  
  // Convert to drawio
  return buildDrawioXml(cellsMap, edgeList);
}

function getRootFaName(faData) {
  const allFaNames = Object.keys(faData);
  const referencedFas = new Set();
  
  for (const faKey of allFaNames) {
    const transitions = faData[faKey];
    for (const tr of transitions) {
      const toState = tr[2];
      if (allFaNames.includes(toState)) {
        referencedFas.add(toState);
      }
    }
  }
  
  for (const faName of allFaNames) {
    if (!referencedFas.has(faName)) {
      return faName;
    }
  }
  
  return allFaNames[0];
}

function buildGraphForELK(rootFaName, faData, allFaNames) {
  const nodes = [];
  const edges = [];
  const nodeMap = new Map(); // nodeId -> { faKey, state, label, type }
  const edgeMap = new Map(); // edgeId -> { from, signal, to, command, faKey }
  const stateNodeMap = new Map(); // `${faKey}:${state}` -> nodeId
  
  let nodeCounter = 0;
  let edgeCounter = 0;
  
  // Process all FAs (both root and sub-FAs)
  for (const faName of allFaNames) {
    processFA(faName, faData, allFaNames, nodes, edges, nodeMap, edgeMap, stateNodeMap, nodeCounter, edgeCounter);
  }
  
  return { nodes, edges: edges, nodeMap, edgeMap };
}

function processFA(faKey, faData, allFaNames, nodes, edges, nodeMap, edgeMap, stateNodeMap, nodeCounter, edgeCounter) {
  const transitions = faData[faKey];
  const states = new Set();
  const exitStates = new Set();
  
  // Collect states and exit states
  for (const tr of transitions) {
    const [from, signal, to, command] = tr;
    states.add(from);
    states.add(to);
    if (to.startsWith('E_')) {
      exitStates.add(to);
    }
  }
  
  // Create node for initial state
  const initId = `init-${faKey}`;
  nodeMap.set(initId, { faKey, state: 'I', label: '', type: 'initial' });
  stateNodeMap.set(`${faKey}:I`, initId);
  nodes.push({
    id: initId,
    width: 20,
    height: 20,
    properties: { sfsmRole: 'initial', sfsmFa: faKey }
  });
  
  // Create nodes for other states
  for (const state of states) {
    if (state === 'I') continue;
    
    let type = 'state';
    let label = state;
    
    if (exitStates.has(state)) {
      type = 'exit';
    } else if (allFaNames.includes(state)) {
      type = 'subfa';
    }
    
    const nodeId = `state-${faKey}-${state}`;
    nodeMap.set(nodeId, { faKey, state, label, type });
    stateNodeMap.set(`${faKey}:${state}`, nodeId);
    
    const width = type === 'exit' ? 70 : 140;
    const height = type === 'exit' ? 70 : 50;
    
    nodes.push({
      id: nodeId,
      width: width,
      height: height,
      labels: [{ text: label }],
      properties: { 
        sfsmRole: type, 
        sfsmFa: faKey,
        sfsmKey: state
      }
    });
  }
  
  // Create edges
  for (const tr of transitions) {
    const [from, signal, to, command] = tr;
    const sourceId = stateNodeMap.get(`${faKey}:${from}`);
    const targetId = stateNodeMap.get(`${faKey}:${to}`);
    
    if (!sourceId || !targetId) continue;
    
    const edgeLabel = command ? `${signal} / ${to}:${command}` : signal;
    const edgeId = `tr-${faKey}-${edgeCounter++}`;
    
    edgeMap.set(edgeId, { from, signal, to, command, faKey });
    
    edges.push({
      id: edgeId,
      sources: [sourceId],
      targets: [targetId],
      labels: [{ text: edgeLabel }],
      properties: {
        sfsmRole: 'transition',
        sfsmFa: faKey,
        sfsmSignal: signal,
        sfsmCommand: command || ''
      }
    });
  }
}

function buildDrawioXmlFromLayout(layout, nodeMap, edgeMap, faData, allFaNames) {
  const cellsMap = new Map();
  const edges = [];
  
  // Convert ELK nodes to drawio cells
  function convertNodes(elkNodes, parent = '1') {
    if (!elkNodes) return;
    
    for (const elkNode of elkNodes) {
      const nodeInfo = nodeMap.get(elkNode.id);
      if (!nodeInfo) continue;
      
      const { faKey, state, label, type } = nodeInfo;
      let style = '';
      let width = 20;
      let height = 20;
      
      switch (type) {
        case 'initial':
          style = `ellipse;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#000000;sfsmRole=initial;sfsmFa=${faKey};`;
          width = 20;
          height = 20;
          break;
        case 'exit':
          style = `ellipse;whiteSpace=wrap;html=1;strokeWidth=3;fillColor=#FFFFFF;sfsmRole=exit;sfsmFa=${faKey};sfsmKey=${state};`;
          width = 70;
          height = 70;
          break;
        case 'subfa':
          style = `swimlane;whiteSpace=wrap;html=1;startSize=26;sfsmRole=subfa;sfsmFa=${faKey};sfsmKey=${state};`;
          width = 200;
          height = 200;
          break;
        default:
          style = `rounded=1;whiteSpace=wrap;html=1;arcSize=20;sfsmRole=state;sfsmFa=${faKey};sfsmKey=${state};`;
          width = 140;
          height = 50;
      }
      
      cellsMap.set(elkNode.id, {
        id: elkNode.id,
        value: label,
        style: style,
        x: Math.round(elkNode.x || 0),
        y: Math.round(elkNode.y || 0),
        width: width,
        height: height,
        parent: parent
      });
      
      // Recursively process children
      if (elkNode.children) {
        convertNodes(elkNode.children, elkNode.id);
      }
    }
  }
  
  convertNodes(layout.children);
  
  // Convert ELK edges to drawio edges
  if (layout.edges) {
    for (const elkEdge of layout.edges) {
      const edgeInfo = edgeMap.get(elkEdge.id);
      if (!edgeInfo) continue;
      
      const { from, signal, to, command, faKey } = edgeInfo;
      const edgeLabel = command ? `${signal} / ${to}:${command}` : signal;
      
      let style = `edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;sfsmRole=transition;sfsmFa=${faKey};sfsmSignal=${signal};sfsmCommand=${command || ''};`;
      if (from === to) {
        style += `exitX=0.25;exitY=0;exitDx=0;exitDy=0;entryX=0.75;entryY=0;entryDx=0;entryDy=0;`;
      }
      
      edges.push({
        id: elkEdge.id,
        value: edgeLabel,
        style: style,
        source: elkEdge.sources[0],
        target: elkEdge.targets[0],
        parent: '1'
      });
    }
  }
  
  return buildDrawioXml(cellsMap, edges);
}

function buildDrawioXml(cellsMap, edges) {
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
  
  for (const edge of edges) {
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
