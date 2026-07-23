---
name: sfsm-json-to-uml-diagram
description: Generate a draw.io (.drawio) UML state diagram from an SFSM FA definition JSON file, in either compact or extended/full format. Defines the canonical drawio notation (initial pseudostate, states, composite/sub-FA container states, exit/final states, joker states, transitions) that the companion skills sfsm-uml-diagram-to-json and sfsm-compare-json-uml-diagram rely on. Use when asked to visualize, diagram, or draw an FA/SFSM JSON definition as a UML state diagram.
metadata:
  author: vsirotin
  version: "1.0"
---

# SFSM JSON → UML State Diagram (draw.io)

This skill converts an SFSM FA definition (as consumed by `ts/ts-stop`'s `Sfsm.loadFA()` — see [types.ts](../../../ts/ts-stop/src/sfsm/types.ts) and [interfaces.ts](../../../ts/ts-stop/src/sfsm/interfaces.ts)) into a `.drawio` UML state diagram. It establishes the **canonical notation** — every element gets a custom `sfsmRole=...` style token so the diagram can be parsed back deterministically by the two companion skills. Do not invent alternative conventions; always follow this file.

Background facts about the source format (verify against the actual JSON before assuming):
- **Compact format**: `{ "<FaName>": [[from, signal, to], [from, signal, to, command], ...] }`. With sub-FAs, every FA (root and descendants) is a separate top-level key; a transition's `to` equal to another key means "push that FA".
- **Extended/full format**: `{ "<FaName>": { states?: {...}, signals?: {...}, commands?: {...}, ts: [...] } }`. A `states` entry that itself has a `ts` key is a nested sub-FA (composite state); a `states` entry without `ts` is a plain leaf state with optional `name`/`description`.
- Every FA has exactly one entry state `"I"` and one or more exit states named `"E_..."`.
- A transition's 4th element (if present) is a command name.
- Jokers: a transition's signal slot or from-state slot may equal a reserved "joker" value (default `"*"`, configurable via `SfsmOptions.jokerSignal` / `jokerState`) meaning "any signal" / "any current state".

---

## Rules

### 1. Identify the format and enumerate every FA

1. If the top-level value for a key is an array → compact format for that FA. If it is an object with a `ts` key → extended format.
2. Determine the **root FA**: in a single-key file, it's that key. In a multi-key compact file, it's the key that is never referenced as a `to` in any FA's transitions (mirrors `FaResolver.getRootName()`). In extended format, it's simply the single top-level key (nesting is expressed via `states`, not extra top-level keys).
3. Recursively find every **sub-FA** (a state that is itself a whole FA): in compact format, any name used as a `to` that also exists as a top-level key; in extended format, any `states` entry containing its own `ts`. Each sub-FA will be rendered as a composite/container state nested inside its parent's diagram area.

### 2. draw.io file skeleton

Produce one `<mxfile>` with one `<diagram>`. Use unique, stable, human-readable cell ids (e.g. `state-TS-L`, not random hashes) so diagrams are diffable in git.

```xml
<mxfile host="Electron">
  <diagram id="sfsm-diagram" name="Page-1">
    <mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- all state/pseudostate cells and transition edges go here, parent="1" (or a container id for nested states) -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### 3. Cell-id resolution rule (apply per FA)

For each FA (identified by its key `<FaKey>`), build a lookup from every state name appearing in its `ts`/transition list to exactly one cell id, created lazily the first time the name is seen:

| Name in transition list | Cell to create/reuse |
|---|---|
| `"I"` | the FA's **initial pseudostate** cell (one per FA) |
| starts with `"E_"` | a dedicated **exit/final** cell for that exact name (one per distinct exit name actually used) |
| equals another FA's key (i.e. it's a sub-FA) | that sub-FA's **composite container** cell |
| equals the FA's joker-state symbol (default `"*"`) | the FA's **joker** cell (create only if actually used as a from-state) |
| anything else | a **plain state** cell (one per distinct name) |

Every transition tuple `[from, signal, to]` / `[from, signal, to, command]` then becomes exactly one edge: `source = lookup(from)`, `target = lookup(to)`, label = `signal` (or `signal / command`). A joker used only as a *signal* (not a from-state) needs no special node — it just becomes part of the edge label (e.g. `*` or `* / GATE.lock`).

### 4. Cell templates

Use these style patterns verbatim (only geometry/ids/values change). Every SFSM-relevant cell carries `sfsmRole=...;sfsmFa=<FaKey>;` and, where applicable, `sfsmKey=<name>` — this metadata is invisible in the rendered diagram but is exactly what the reverse/compare skills read back.

**Initial pseudostate** (filled black dot, no label):
```xml
<mxCell id="init-<FaKey>" value="" style="ellipse;whiteSpace=wrap;html=1;fillColor=#000000;strokeColor=#000000;sfsmRole=initial;sfsmFa=<FaKey>;" vertex="1" parent="<containerId>">
  <mxGeometry x="X" y="Y" width="20" height="20" as="geometry"/>
</mxCell>
```

**Plain state** (rounded rectangle):
```xml
<mxCell id="state-<FaKey>-<Key>" value="<Label>" style="rounded=1;whiteSpace=wrap;html=1;arcSize=20;sfsmRole=state;sfsmFa=<FaKey>;sfsmKey=<Key>;" vertex="1" parent="<containerId>">
  <mxGeometry x="X" y="Y" width="140" height="50" as="geometry"/>
</mxCell>
```

**Composite / sub-FA container** (swimlane with title bar; nested cells use `parent` = this cell's id and coordinates relative to it):
```xml
<mxCell id="state-<FaKey>-<Key>" value="<Label>" style="swimlane;whiteSpace=wrap;html=1;startSize=26;sfsmRole=subfa;sfsmFa=<FaKey>;sfsmKey=<Key>;" vertex="1" parent="<containerId>">
  <mxGeometry x="X" y="Y" width="W" height="H" as="geometry"/>
</mxCell>
```
Size the container to fit its own nested layout (see Rule 6) plus the 26px title bar and ~20px padding on every side.

**Exit / final state** (thick-bordered circle):
```xml
<mxCell id="exit-<FaKey>-<Key>" value="<Label>" style="ellipse;whiteSpace=wrap;html=1;strokeWidth=3;fillColor=#FFFFFF;sfsmRole=exit;sfsmFa=<FaKey>;sfsmKey=<Key>;" vertex="1" parent="<containerId>">
  <mxGeometry x="X" y="Y" width="70" height="70" as="geometry"/>
</mxCell>
```

**Joker (any-state) node** (dashed gray circle labeled with the joker symbol, only created if used as a from-state):
```xml
<mxCell id="joker-<FaKey>" value="*" style="ellipse;whiteSpace=wrap;html=1;dashed=1;strokeColor=#999999;fontColor=#999999;fillColor=none;sfsmRole=joker;sfsmFa=<FaKey>;" vertex="1" parent="<containerId>">
  <mxGeometry x="X" y="Y" width="40" height="40" as="geometry"/>
</mxCell>
```

**Transition edge** (parent is always `"1"`, even across container boundaries):
```xml
<mxCell id="tr-<FaKey>-<n>" value="<signal>[ / <command>]" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;sfsmRole=transition;sfsmFa=<FaKey>;sfsmSignal=<signal>;sfsmCommand=<command-or-empty>;" edge="1" parent="1" source="<sourceCellId>" target="<targetCellId>">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```
For a self-loop (`source == target`), add `exitX=0.25;exitY=0;exitDx=0;exitDy=0;entryX=0.75;entryY=0;entryDx=0;entryDy=0;` to the style so the loop is visible instead of collapsing onto the node.

### 5. Labels

- Plain state / exit `<Label>`: if extended format supplies a `name`, use `"<name> (<Key>)"`; otherwise (compact format, or no `name` given) use just `<Key>`.
- Composite container `<Label>`: same rule, shown in the swimlane title bar.
- Edge label: `signal` alone, or `signal / command` when the transition has a 4th (command) element — this mirrors the UML `event / action` transition label convention.

### 6. Layout algorithm (deterministic, avoids overlap)

For each FA, laid out independently in its own coordinate space (root at the mxfile top level starting at `x=40,y=40`; each sub-FA laid out the same way starting at `x=20,y=46` *relative to its container*, to leave room for the title bar):

1. Layer 0 = the initial pseudostate.
2. Do a breadth-first walk over the FA's transitions starting from `"I"`: each state's layer = the smallest layer index at which it is first reached (ties broken by discovery order). Composite/sub-FA containers and exit cells participate in this walk like any other node.
3. Place nodes of layer `L` left-to-right at `x = 40 + i * 200`, `y = 40 + L * 140` (i = position within the layer, 0-based). Use each cell's own default width/height from Rule 4.
4. Every joker node (if any) goes in its own layer at the far right of the diagram, since it conceptually applies "for any state".
5. Size a composite container to `width = max(child.x + child.width) + 20`, `height = max(child.y + child.height) + 20 + 26` (26 = title bar), computed after laying out its own children.

Exact pixel aesthetics are not important — validity (no overlapping ids, every edge resolves to an existing cell) and readability (clear top-to-bottom or left-to-right flow) are what matter.

### 7. Output

Save the result as `docs/diagrams/<FaName>-state-diagram.drawio` unless the user specifies a different name or location. If a same-named file already exists, ask the user before overwriting.

### 8. Self-check before finishing

Before reporting completion, verify:
- Every state/sub-FA/exit name that appears anywhere in the source JSON's transitions has exactly one corresponding cell.
- Every edge's `source`/`target` references an existing cell id (no dangling references).
- Every composite container's children have `parent` set to that container's id (not `"1"`).
- The file is well-formed XML (matching tags, unique `id` attributes).
