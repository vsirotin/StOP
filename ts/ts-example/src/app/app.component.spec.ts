import { AppComponent } from './app.component';

// ---------------------------------------------------------------------------
// AppComponent — startup smoke tests
//
// These tests verify that AppComponent initialises without errors when the
// app is loaded in a browser.  No Angular TestBed is needed because the
// component has no injected dependencies; all logic is self-contained.
// ---------------------------------------------------------------------------

describe('AppComponent – startup smoke tests', () => {
    let component: AppComponent;

    beforeEach(() => {
        // Instantiating the component simulates what Angular does on page load.
        component = new AppComponent();
        component.ngOnInit();
    });

    it('should create the component without throwing', () => {
        expect(component).toBeTruthy();
    });

    // ── FA Demo ──────────────────────────────────────────────────────────────

    it('faSteps should contain exactly 4 entries after startup', () => {
        expect(component.faSteps).toHaveLength(4);
    });

    it('faSteps should reflect the expected coin-turnstile state sequence', () => {
        const states = component.faSteps.map(s => s.state);
        expect(states).toEqual(['unlocked', 'locked', 'unlocked', 'locked']);
    });

    // ── SFSM Demo ─────────────────────────────────────────────────────────────

    it('sfsmLog should be non-empty after startup', () => {
        expect(component.sfsmLog.length).toBeGreaterThan(0);
    });

    it('sfsmLog entries should each contain the required fields', () => {
        for (const entry of component.sfsmLog) {
            expect(typeof entry.step).toBe('number');
            expect(Array.isArray(entry.stack)).toBe(true);
            expect(typeof entry.state).toBe('string');
            expect(typeof entry.signal).toBe('string');
            expect(typeof entry.newState).toBe('string');
        }
    });

    it('turnstile device should be locked after the passage signal', () => {
        expect(component.device.locked).toBe(true);
    });
});
