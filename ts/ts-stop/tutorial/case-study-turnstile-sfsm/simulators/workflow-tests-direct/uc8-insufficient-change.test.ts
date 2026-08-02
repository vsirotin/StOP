import { buildSystem } from './SystemBuilder';
import { Color, TurnstileState } from '../types';

describe('UC8 - Insufficient change detected', () => {
  it('test_uc8_fullFlow', () => {
    const sys = buildSystem({ changeAvailable: false });
    const coin = { kind: 'coin' as const, formValid: true, requiresChange: true };

    // UC 1.1–1.5 then UC 8.1–8.4: dispenser decides insufficient → service state
    sys.coinReceiver.receive(coin);

    expect(sys.turnstile.state).toBe(TurnstileState.Service);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
    expect(sys.soundIndicator.notificationCount).toBe(1);
    // Coin must not be stored and turnstile must not unlock
    expect(sys.tresor.storedItems).toHaveLength(0);
    expect(sys.lockingMechanism.isLocked).toBe(true);

    // UC 8.5: service worker presses service button → UC 8.6–8.7
    sys.turnstile.pressServiceButton();

    expect(sys.turnstile.state).toBe(TurnstileState.Normal);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
  });
});
