import { buildSystem } from './SystemBuilder';
import { Color, TurnstileState } from '../types';

describe('UC9 - Hardware fault detected', () => {
  it('test_uc9_fullFlow', () => {
    const sys = buildSystem();

    // UC 9.1–9.4: turnstile detects hardware fault → service state
    sys.turnstile.detectHardwareFault();

    expect(sys.turnstile.state).toBe(TurnstileState.Service);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
    expect(sys.soundIndicator.notificationCount).toBe(1);

    // UC 9.5: service worker presses service button → UC 9.6–9.7
    sys.turnstile.pressServiceButton();

    expect(sys.turnstile.state).toBe(TurnstileState.Normal);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
  });
});
