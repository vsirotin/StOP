---
name: stop-sfsm-structure-modeller
description: Interactive SFSM Structure Modeller according StOP (State-oriented Programming paradigm). Transforms an existing user story and use cases into a structure model (*-structure.json). Use when a user asks to model, create, or generate an SFSM from existing use cases and a user story.
metadata:
  author: vsirotin
  version: "0.2"
---

# SFSM Modeller

This skill produces a SFSM structure-model — a structure model (`*-structure.json`) — derived from an existing user story and use-case documents.


## Input

User should provide the pathes for:
- the user story file (e.g., `turnstile-user-story.md`)
- the use-case file (e.g., `turnstile-use-cases.md`)
- directory for output files (e.g., `data/`)
- directory with SFSM-tutorials (e.g., `ts/ts-stop/tutorials/`)
- directory with SFSM_SDK scripts (e.g., `ts/ts-stop/scripts/`)

When these informations not provided, request them from the user before proceeding.

---

## Output Directory Structure

All outputs are placed in a single directory (typically named after the project):

```
data/
├── <project>-semantic-distance.json  # Semantic distance matrix for components
├── <project>-structure.json          # Component hierarchy with types, events, commands
├── <project>-user-instructions.md    # Optional: user-specific instructions/exceptions
├── <project>-log.md                  # Processing log
```

---

## Output File Format

### `<project>-structure.json`

A JSON file describing the component hierarchy, component types, events, and commands in structure like:

```json
{
  "components": [
    {
      "A": {
        "type": "transceiver",
        "components": [
          {
            "B": {
              "type": "transceiver",
              "components": [
                {
                  "C": {
                    "type": "transceiver",
                    "components": [
                      {
                        "D": {
                          "type": "sender",
                        }
                      },
                      {
                        "E": {
                          "type": "transceiver"
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}
```

**Component types:**
- `sender` — generates signals but does not receive them (e.g., Coin Slot, Push Sensor, Service Button).
- `receiver` — receives signals but does not generate them (e.g., Locking Mechanism, Light Indicator).
- `transceiver` — both sends and receives signals (e.g., Coin Component, Payment Component).

**Key conventions:**
- The root component is the system name (e.g., "Lift").
- Each component has a `type` field (initially a hypothesis, refined as use cases are processed).

### `<project>-log.md`

A markdown log file tracking all processing activities. Each entry includes a **timestamp with seconds** in ISO 8601 format:

### `<project>-user-instructions.md` (optional)

If this file exists in the output directory, the agent must read it before processing each new use case. It may contain:
- Exception rules that override the standard transformation rules.
- Important instructions about specific components or use cases.
- Constraints on naming, structure, or behavior.


## Initialization: Create Initial Structure

### Goal

Before processing any use case, create the initial `<project>-structure.json` with the component hierarchy derived from the user story's Structure Overview. At this stage, only the hierarchy and component types are populated — events and commands are added during use case processing.

### Input

The "## Structure Overview" section of the user story (visible and hidden elements).

### Transformation Rules

1. **Collect all elements** from both the visible and hidden lists.
2. **Group by business and physical nature** — elements collaborating toward a common goal belong in the same group.
3. **Create groups of groups** — combine related groups into super-groups by shared higher-level purpose.
4. **Nest until complete** — avoid over-nesting; flatten single-element sub-groups.
5. **Preserve all elements** — every element appears exactly once.
6. **Assign initial type hypothesis** — for each component, hypothesize its type:
   - `sender`: if the element is a slot, sensor, or button (generates signals from external events).
   - `receiver`: if the element is a mechanism, indicator, or display (receives signals, performs actions).
   - `transceiver`: if the element is a checker, receiver, or component that both receives and sends.
   - Intermediate groups are typically `transceiver` (they orchestrate children).

### Output

Write the initial `<project>-structure.json` with the component hierarchy and type hypotheses. No events or commands are added yet.