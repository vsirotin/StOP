import { Coin, Color } from './types';
import { IFormChecker, IChangeDispenser, ITresor, ILockingMechanism, ILightIndicator, IArtifactBox } from './interfaces';

export class FormCheckerSim implements IFormChecker {
  constructor(
    private readonly changeDispenser: IChangeDispenser,
    private readonly tresor: ITresor,
    private readonly lockingMechanism: ILockingMechanism,
    private readonly lightIndicator: ILightIndicator,
    private readonly artifactBox: IArtifactBox,
  ) {}

  receive(coin: Coin): void {           // UC 1.4: validates form of coin
    if (!coin.formValid) {
      // UC 5.1–5.3
      this.artifactBox.receive(coin);
      this.lightIndicator.display(Color.Red);
      return;
    }
    if (coin.requiresChange) {
      // UC 1.5–1.6: change needed; abort if dispenser enters service state (UC 8)
      const dispensed = this.changeDispenser.dispense();
      if (!dispensed) return;
    }
    // UC 1.7 / 3.2
    this.tresor.store(coin);
    // UC 1.8–1.9
    this.lockingMechanism.unlock();
    this.lightIndicator.display(Color.Green);
  }
}
