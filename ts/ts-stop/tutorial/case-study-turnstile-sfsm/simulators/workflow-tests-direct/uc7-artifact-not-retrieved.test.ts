import { buildSystem } from './SystemBuilder';
import { Color, TurnstileState } from '../types';

describe('UC7 - Returned artifact not retrieved within allotted time', () => {
  it('test_uc7_fullFlow', () => {
    const sys = buildSystem();
    const coin = { kind: 'coin' as const, formValid: false, requiresChange: false };

    // UC 5.1–5.3: invalid coin placed in artifact-box
    sys.coinReceiver.receive(coin);

    expect(sys.artifactBox.storedItems).toContain(coin);

    // UC 7.1: timer detects timeout → UC 7.2–7.4
    sys.timerForArtifactBox.triggerTimeout();

    expect(sys.turnstile.state).toBe(TurnstileState.Service);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
    expect(sys.soundIndicator.notificationCount).toBe(1);

    // UC 7.5: service worker retrieves artifact
    sys.artifactBox.retrieve();

    // UC 7.6: service worker presses service button → UC 7.7–7.8
    sys.turnstile.pressServiceButton();

    expect(sys.turnstile.state).toBe(TurnstileState.Normal);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
  });
});
