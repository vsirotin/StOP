# ts-example

A minimal **Angular 17** browser application that demonstrates practical usage of the
[@vsirotin/ts-stop](../ts-stop) library.

## Goal

The project serves as a living integration test and reference implementation for
`@vsirotin/ts-stop`. It shows two demos that run automatically on startup:

| Demo | What it shows |
|------|---------------|
| FA Demo | Simple coin turnstile built with `FiniteStateMachine` |
| SFSM Demo | Banknote turnstile built with the stacked `Sfsm` engine and a compact FA definition |

The primary purpose is to verify that the library works correctly in a real browser
environment — both with a locally-built version and with the officially published npm
package — before and after each release.

## Main project

The library being demonstrated lives in [ts/ts-stop](../ts-stop).

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for the full developer workflow, including how to
run the local-testing cycle and how to validate against the published npm package.
