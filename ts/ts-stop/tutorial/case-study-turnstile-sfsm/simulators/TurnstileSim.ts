import { Color, TurnstileState } from './types';
import { ITurnstile, ILightIndicator, ISoundIndicator } from './interfaces';

export class TurnstileSim implements ITurnstile {
  state: TurnstileState = TurnstileState.Normal;

  constructor(
    private readonly lightIndicator: ILightIndicator,
    private readonly soundIndicator: ISoundIndicator,
  ) {}

  transitionToServiceState(): void {    // UC 7.2, 8.2, 9.2
    this.state = TurnstileState.Service;
    this.lightIndicator.display(Color.Red);   // UC 7.3, 8.3, 9.3
    this.soundIndicator.notify();             // UC 7.4, 8.4, 9.4
  }

  pressServiceButton(): void {          // UC 7.6, 8.5, 9.5
    this.state = TurnstileState.Normal;        // UC 7.7, 8.6, 9.6
    this.lightIndicator.display(Color.Red);    // UC 7.8, 8.7, 9.7
  }

  detectHardwareFault(): void {         // UC 9.1
    this.transitionToServiceState();           // UC 9.2–9.4
  }
}
