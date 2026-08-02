import { buildSystem } from './SystemBuilder';
import { Color } from '../types';

describe('UC10 - Unlocked state timeout', () => {
  it('test_uc10_fullFlow', () => {
    const sys = buildSystem();
    const coin = { kind: 'coin' as const, formValid: true, requiresChange: false };

    // UC 1.1–1.9: insert coin, unlock
    sys.coinReceiver.receive(coin);

    expect(sys.lockingMechanism.isLocked).toBe(false);
    expect(sys.lightIndicator.currentColor).toBe(Color.Green);

    // UC 10.1: user does not pass through → UC 10.2–10.3
    sys.timerForUnlockedState.triggerTimeout();

    expect(sys.lockingMechanism.isLocked).toBe(true);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
    expect(sys.tresor.storedItems).toContain(coin);
  });
});
