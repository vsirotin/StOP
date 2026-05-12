import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FiniteStateMachine } from '@vsirotin/ts-stop';
import {
  Sfsm,
  ExternalWorldHub,
  FaDefinition,
  LogEntry,
  ICommandReceiver,
  ISignalReceiver,
  ISignalSender,
  Transition
} from '@vsirotin/ts-stop/sfsm';

// ─── FA Demo helpers ─────────────────────────────────────────────────────────

class DemoTurnstile extends FiniteStateMachine<string, string> {
  constructor() {
    super(
      ['locked', 'unlocked'],
      ['coin', 'push'],
      [
        { from: 'locked',   signal: 'coin', to: 'unlocked' },
        { from: 'unlocked', signal: 'push', to: 'locked'   }
      ],
      'locked'
    );
  }

  send(signal: string): string { return this.sendSignal(signal); }
}

// ─── SFSM Demo helpers ───────────────────────────────────────────────────────

class DemoTurnstileService implements ISignalSender {
  private target: ISignalReceiver | null = null;
  connectSignalTarget(t: ISignalReceiver): void { this.target = t; }
  start(): void { this.target!.receiveSignal('TS.s'); }
}

class DemoTurnstileDevice implements ICommandReceiver, ISignalSender {
  private target: ISignalReceiver | null = null;
  locked = true;
  connectSignalTarget(t: ISignalReceiver): void { this.target = t; }
  receiveCommand(cmd: string): void {
    if (cmd === 'TS.ut') this.locked = false;
    if (cmd === 'TS.l')  this.locked = true;
  }
  passage(): void { this.target!.receiveSignal('TS.ps'); }
}

class DemoBanknoteChecker implements ICommandReceiver, ISignalSender {
  private target: ISignalReceiver | null = null;
  connectSignalTarget(t: ISignalReceiver): void { this.target = t; }
  receiveCommand(cmd: string, data?: unknown): void {
    if (cmd === 'BC.c$') this.target!.receiveSignal('BC.p$', data);
  }
}

class DemoBanknoteAcceptor implements ICommandReceiver, ISignalSender {
  private target: ISignalReceiver | null = null;
  connectSignalTarget(t: ISignalReceiver): void { this.target = t; }
  receiveCommand(cmd: string): void {
    if (cmd === 'BA.a$') this.target!.receiveSignal('BA.n');
  }
}

// ─── Compact FA definition ───────────────────────────────────────────────────

const TURNSTILE_FA: FaDefinition = {
  TS: [
    ['I',   'TS.s',   'L'           ],
    ['L',   'BR.bc$', 'PP'          ],
    ['L',   'CR.cc$', 'PP'          ],
    ['PP',  'BA.n',   'U',  'TS.ut' ],
    ['PP',  'CA.n',   'U',  'TS.ut' ],
    ['PP',  'CH.d',   'U',  'TS.ut' ],
    ['PP',  'RE.d',   'L',  'TS.l'  ],
    ['U',   'TS.to',  'L',  'TS.l'  ],
    ['U',   'TS.ps',  'L',  'TS.l'  ]
  ] as Transition[],
  PP: [
    ['I',   'BR.bc$', 'BPP'          ],
    ['I',   'CR.cc$', 'CPP'          ],
    ['BPP', 'BC.r$',  'RE'           ],
    ['BPP', 'BA.c$',  'CH', 'CH.c$'  ],
    ['BPP', 'BA.n',   'E_N'          ],
    ['CPP', 'CC.r$',  'RE'           ],
    ['CPP', 'CA.c$',  'CH', 'CH.c$'  ],
    ['CPP', 'CA.n',   'E_P'          ],
    ['RE',  'RE.d',   'E_R'          ],
    ['CH',  'CH.d',   'E_P'          ]
  ] as Transition[],
  BPP: [
    ['I', 'BR.bc$', 'C',  'BC.c$'],
    ['C', 'BC.p$',  'A',  'BA.a$'],
    ['C', 'BC.r$',  'E_R'        ],
    ['A', 'BA.c$',  'E_C'        ],
    ['A', 'BA.n',   'E_N'        ]
  ] as Transition[],
  CPP: [
    ['I',  'CR.cc$', 'CW', 'CC.cw$'],
    ['CW', 'CC.p$',  'CF', 'CC.cf$'],
    ['CF', 'CC.p$',  'A',  'CA.a$' ],
    ['CW', 'CC.r$',  'E_R'         ],
    ['CF', 'CC.r$',  'E_R'         ],
    ['A',  'CA.c$',  'E_C'         ],
    ['A',  'CA.n',   'E_N'         ]
  ] as Transition[]
};

