import { ISoundIndicator } from './interfaces';

export class SoundIndicatorSim implements ISoundIndicator {
  notificationCount = 0;

  notify(): void {    // UC 7.4, 8.4, 9.4
    this.notificationCount++;
  }
}
