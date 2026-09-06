---
name: sfsm-json-to-uml-diagram
description: Convert an SFSM FA definition JSON file (compact or extended format) to a professional draw.io UML state diagram with hierarchical ELK.js layout. Use when asked to visualize or diagram an SFSM JSON definition. The generated diagram may require small manual repositioning for visual perfection.
metadata:
  author: vsirotin
  version: "2.0"
---

# SFSM JSON → UML State Diagram (draw.io)

This skill wraps the `ts/ts-stop/scripts/json-to-drawio.js` script to convert an SFSM FA definition into a professional, hierarchical draw.io UML state diagram.

## Usage

Invoke the script directly or use this skill when you need to:
- **Visualize** an SFSM JSON definition as a UML state diagram
- **Generate** a draw.io file for inspection, sharing, or further manual editing
- **Export** an FA definition to a visual format

## What the script produces

- **Hierarchical layout**: Each FA rendered as a swimlane container; sub-FAs as nested light-grey boxes (100×60 px).
- **ELK.js automatic layout**: Professional hierarchical positioning of states within each FA using the Eclipse Layout Kernel.
- **Vertical stacking**: Multiple FAs stacked without overlap with 30px spacing.
- **Complete metadata**: All SFSM state roles, FA names, signals, and commands embedded in cell styles for round-trip conversion back to JSON.
- **UML state types**: Initial states (black dot), plain states (rounded rectangles), sub-FA containers (swimlanes), and exit/final states (thick-bordered circles).

## Important note

**Generated diagrams may require small manual adjustments** for visual perfection. Common improvements:
- Reposition state or container nodes for better spacing or clarity
- Adjust swimlane heights or container sizes
- Tweak edge routing or labels

These manual edits preserve the underlying SFSM metadata (stored in cell styles), so the diagram remains convertible back to JSON with zero data loss.

## Input/Output

- **Input**: Path to a compact or extended-format SFSM JSON file
- **Output**: A `.drawio` file ready for inspection in draw.io or manual editing

## Command

```bash
cd ts/ts-stop
npm run build  # if not already built
node scripts/json-to-drawio.js <input.json> <output.drawio>
```

See [04-tools.md § 7.5.3](../../tutorial/04-tools.md#753-json-to-drawio--convert-compact-fa-json-to-uml-state-diagram) for detailed documentation.
