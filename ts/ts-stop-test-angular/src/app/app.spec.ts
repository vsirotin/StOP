import { describe, expect, it } from 'vitest';
import { VERSION as LIB_VERSION } from '@vsirotin/ts-stop';
import { App } from './app';

/**
 * Smoke-tests that the installed @vsirotin/ts-stop library loads and works
 * inside an Angular (jsdom) environment.
 */
describe('App (StOP library Angular smoke-test)', () => {
    it('test_app_lib_version_read', () => {
        const app = new App();

        // the version shown in the template must be the real library version
        expect(app.libVersion).toBe(LIB_VERSION);
        expect(app.libVersion).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('test_app_sfsm_loaded_ok', () => {
        const app = new App();

        // Sfsm must be constructible and report a string head state
        expect(app.sfsmLoaded).toBe(true);
    });

    it('test_app_signal_start_transition', () => {
        const app = new App();

        // "start" signal must move the head state from 'I' to 'locked'
        expect(app.state).toBe('locked');
    });
});