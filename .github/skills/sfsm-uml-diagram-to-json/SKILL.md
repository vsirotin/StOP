---
name: sfsm-uml-diagram-to-json
description: Generate an SFSM FA definition JSON file in compact format from a draw.io (.drawio) UML state diagram built according to the sfsm-json-to-uml-diagram conventions. Use when asked to convert, export, or extract a UML state diagram back into SFSM/StOP JSON.
metadata:
  author: vsirotin
  version: "1.0"
---

# UML State Diagram (draw.io) → SFSM compact JSON

This skill is the reverse of `sfsm-json-to-uml-diagram`: it reads a `.drawio` UML state diagram and produces an SFSM FA definition in **compact format** — `{ "<FaName>": [[from, signal, to], [from, signal, to, command], ...], ... }` — ready for `Sfsm.loadFA()` (see [types.ts](../../../ts/ts-stop/src/sfsm/types.ts)).

---

## Rules

### 1. Parse the diagram's cells

Read every `<mxCell>` in the `.drawio` file's `<root>`. For each cell, inspect its `style` string (a `;`-separated list of `key=value` tokens) for the custom metadata written by `sfsm-json-to-uml-diagram`:
- `sfsmRole` — one of `initial`, `state`, `subfa`, `exit`, `joker`, `transition`.
- `sfsmFa` — which FA (by key) this cell belongs to.
- `sfsmKey` — the state/sub-FA/exit name (absent for `initial`/`joker`, which have fixed names `"I"` / the joker symbol).
- On edges only: `sfsmSignal`, `sfsmCommand` (empty string if no command).

If these tokens are present, trust them as ground truth over the visual `value`/label text.

### 2. Fallback heuristics for hand-drawn diagrams

If a diagram was **not** produced by `sfsm-json-to-uml-diagram` (no `sfsmRole` tokens present), fall back to shape-based heuristics:
- A small filled ellipse (`ellipse` style, `fillColor` = a dark/black color, no/empty `value`, no children) → initial pseudostate for the FA it belongs to.
- An ellipse whose `value` starts with `"E_"`, or whose style includes a notably thick border (`strokeWidth>=3`) → exit/final state; its key is the `"E_..."` token extracted from the label (strip any trailing `" (...)"` parenthetical).
- A `swimlane` cell, or any vertex that is itself the `parent` of other vertices → composite/sub-FA container; its key is the FA name extracted from its label (strip a trailing `" (...)"` parenthetical, or use the label as-is).
- Any other rounded/plain rectangle vertex → a plain state; its key is extracted the same way as above.
- A dashed, gray-styled node labeled `*` (or another explicitly configured joker symbol) → the joker "any state" node for its FA.
- An edge's transition label text is parsed as `signal` or `signal / command` (split on the first `" / "`).

Warn the user (in your summary, not by editing files) whenever a diagram element required a heuristic guess instead of explicit metadata, so they can double-check the result.

### 3. Group cells by FA and resolve names

For every FA found (via `sfsmFa`, or via container nesting under the fallback heuristics):
1. Build the same lookup used by `sfsm-json-to-uml-diagram`, in reverse: cell id → name (`"I"` for the initial pseudostate, the `sfsmKey`/extracted exit name for exit cells, the sub-FA's own key for composite containers, the joker symbol for the joker node, `sfsmKey`/extracted label for plain states).
2. For every transition edge whose `sfsmFa` (or, lacking that, whose source/target both belong to the same FA's cells) matches this FA, resolve `source`/`target` cell ids to names via the lookup, and take the signal/command from `sfsmSignal`/`sfsmCommand` (or from parsing the edge label per Rule 2's fallback).
3. Emit one tuple per edge: `[from, signal, to]`, or `[from, signal, to, command]` if a non-empty command was found.

### 4. Assemble the output JSON

Produce `{ "<FaKey>": [...tuples...], ... }` with one top-level key per FA discovered (root FA first, then each sub-FA in the order first encountered while walking the root's transitions). Preserve the transition order found in the diagram's layer-by-layer / discovery order to keep the output stable and diffable across regenerations.

### 5. Validate before writing

Before saving:
- Confirm every FA name referenced as a `to` (or as a from-state other than `"I"`/joker/exit) corresponds either to a plain state cell within the same FA or to a composite container cell (i.e. a real sub-FA) — flag anything that resolves to nothing as an error rather than silently dropping it.
- Confirm every FA has exactly one initial pseudostate and at least one exit cell (or explicitly note if none exist — an FA with no exit only makes sense as the sole root FA of its `Sfsm` instance).
- If the project's test tooling is available, sanity-check the result by loading it with `Sfsm.loadFA()` in a scratch test/script rather than assuming correctness.

### 6. Output

Save the result as `<diagram-basename>-compact.json` next to the source `.drawio` file, unless the user specifies a different name or location. If a same-named file already exists, ask the user before overwriting.
