# Acceptance fixtures

Illustrative inputs for the chat-bot acceptance scenario (draft §4.1 → §4.2).

> These are **examples, not final test data**. They are meant to make the
> Phase-1 script format and the Phase-4 scenario concrete. The implementing
> agent may adjust them — but must keep the three run cases (cold / known /
> declined) from [`03-expected-trace.txt`](./03-expected-trace.txt).

| File | Purpose |
|---|---|
| `01-initial-fa.json` | The SFSM *before* injection: greet, answer, close. Compact format, `<Fa>:<State>` / `<Fa>><signal>` / `<Fa>.<command>` naming per tutorial ch. 3.3. |
| `02-injection.json` | The injection that adds name-handling (via Local Storage), the weather branch, and the farewell. Uses the `remove` / `add-after` / `update` / `commands` blocks from plan.md §2.1. |
| `03-expected-trace.txt` | Signal sequences for the three runs, in the `run-fa` CLI format (one signal per line, `//` comments ignored). |

## How to exercise them during Phase 1

File-level (JSON) path — this is what `applyInjection()` should reproduce:

```bash
cd ts/ts-stop-lib-ext
node -e "
  const {applyInjection} = require('./lib/injection/InjectionUpdater');
  const fa    = require('../injections/acceptance/01-initial-fa.json');
  const script= require('../injections/acceptance/02-injection.json');
  console.log(JSON.stringify(applyInjection(fa, script), null, 2));
"
```

Live path (Phase 3, proving decision D3) — apply the same script to a *running*
SFSM through `UpdatableTransceiverHub.applyInjection(...)`, without calling
`loadFA` again, and assert that `getHeadState()` / `getCurrentStack()` are
unchanged by the injection.

## Environment functions the DSL script relies on

Per plan.md §3.2, supplied by the host and allow-listed by the interpreter:

| Name | Used for |
|---|---|
| `readLS(key)` | returns `string \| undefined` — `undefined` means "not set" |
| `writeLS(key, value)` | persists for future sessions |
| `valueOf(key)` / `setValue` | DSL variable scope |
| `sendSignal(sig)` | drives the SFSM; delegates to `Sfsm.receiveSignal` |
| `ask(question)` | `FakeAiEngine` |
| `reportWeather()` | `FakeAiEngine` — the "predefined tool" of draft §4.2 |
| `say(msg)` / `sayGreeting` / `sayOther` / `askName` | `FakeUi` |

> **Note:** `writeLS` is called with **two** arguments here. The draft's example
> (`writeLS(valueOf('user-lang'))`) passes only one and reads like a *get*.
> This is open question 2 in plan.md §8.
