import { Artifact, Coin, Banknote, Color } from './types';

export interface ICoinReceiver {
  receive(coin: Coin): void;
}

export interface IWeightChecker {
  receive(coin: Coin): void;
}

export interface IFormChecker {
  receive(coin: Coin): void;
}

// Returns true when change was dispensed; false when insufficient change triggered service state.
export interface IChangeDispenser {
  dispense(): boolean;
}

export interface ITresor {
  store(artifact: Coin | Banknote): void;
}

export interface ILockingMechanism {
  unlock(): void;
  lock(): void;
}

export interface ILightIndicator {
  display(color: Color): void;
}

export interface IPushSensor {
  detectPush(): void;
}

export interface ISoundIndicator {
  notify(): void;
}

export interface IArtifactBox {
  receive(artifact: Artifact): void;
}

export interface IBanknoteReceiver {
  receive(banknote: Banknote): void;
}

export interface IBanknoteChecker {
  receive(banknote: Banknote): void;
}

export interface ITimerForArtifactBox {
  triggerTimeout(): void;
}

export interface ITimerForUnlockedState {
  triggerTimeout(): void;
}

export interface ITurnstile {
  transitionToServiceState(): void;
  pressServiceButton(): void;
  detectHardwareFault(): void;
}
