import { Color } from './types';
import { ILightIndicator } from './interfaces';

export class LightIndicatorSim implements ILightIndicator {
  currentColor: Color = Color.Red;

  display(color: Color): void {
    this.currentColor = color;
  }
}
