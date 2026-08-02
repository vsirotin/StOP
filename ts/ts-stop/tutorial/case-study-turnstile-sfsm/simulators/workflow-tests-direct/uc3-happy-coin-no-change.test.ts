import { buildSystem } from './SystemBuilder';
import { Color, TurnstileState } from '../types';

describe('UC3 - Happy path with coin and no change', () => {
  it('test_uc3_fullFlow', () => {
    const sys = buildSystem();
    const coin = { kind: 'coin' as const, formValid: true, requiresChange: false };

    // UC 1.1–1.4, UC 3.1–3.2, UC 1.8–1.9
    sys.coinReceiver.receive(coin);

    expect(sys.lockingMechanism.isLocked).toBe(false);
    expect(sys.lightIndicator.currentColor).toBe(Color.Green);
    expect(sys.tresor.storedItems).toContain(coin);
    expect(sys.artifactBox.storedItems).toHaveLength(0);
    expect(sys.turnstile.state).toBe(TurnstileState.Normal);

    // UC 1.10–1.13
    sys.pushSensor.detectPush();

    expect(sys.lockingMechanism.isLocked).toBe(true);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
  });
});
