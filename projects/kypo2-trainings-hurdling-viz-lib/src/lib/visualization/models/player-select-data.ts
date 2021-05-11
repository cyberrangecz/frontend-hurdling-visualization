import { Player } from './player';

export class PlayerSelectData {
    player: Player;
    isActive: boolean;
    isSelected: boolean;
    warnings: Warnings
    fadedWarnings: Warnings
  }

export class Warnings {
    wrongFlagWarning: boolean;
    hintWarning: boolean;
    tooLongWarning: boolean;
}