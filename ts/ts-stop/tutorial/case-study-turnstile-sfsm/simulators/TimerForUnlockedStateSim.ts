import { Color } from './types';
import { ITimerForUnlockedState, ILockingMechanism, ILightIndicator } from './interfaces';

export class TimerForUnlockedStateSim implements ITimerForUnlockedState {
  constructor(
    private readonly lockingMechanism: ILockingMechanism,
    private readonly lightIndicator: ILightIndicator,
  ) {}

  triggerTimeout(): void {  // UC 10.1: user does not pass through within allotted time
    this.lockingMechanism.lock();             // UC 10.2
    this.lightIndicator.display(Color.Red);   // UC 10.3
  }
}
