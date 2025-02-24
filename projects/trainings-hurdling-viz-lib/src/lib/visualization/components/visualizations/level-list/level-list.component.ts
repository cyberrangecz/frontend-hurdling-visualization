import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Level } from '../../../models/level';
import { Trainee } from '../../../models/trainee';
import { HurdlingVisualizationData } from '../../../models/hurdling-visualization-data';

@Component({
    selector: 'crczp-viz-hurdling-level-list',
    templateUrl: './level-list.component.html',
    styleUrls: ['./level-list.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class LevelListComponent {
    @Input() visualizationData: HurdlingVisualizationData;

    @Output() filteredTrainees = new EventEmitter<Trainee[]>();
    @Output() traineeSort = new EventEmitter<Level>();

    constructor() {}

    getTraineesForLevel(levelId): Trainee[] {
        const trainees: Trainee[] = [];
        this.visualizationData.traineeProgress.forEach((traineeProgress) => {
            if (traineeProgress.levels.find((level) => level.id == levelId && level.startTime && !level.endTime)) {
                trainees.push(
                    this.visualizationData.trainees.find((trainee) => trainee.userRefId === traineeProgress.userRefId),
                );
            }
        });
        return trainees;
    }

    getFinishedTrainees() {
        const trainees: Trainee[] = [];
        this.visualizationData.traineeProgress.forEach((traineeProgress) => {
            const finishedLevels = traineeProgress.levels.filter((level) => level.state == 'FINISHED');
            if (finishedLevels.length == this.visualizationData.levels.length) {
                trainees.push(
                    this.visualizationData.trainees.find((trainee) => trainee.userRefId == traineeProgress.userRefId),
                );
            }
        });
        return trainees;
    }

    isFinished(levelId: number): boolean {
        return (
            this.visualizationData.traineeProgress
                .map((traineeProgress) =>
                    traineeProgress.levels.filter((level) => level.id == levelId && level.state == 'FINISHED'),
                )
                .reduce((accumulator, value) => accumulator.concat(value), []).length ==
            this.visualizationData.traineeProgress.length
        );
    }

    getLevelTooltip(level: Level) {
        if (level.answer) return this.formatLevelType(level) + '\nCorrect answer: ' + level.answer;
        return this.formatLevelType(level);
    }

    filterTrainees(trainees: Trainee[], level: Level): void {
        this.filteredTrainees.emit(trainees);
        if (level) this.traineeSort.emit(level);
    }

    formatLevelType(level: Level) {
        let name = level.levelType.charAt(0).toUpperCase() + level.levelType.slice(1) + ' level ';
        name += level.levelType === 'training' ? this.getTrainingLevelNumber(level) : '';
        return name;
    }

    private getTrainingLevelNumber(level: Level): number {
        return this.visualizationData.levels.filter((level) => level.levelType == 'training').indexOf(level) + 1;
    }
}
