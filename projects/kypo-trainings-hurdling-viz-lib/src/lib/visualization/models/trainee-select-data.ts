import { Trainee } from './trainee';

export class TraineeSelectData {
    trainee: Trainee;
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
