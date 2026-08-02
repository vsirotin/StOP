import { buildSystem } from './SystemBuilder';
import { Color, TurnstileState } from '../types';

describe('UC2 - Happy path with banknote and change', () => {
  it('test_uc2_fullFlow', () => {
    const sys = buildSystem();
    const banknote = { kind: 'banknote' as const, formValid: true, requiresChange: true };

    // UC 2.1–2.6 + UC 1.8–1.9
    sys.banknoteReceiver.receive(banknote);

    expect(sys.lockingMechanism.isLocked).toBe(false);
    expect(sys.lightIndicator.currentColor).toBe(Color.Green);
    expect(sys.tresor.storedItems).toContain(banknote);
    expect(sys.artifactBox.storedItems).toHaveLength(1);
    expect(sys.artifactBox.storedItems[0]).toEqual({ kind: 'change' });
    expect(sys.turnstile.state).toBe(TurnstileState.Normal);

    // UC 1.10–1.13: user walks through
    sys.pushSensor.detectPush();

    expect(sys.lockingMechanism.isLocked).toBe(true);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
  });
});
