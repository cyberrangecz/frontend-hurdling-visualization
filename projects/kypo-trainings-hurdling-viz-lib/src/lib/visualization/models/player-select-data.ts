import { Player } from './player';

export class PlayerSelectData {
    player: Player;
    isActive: boolean;
    isSelected: boolean;
    warnings: Warnings
    fadedWarnings: Warnings
  }

export class Warnings {
    wrongAnswerWarning: boolean;
    hintWarning: boolean;
    tooLongWarning: boolean;
}
