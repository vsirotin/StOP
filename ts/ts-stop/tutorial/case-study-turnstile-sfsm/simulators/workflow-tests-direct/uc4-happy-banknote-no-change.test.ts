import { buildSystem } from './SystemBuilder';
import { Color, TurnstileState } from '../types';

describe('UC4 - Happy path with banknote and no change', () => {
  it('test_uc4_fullFlow', () => {
    const sys = buildSystem();
    const banknote = { kind: 'banknote' as const, formValid: true, requiresChange: false };

    // UC 2.1–2.3, UC 4.1–4.2, UC 1.8–1.9
    sys.banknoteReceiver.receive(banknote);

    expect(sys.lockingMechanism.isLocked).toBe(false);
    expect(sys.lightIndicator.currentColor).toBe(Color.Green);
    expect(sys.tresor.storedItems).toContain(banknote);
    expect(sys.artifactBox.storedItems).toHaveLength(0);
    expect(sys.turnstile.state).toBe(TurnstileState.Normal);

    // UC 1.10–1.13
    sys.pushSensor.detectPush();

    expect(sys.lockingMechanism.isLocked).toBe(true);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
  });
});
