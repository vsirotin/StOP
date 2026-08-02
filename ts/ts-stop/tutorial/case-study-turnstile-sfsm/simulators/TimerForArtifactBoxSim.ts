import { ITimerForArtifactBox, ITurnstile } from './interfaces';

export class TimerForArtifactBoxSim implements ITimerForArtifactBox {
  constructor(private readonly turnstile: ITurnstile) {}

  triggerTimeout(): void {  // UC 7.1: artifact not retrieved within allotted time
    this.turnstile.transitionToServiceState();   // UC 7.2–7.4
  }
}
