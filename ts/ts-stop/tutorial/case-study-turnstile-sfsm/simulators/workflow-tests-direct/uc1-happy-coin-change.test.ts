import { buildSystem } from './SystemBuilder';
import { Color, TurnstileState } from '../types';

describe('UC1 - Happy path with coin and change', () => {
  it('test_uc1_fullFlow', () => {
    const sys = buildSystem();
    const coin = { kind: 'coin' as const, formValid: true, requiresChange: true };

    // UC 1.1–1.9: user inserts coin; coin flows through to unlock
    sys.coinReceiver.receive(coin);

    expect(sys.lockingMechanism.isLocked).toBe(false);
    expect(sys.lightIndicator.currentColor).toBe(Color.Green);
    expect(sys.tresor.storedItems).toContain(coin);
    expect(sys.artifactBox.storedItems).toHaveLength(1);
    expect(sys.artifactBox.storedItems[0]).toEqual({ kind: 'change' });
    expect(sys.turnstile.state).toBe(TurnstileState.Normal);

    // UC 1.10–1.13: user walks through
    sys.pushSensor.detectPush();

    expect(sys.lockingMechanism.isLocked).toBe(true);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
  });
});
