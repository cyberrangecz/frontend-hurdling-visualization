import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Level } from '../../../models/level';
import { HurdlingVisualizationData } from '../../../models/hurdling-visualization-data';
import { ProgressData } from '../../../models/progress-subject-progress-data';

@Component({
    selector: 'crczp-viz-hurdling-level-list',
    templateUrl: './level-list.component.html',
    styleUrls: ['./level-list.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class LevelListComponent {
    @Input() isCoop: boolean = false;
    @Input() visualizationData: HurdlingVisualizationData;

    @Output() filteredSubjects = new EventEmitter<ProgressData[]>();
    @Output() subjectSort = new EventEmitter<Level>();

    constructor() {}

    getSubjectsForLevel(levelId): ProgressData[] {
        const subjects: ProgressData[] = [];
        this.visualizationData.progress.forEach((progressData) => {
            if (progressData.levels.find((level) => level.id == levelId && level.startTime && !level.endTime)) {
                subjects.push(progressData);
            }
        });
        return subjects;
    }

    getFinishedRuns() {
        const progresses: ProgressData[] = [];
        this.visualizationData.progress.forEach((progressData) => {
            const finishedLevels = progressData.levels.filter((level) => level.state == 'FINISHED');
            if (finishedLevels.length == this.visualizationData.levels.length) {
                progresses.push(progressData);
            }
        });
        return progresses;
    }

    isFinished(levelId: number): boolean {
        return (
            this.visualizationData.progress
                .map((progress) => progress.levels.filter((level) => level.id == levelId && level.state == 'FINISHED'))
                .reduce((accumulator, value) => accumulator.concat(value), []).length ==
            this.visualizationData.progress.length
        );
    }

    getLevelTooltip(level: Level) {
        if (level.answer) return this.formatLevelType(level) + '\nCorrect answer: ' + level.answer;
        return this.formatLevelType(level);
    }

    filterProgressData(subjects: ProgressData[], level: Level): void {
        this.filteredSubjects.emit(subjects);
        if (level) this.subjectSort.emit(level);
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
