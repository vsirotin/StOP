import { Component } from '@angular/core';
import { Sfsm, FaDefinition } from '@vsirotin/ts-stop';

/**
 * Simple smoke-test that the actual installed version of @vsirotin/ts-stop
 * (the cross-platform StOP library) loads without problems inside Angular
 * and works.
 */

const turnstileFa: FaDefinition = {
    Turnstile: [
        ['I', 'start', 'locked'],
        ['locked', 'coin', 'unlocked'],
        ['unlocked', 'push', 'locked']
    ]
};

@Component({
    selector: 'app-root',
    template: `
      <h1>StOP Library Angular smoke-test</h1>
      <p><strong>Library version:</strong> {{ libVersion }}</p>
      <p><strong>Sfsm loaded:</strong> {{ sfsmLoaded }}</p>
      <p><strong>Engine state after "start":</strong> {{ state }}</p>
    `,
})
export class App {
    readonly libVersion: string;
    readonly sfsmLoaded: boolean;
    readonly state: string;

    constructor() {
        // Read the installed library version from its package.json.
        this.libVersion = readLibVersion();

        // Prove the library can be instantiated and driven inside the browser.
        const sfsm = new Sfsm(turnstileFa);
        sfsm.receiveSignal('start');
        this.sfsmLoaded = typeof sfsm.getHeadState() === 'string';
        this.state = sfsm.getHeadState();
    }
}

function readLibVersion(): string {
    // Uses a dynamic import with a URL that bundlers map to the installed package.
    // Falls back to a constant when the package.json is not resolvable at runtime.
    try {
        const ver = (globalThis as unknown as { __STOP_VERSION__?: string }).__STOP_VERSION__;
        return ver ?? 'unknown (bundled)';
    } catch {
        return 'unknown';
    }
}