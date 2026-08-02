export type Coin = {
  readonly kind: 'coin';
  readonly formValid: boolean;
  readonly requiresChange: boolean;
};

export type Banknote = {
  readonly kind: 'banknote';
  readonly formValid: boolean;
  readonly requiresChange: boolean;
};

export type Change = {
  readonly kind: 'change';
};

export type Artifact = Coin | Banknote | Change;

export enum Color {
  Red = 'red',
  Green = 'green',
}

export enum TurnstileState {
  Normal = 'normal',
  Service = 'service',
}
