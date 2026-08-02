import { Coin } from './types';
import { ICoinReceiver, IWeightChecker } from './interfaces';

export class CoinReceiverSim implements ICoinReceiver {
  constructor(private readonly weightChecker: IWeightChecker) {}

  receive(coin: Coin): void {           // UC 1.2: receives coin and sends to weight-checker
    this.weightChecker.receive(coin);
  }
}
