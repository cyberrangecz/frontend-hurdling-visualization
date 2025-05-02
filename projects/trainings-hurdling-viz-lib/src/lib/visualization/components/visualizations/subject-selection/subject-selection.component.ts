import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CTF_PROGRESS_CONFIG } from '../../../../app.config';
import { D3Service } from '@crczp/d3-service';
import { HurdlingVisualizationData } from '../../../models/hurdling-visualization-data';
import { SubjectDisplayTypeEnum } from '../../../models/enums/subject-view-type.enum';
import { Level } from '../../../models/level';
import { SubjectLevel } from '../../../models/subject-level';
import { DataSelection } from '../../../models/data-selection';
import { ProgressSubjectData } from '../../../models/progress-subject-progress-data';

@Component({
    selector: 'crczp-viz-hurdling-subject-selection',
    templateUrl: './subject-selection.component.html',
    styleUrls: ['./subject-selection.component.css'],
})
export class SubjectSelectionComponent implements OnInit, OnChanges {
    @Input() isCoop = false;
    @Input() visualizationData: HurdlingVisualizationData;
    @Input() selectedSubjectDisplay: SubjectDisplayTypeEnum;

    @Input() filteredSubjects: ProgressSubjectData[] = [];
    @Output() filteredSubjectsChange = new EventEmitter<ProgressSubjectData[]>(true);
    @Output() highlightSubjectsChange = new EventEmitter<ProgressSubjectData>();

    public maxNumOfColumns = 10;
    public numberOfColumns = 10;
    public rowHeight = 100;
    public gridWidth;

    private d3;
    private rowWidth = 100;
    private minTileWidth = 80;
    private highlightedSubject: ProgressSubjectData;
    private subjectSelectData: DataSelection[] = [];

    constructor(d3: D3Service) {
        this.d3 = d3.getD3();
    }

    ngOnInit() {
        this.setSubjectColumnDistribution();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setSubjectColumnDistribution();
        if (!this.filteredSubjects) this.filteredSubjects = [];
        this.visualizationData.progress.forEach((progressData) => {
            if (!this.subjectSelectData.find((p) => p.selection.id == progressData.id)) {
                const res = new DataSelection();
                res.selection = progressData;
                res.isActive = false;
                res.isSelected = null;
                res.warnings = {
                    wrongAnswerWarning: false,
                    hintWarning: false,
                    tooLongWarning: false,
                };
                res.fadedWarnings = {
                    wrongAnswerWarning: false,
                    hintWarning: false,
                    tooLongWarning: false,
                };
                this.subjectSelectData.push(res);
                this.filteredSubjects.push(progressData);
            }
        });
        this.subjectSelectData.forEach((subject) => {
            subject.isActive = this.checkIfActive(subject.selection);
            if (subject.isSelected == null && !this.checkIfActive(subject.selection)) {
                subject.isSelected = null;
            } else if (subject.isSelected == null && this.checkIfActive(subject.selection)) {
                subject.isSelected = true;
            } else {
                subject.isSelected = !!this.filteredSubjects.find((p) => p.id === subject.selection.id);
            }
            subject.warnings = {
                wrongAnswerWarning: this.checkWrongAnswers(subject.selection),
                hintWarning: this.checkOutOfHints(subject.selection),
                tooLongWarning: this.checkLateSubject(subject.selection),
            };

            if (
                !subject.warnings.hintWarning &&
                !subject.warnings.wrongAnswerWarning &&
                !subject.warnings.tooLongWarning
            ) {
                subject.fadedWarnings = {
                    wrongAnswerWarning: this.checkWrongAnswers(subject.selection),
                    hintWarning: this.checkOutOfHints(subject.selection),
                    tooLongWarning: this.checkLateSubject(subject.selection),
                };
            }
            this.highlightSubjectsChange.emit(this.highlightedSubject);
        });

        if ('visualizationData' in changes) {
            this.filteredSubjectsChange.emit(
                this.subjectSelectData.filter((p) => p.isSelected).map((p) => p.selection),
            );
        }
    }

    setSubjectColumnDistribution(): void {
        const fullWidth = (this.d3.select('.subject-selection').node() as HTMLElement).offsetWidth * 0.8;
        this.maxNumOfColumns = Math.round(fullWidth / this.minTileWidth); // % 10; <- limit by 10 people max?
        this.numberOfColumns =
            this.visualizationData.progress.length <= this.maxNumOfColumns
                ? this.visualizationData.progress.length
                : this.maxNumOfColumns;
        const subjectNameLength = Math.max(...this.visualizationData.progress.map((data) => data.name.length));
        this.gridWidth = this.rowWidth * this.numberOfColumns;
        this.rowHeight = subjectNameLength < 25 ? 100 : 150;
    }

    toggleSubject(subject: ProgressSubjectData): void {
        this.subjectSelectData.find((pp) => pp.selection.id == subject.id).isSelected = !this.subjectSelectData.find(
            (pp) => pp.selection.id == subject.id,
        ).isSelected;
        this.filteredSubjectsChange.emit(
            this.subjectSelectData.filter((pp) => pp.isSelected == true).map((pp) => pp.selection),
        );
    }

    showAllSubjects(): void {
        this.subjectSelectData.forEach((selectionData) => {
            if (selectionData.isActive) {
                selectionData.isSelected = true;
            }
        });
        this.filteredSubjectsChange.emit(
            this.subjectSelectData.filter((pp) => pp.isSelected == true).map((pp) => pp.selection),
        );
    }

