import { buildSystem } from './SystemBuilder';
import { Color } from '../types';

describe('UC6 - Invalid banknote returned to user', () => {
  it('test_uc6_fullFlow', () => {
    const sys = buildSystem();
    const banknote = { kind: 'banknote' as const, formValid: false, requiresChange: false };

    // UC 2.1–2.3, UC 6.1–6.3
    sys.banknoteReceiver.receive(banknote);

    expect(sys.artifactBox.storedItems).toContain(banknote);
    expect(sys.lightIndicator.currentColor).toBe(Color.Red);
    expect(sys.lockingMechanism.isLocked).toBe(true);
    expect(sys.tresor.storedItems).toHaveLength(0);

    // UC 6.4: user retrieves invalid banknote
    const retrieved = sys.artifactBox.retrieve();
    expect(retrieved).toBe(banknote);
    expect(sys.artifactBox.storedItems).toHaveLength(0);
  });
});
