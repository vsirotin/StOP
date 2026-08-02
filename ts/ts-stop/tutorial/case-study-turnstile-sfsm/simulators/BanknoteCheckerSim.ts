import { Banknote, Color } from './types';
import { IBanknoteChecker, IChangeDispenser, ITresor, ILockingMechanism, ILightIndicator, IArtifactBox } from './interfaces';

export class BanknoteCheckerSim implements IBanknoteChecker {
  constructor(
    private readonly changeDispenser: IChangeDispenser,
    private readonly tresor: ITresor,
    private readonly lockingMechanism: ILockingMechanism,
    private readonly lightIndicator: ILightIndicator,
    private readonly artifactBox: IArtifactBox,
  ) {}

  receive(banknote: Banknote): void {   // UC 2.3: validates form of banknote
    if (!banknote.formValid) {
      // UC 6.1–6.3
      this.artifactBox.receive(banknote);
      this.lightIndicator.display(Color.Red);
      return;
    }
    if (banknote.requiresChange) {
      // UC 2.4–2.5: change needed; abort if dispenser enters service state
      const dispensed = this.changeDispenser.dispense();
      if (!dispensed) return;
    }
    // UC 2.6 / 4.2
    this.tresor.store(banknote);
    // UC 1.8–1.9 (shared steps)
    this.lockingMechanism.unlock();
    this.lightIndicator.display(Color.Green);
  }
}
