import { Banknote } from './types';
import { IBanknoteReceiver, IBanknoteChecker } from './interfaces';

export class BanknoteReceiverSim implements IBanknoteReceiver {
  constructor(private readonly banknoteChecker: IBanknoteChecker) {}

  receive(banknote: Banknote): void {   // UC 2.2: receives banknote and sends to banknote-checker
    this.banknoteChecker.receive(banknote);
  }
}