// ─── Component ───────────────────────────────────────────────────────────────

interface FaStep {
  signal: string;
  state:  string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor],
  template: `
    <main>
      <h1>&#64;vsirotin/ts-stop — Browser Demo</h1>

      <section class="panel">
        <h2>FA Demo — <code>FiniteStateMachine</code> (simple coin turnstile)</h2>
        <p>
          A classic coin-operated turnstile built directly with
          <code>FiniteStateMachine</code> from the <code>fa</code> module.
          Two coin+push cycles are run automatically on startup.
        </p>
        <table>
          <thead>
            <tr><th>#</th><th>Signal</th><th>→ State</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of faSteps; let i = index">
              <td>{{ i + 1 }}</td>
              <td><code>{{ s.signal }}</code></td>
              <td>{{ s.state }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="panel">
        <h2>SFSM Demo — <code>Sfsm</code> (banknote turnstile, compact FA)</h2>
        <p>
          A realistic turnstile with banknote payment, driven by the stacked
          finite-state machine engine from the <code>sfsm</code> module and
          a compact FA definition. The full payment cascade runs automatically.
        </p>
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>Stack</th>
              <th>State</th>
              <th>Signal</th>
              <th>Rule</th>
              <th>New State</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of sfsmLog">
              <td>{{ e.step }}</td>
              <td>{{ e.stack.join(' › ') }}</td>
              <td>{{ e.state }}</td>
              <td><code>{{ e.signal }}</code></td>
              <td>{{ e.rule }}</td>
              <td>{{ e.newState }}</td>
              <td>{{ e.command ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p class="result">
          Turnstile after demo: {{ device.locked ? '🔒 Locked' : '🔓 Unlocked' }}
        </p>
      </section>
    </main>
  `
})
export class AppComponent implements OnInit {
  faSteps: FaStep[]   = [];
  sfsmLog: LogEntry[] = [];
  readonly device = new DemoTurnstileDevice();

  ngOnInit(): void {
    this.runFaDemo();
    this.runSfsmDemo();
  }

  private runFaDemo(): void {
    const t = new DemoTurnstile();
    const step = (signal: string): void => {
      this.faSteps.push({ signal, state: t.send(signal) });
    };
    step('coin');
    step('push');
    step('coin');
    step('push');
  }

  private runSfsmDemo(): void {
    const service  = new DemoTurnstileService();
    const checker  = new DemoBanknoteChecker();
    const acceptor = new DemoBanknoteAcceptor();
    const sfsm     = new Sfsm();

    new ExternalWorldHub()
      .registerSignalSender(['TS.s'],             service)
      .registerSignalSender(['TS.ps', 'TS.to'],   this.device)
      .registerCommandReceiver(['TS.ut', 'TS.l'],  this.device)
      .registerSignalSender(['BC.p$', 'BC.r$'],   checker)
      .registerCommandReceiver(['BC.c$'],           checker)
      .registerSignalSender(['BA.c$', 'BA.n'],    acceptor)
      .registerCommandReceiver(['BA.a$'],           acceptor)
      .connectTo(sfsm);

    sfsm.loadFA(TURNSTILE_FA);

    // 1. System start: drives TS from I → L
    service.start();

    // 2. Customer inserts a banknote — the full cascade runs automatically:
    //    TS:L→PP → PP:I→BPP → BPP:I→C (sends BC.c$)
    //    → checker auto-responds BC.p$ → BPP:C→A (sends BA.a$)
    //    → acceptor auto-responds BA.n → BPP:A→E_N → PP:BPP→E_N → TS:PP→U (sends TS.ut)
    sfsm.receiveSignal('BR.bc$', { value: 5 });

    // 3. Customer passes through the now-unlocked gate
    this.device.passage();  // sends TS.ps → TS:U→L (sends TS.l)

    this.sfsmLog = sfsm.getLog();
  }
}
