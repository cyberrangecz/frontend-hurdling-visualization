import { ProgressData } from './progress-subject-progress-data';

export class DataSelection {
    selection: ProgressData;
    isActive: boolean;
    isSelected: boolean;
    warnings: Warnings;
    fadedWarnings: Warnings;
}

export class Warnings {
    wrongAnswerWarning: boolean;
    hintWarning: boolean;
    tooLongWarning: boolean;
}
