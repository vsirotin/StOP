---
name: sfsm-compare-json-uml-diagram
description: Compare an SFSM FA definition JSON file in compact format against a draw.io (.drawio) UML state diagram built according to the sfsm-json-to-uml-diagram conventions, and report every discrepancy. Use when asked to check, validate, verify, or diff a UML state diagram against its JSON source (or vice versa) for the StOP/SFSM engine.
metadata:
  author: vsirotin
  version: "1.0"
---

# Compare SFSM compact JSON ↔ UML state diagram (draw.io)

This skill checks whether a `.drawio` UML state diagram (built per `sfsm-json-to-uml-diagram`'s conventions) and an SFSM **compact-format** JSON FA definition (`{ "<FaName>": [[from, signal, to], ...], ... }`) describe the exact same automaton. It only ever **reports** differences — it never edits either file. If the user then asks which side to fix, apply `sfsm-json-to-uml-diagram` (JSON → diagram) or `sfsm-uml-diagram-to-json` (diagram → JSON) to bring them back in sync.

---

## Rules

### 1. Parse both sides into the same canonical form

- **JSON side**: parse directly — for each top-level key (FA), its list of `[from, signal, to]` / `[from, signal, to, command]` tuples.
- **Diagram side**: reuse the parsing procedure from `sfsm-uml-diagram-to-json` (Rules 1–4 of that skill: read `sfsmRole`/`sfsmFa`/`sfsmKey`/`sfsmSignal`/`sfsmCommand` metadata, falling back to shape/label heuristics only if that metadata is absent) to produce the same `{ FaKey: tuples[] }` shape.

Both sides now share one canonical representation: per FA, a set of state/sub-FA/exit names and a set of `(from, signal, to, command?)` transition tuples.

### 2. Diff, per FA

For every FA name appearing in **either** side:
- **FA missing entirely**: the FA key exists in the JSON but has no corresponding composite container (or root diagram) in the diagram, or vice versa.
- **Missing state**: a name used in a JSON transition (as a from- or to-state) has no corresponding cell in the diagram's version of that FA.
- **Extra state**: a cell exists in the diagram for that FA but is never referenced by any JSON transition.
- **Missing transition**: a `(from, signal)` pair exists in the JSON with no matching edge in the diagram.
- **Extra transition**: an edge exists in the diagram with no matching `(from, signal)` pair in the JSON.
- **Target/command mismatch**: a `(from, signal)` pair exists on both sides but the resulting `to` and/or `command` differ.
- **Exit-naming violation**: a state used as a `to` and treated as an exit (drawn as an exit/final cell) does not start with `"E_"`, or a name starting with `"E_"` in the JSON is not drawn as an exit/final cell.
- **Sub-FA mismatch**: a name that is a top-level FA key in the JSON (i.e. a real sub-FA) is drawn as a plain state (not a composite container) in the diagram, or vice versa.
- **Joker mismatch**: the JSON uses the joker symbol (default `"*"`) as a from-state or signal but the diagram has no joker node / no `*` edge label for that FA, or vice versa.

### 3. Report format

Summarize per FA as a short markdown section:

```
### <FaKey>
- ✅ N transitions match
- ❌ Missing in diagram: [from, signal, to(, command)] ...
- ❌ Extra in diagram: [from, signal, to(, command)] ...
- ❌ Mismatch: (from, signal) → JSON says to=<X>[, command=<Y>], diagram says to=<X'>[, command=<Y'>]
```

If both sides match exactly for every FA, state that clearly and briefly instead of printing an empty diff (e.g. "The diagram and `<file>.json` are in sync — N FAs, M transitions, no discrepancies.").

### 4. Do not modify files

This skill only produces a report. If discrepancies are found, ask the user which side is authoritative before invoking `sfsm-json-to-uml-diagram` or `sfsm-uml-diagram-to-json` to reconcile them.
