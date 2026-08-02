import { IChangeDispenser, IArtifactBox, ITurnstile } from './interfaces';

export class ChangedispenserSim implements IChangeDispenser {
  constructor(
    private readonly artifactBox: IArtifactBox,
    private readonly turnstile: ITurnstile,
    private readonly changeAvailable: boolean = true,
  ) {}

  // Returns true when change was dispensed; false when insufficient change triggered service state (UC 8.1–8.4).
  dispense(): boolean {
    if (!this.changeAvailable) {
      this.turnstile.transitionToServiceState();
      return false;
    }
    // UC 1.6
    this.artifactBox.receive({ kind: 'change' });
    return true;
  }
}
