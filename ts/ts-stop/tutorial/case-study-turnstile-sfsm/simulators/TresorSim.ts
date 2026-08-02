import { Coin, Banknote } from './types';
import { ITresor } from './interfaces';

export class TresorSim implements ITresor {
  readonly storedItems: Array<Coin | Banknote> = [];

  store(artifact: Coin | Banknote): void {  // UC 1.7, 2.6
    this.storedItems.push(artifact);
  }
}
