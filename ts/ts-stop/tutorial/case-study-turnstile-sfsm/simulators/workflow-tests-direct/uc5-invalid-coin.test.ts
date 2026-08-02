import { buildSystem } from './SystemBuilder';
import { Color } from '../types';

describe('UC5 - Invalid coin returned to user', () => {
  it('test_uc5_fullFlow', () => {
    const sys = buildSystem();
    const coin = { kind: 'coin' as const, formValid: false, requiresChange: false };

    // UC 1.1–1.4, UC 5.1–5.3
    sys.coinReceiver.receive(coin);

    expect(sys.artifactBox.storedItems).toContain(coin);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
    expect(sys.lockingMechanism.isLocked).toBe(true);
    expect(sys.tresor.storedItems).toHaveLength(0);

    // UC 5.4: user retrieves invalid coin
    const retrieved = sys.artifactBox.retrieve();
    expect(retrieved).toBe(coin);
    expect(sys.artifactBox.storedItems).toHaveLength(0);
  });
});
