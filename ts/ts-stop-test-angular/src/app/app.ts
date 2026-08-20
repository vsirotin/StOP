import { Component } from '@angular/core';
import { Sfsm, FaDefinition, VERSION as LIB_VERSION } from '@vsirotin/ts-stop';

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
        // Read the actual library version exported by @vsirotin/ts-stop.
        this.libVersion = LIB_VERSION;

        // Prove the library can be instantiated and driven inside the browser.
        const sfsm = new Sfsm(turnstileFa);
        sfsm.receiveSignal('start');
        this.sfsmLoaded = typeof sfsm.getHeadState() === 'string';
        this.state = sfsm.getHeadState();
    }
}