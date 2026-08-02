import { CoinReceiverSim } from '../CoinReceiverSim';
import { WeightCheckerSim } from '../WeightCheckerSim';
import { FormCheckerSim } from '../FormCheckerSim';
import { BanknoteReceiverSim } from '../BanknoteReceiverSim';
import { BanknoteCheckerSim } from '../BanknoteCheckerSim';
import { ChangedispenserSim } from '../ChangedispenserSim';
import { TresorSim } from '../TresorSim';
import { LockingMechanismSim } from '../LockingMechanismSim';
import { LightIndicatorSim } from '../LightIndicatorSim';
import { ArtifactBoxSim } from '../ArtifactBoxSim';
import { SoundIndicatorSim } from '../SoundIndicatorSim';
import { PushSensorSim } from '../PushSensorSim';
import { TimerForArtifactBoxSim } from '../TimerForArtifactBoxSim';
import { TimerForUnlockedStateSim } from '../TimerForUnlockedStateSim';
import { TurnstileSim } from '../TurnstileSim';

export interface TurnstileSystem {
  coinReceiver: CoinReceiverSim;
  banknoteReceiver: BanknoteReceiverSim;
  pushSensor: PushSensorSim;
  timerForArtifactBox: TimerForArtifactBoxSim;
  timerForUnlockedState: TimerForUnlockedStateSim;
  turnstile: TurnstileSim;
  tresor: TresorSim;
  lockingMechanism: LockingMechanismSim;
  lightIndicator: LightIndicatorSim;
  artifactBox: ArtifactBoxSim;
  soundIndicator: SoundIndicatorSim;
}

export function buildSystem(opts: { changeAvailable?: boolean } = {}): TurnstileSystem {
  const lightIndicator = new LightIndicatorSim();
  const soundIndicator = new SoundIndicatorSim();
  const lockingMechanism = new LockingMechanismSim();
  const tresor = new TresorSim();
  const artifactBox = new ArtifactBoxSim();
  const turnstile = new TurnstileSim(lightIndicator, soundIndicator);
  const changeDispenser = new ChangedispenserSim(artifactBox, turnstile, opts.changeAvailable ?? true);
  const formChecker = new FormCheckerSim(changeDispenser, tresor, lockingMechanism, lightIndicator, artifactBox);
  const weightChecker = new WeightCheckerSim(formChecker);
  const coinReceiver = new CoinReceiverSim(weightChecker);
  const banknoteChecker = new BanknoteCheckerSim(changeDispenser, tresor, lockingMechanism, lightIndicator, artifactBox);
  const banknoteReceiver = new BanknoteReceiverSim(banknoteChecker);
  const pushSensor = new PushSensorSim(lockingMechanism, lightIndicator);
  const timerForArtifactBox = new TimerForArtifactBoxSim(turnstile);
  const timerForUnlockedState = new TimerForUnlockedStateSim(lockingMechanism, lightIndicator);

  return {
    coinReceiver, banknoteReceiver, pushSensor,
    timerForArtifactBox, timerForUnlockedState, turnstile,
    tresor, lockingMechanism, lightIndicator, artifactBox, soundIndicator,
  };
}
