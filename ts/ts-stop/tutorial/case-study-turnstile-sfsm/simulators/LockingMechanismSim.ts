import { ILockingMechanism } from './interfaces';

export class LockingMechanismSim implements ILockingMechanism {
  isLocked = true;

  unlock(): void {    // UC 1.8
    this.isLocked = false;
  }

  lock(): void {      // UC 1.12, 10.2
    this.isLocked = true;
  }
}
