import { Color } from './types';
import { IPushSensor, ILockingMechanism, ILightIndicator } from './interfaces';

export class PushSensorSim implements IPushSensor {
  constructor(
    private readonly lockingMechanism: ILockingMechanism,
    private readonly lightIndicator: ILightIndicator,
  ) {}

  detectPush(): void {      // UC 1.11: user pushes rotating arm
    this.lockingMechanism.lock();             // UC 1.12
    this.lightIndicator.display(Color.Red);   // UC 1.13
  }
}
