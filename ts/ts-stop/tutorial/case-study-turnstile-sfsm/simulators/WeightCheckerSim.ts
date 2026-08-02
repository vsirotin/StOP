import { Coin } from './types';
import { IWeightChecker, IFormChecker } from './interfaces';

// No failure path for weight validation exists in the use cases; all invalid-coin paths start at FormChecker.
export class WeightCheckerSim implements IWeightChecker {
  constructor(private readonly formChecker: IFormChecker) {}

  receive(coin: Coin): void {           // UC 1.3: validates weight internally, sends to form-checker
    this.formChecker.receive(coin);
  }
}