    hideAllSubjects(): void {
        this.subjectSelectData.forEach((selectionData) => {
            if (selectionData.isActive) {
                selectionData.isSelected = false;
            }
        });
        this.filteredSubjectsChange.emit(
            this.subjectSelectData.filter((pp) => pp.isSelected == true).map((pp) => pp.selection),
        );
    }

    checkIfSelected(subject: ProgressSubjectData): boolean {
        return this.subjectSelectData.find((p) => p.selection.id == subject.id).isSelected;
    }

    checkIfActive(subject: ProgressSubjectData): boolean {
        return !!this.visualizationData.progress.find((progressData) => progressData.id == subject.id);
    }

    buildWarningTooltip(subject): string {
        let tooltipText = subject.name;
        tooltipText += '\n( in level ' + this.getCurrentLevel(subject).title + ')';
        let conjunction = '';
        if (this.checkLateSubject(subject)) {
            tooltipText += '\n is too long in the current level ';
            conjunction = 'and';
        }
        if (this.checkWrongAnswers(subject)) {
            tooltipText += '\n' + conjunction + ' submitted many wrong answers ';
            conjunction = 'and';
        }
        if (this.checkOutOfHints(subject)) tooltipText += '\n' + conjunction + ' had used all level hints';
        return tooltipText;
    }

    buildSubjectTooltip(subject): string {
        let tooltipText = subject.name;
        if (this.checkIfActive(subject))
            tooltipText += this.getCurrentSubjectLevel(subject)
                ? 'is in level: ' + this.getCurrentLevel(subject).title
                : ' has finished';
        return tooltipText;
    }

    showTooltip(innerText, event): void {
        const tooltip = this.d3.select('.vis-participant-grid .viz-hurdling-subject-tooltip');

        tooltip.style('visibility', 'visible').style('opacity', '0.8');

        const yOffset = 0;

        tooltip
            .html(innerText)
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY + yOffset + 'px');
    }

    getDisplayedSubjects(): ProgressSubjectData[] {
        return this.visualizationData.progress.filter((subject) => this.checkIfSelected(subject));
    }

    checkLateSubject(subject: ProgressSubjectData): boolean {
        if (!this.checkIfActive(subject)) return false;
        if (!this.getCurrentSubjectLevel(subject)) return false;
        if (this.getCurrentLevel(subject).estimatedDuration == 0) return false;
        return (
            this.visualizationData.currentTime >
            this.getCurrentSubjectLevel(subject).startTime + this.getCurrentLevel(subject).estimatedDuration * 60 * 1.5
        );
    }

    checkWrongAnswers(subject: ProgressSubjectData): boolean {
        return this.getNumOfWrongAnswers(subject) >= CTF_PROGRESS_CONFIG.wrongAnswerWarningThreshold;
    }

    checkOutOfHints(subject: ProgressSubjectData): boolean {
        const levelHints = this.visualizationData.levels.find(
            (level) => level.id == this.getCurrentSubjectLevel(subject)?.id,
        )?.hints;
        if (!levelHints || levelHints.length == 0) {
            return false;
        }
        const levelHintsTaken =
            this.getCurrentSubjectLevel(subject).hintsTaken == null
                ? []
                : this.getCurrentSubjectLevel(subject).hintsTaken;
        return levelHints.length == levelHintsTaken.length;
    }

    getNumOfWrongAnswers(subject: ProgressSubjectData): number {
        return this.getCurrentSubjectLevel(subject)?.wrongAnswers_number;
    }

    getCurrentSubjectLevel(subject: ProgressSubjectData): SubjectLevel {
        return this.visualizationData.progress
            .find((p) => p.id == subject.id)
            ?.levels.find((level) => level.state != 'FINISHED');
    }

    getCurrentLevel(subject: ProgressSubjectData): Level {
        return this.visualizationData.levels.find((level) => level.id == this.getCurrentSubjectLevel(subject)?.id);
    }

    over(subject: ProgressSubjectData): void {
        this.highlightedSubject = subject;
        this.highlightSubjectsChange.emit(subject);
    }

    out(): void {
        this.highlightedSubject = null;
        this.highlightSubjectsChange.emit(null);
    }

    hasWarnings(subject: ProgressSubjectData): boolean {
        const subjectWarnings = this.subjectSelectData.find((p) => p.selection.id === subject.id).warnings;
        return subjectWarnings.hintWarning || subjectWarnings.tooLongWarning || subjectWarnings.wrongAnswerWarning;
    }

    allCurrentWarningsFaded(subject: ProgressSubjectData): boolean {
        const warnings = this.subjectSelectData.find((p) => p.selection.id === subject.id).warnings;
        const fadedWarnings = this.subjectSelectData.find((p) => p.selection.id === subject.id).fadedWarnings;
        return (
            warnings.hintWarning == fadedWarnings.hintWarning &&
            warnings.tooLongWarning == fadedWarnings.tooLongWarning &&
            warnings.wrongAnswerWarning == fadedWarnings.wrongAnswerWarning
        );
    }

    fadeCurrentWarnings(subject: ProgressSubjectData): void {
        const subjectData = this.subjectSelectData.find((p) => p.selection.id === subject.id);
        subjectData.fadedWarnings.tooLongWarning = this.checkLateSubject(subject);
        subjectData.fadedWarnings.hintWarning = this.checkOutOfHints(subject);
        subjectData.fadedWarnings.wrongAnswerWarning = this.checkWrongAnswers(subject);
    }

    getSubjectTypeName(): string {
        return (this.isCoop ? 'team' : 'trainee') + (this.visualizationData.progress.length !== 1 ? 's' : '');
    }
}
