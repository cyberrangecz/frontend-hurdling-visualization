import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CTF_PROGRESS_CONFIG } from '../../../../app.config';
import { D3Service } from '@cyberrangecz-platform/d3-service';
import { VisualizationData } from '../../../models/visualization-data';
import { Trainee } from '../../../models/trainee';
import { TraineeView } from '../../../models/enums/trainee-view.enum';
import { Level } from '../../../models/level';
import { TraineeLevel } from '../../../models/trainee-level';
import { TraineeSelectData } from '../../../models/trainee-select-data';

@Component({
  selector: 'kypo-viz-hurdling-trainee-selection',
  templateUrl: './trainee-selection.component.html',
  styleUrls: ['./trainee-selection.component.css'],
})
export class TraineeSelectionComponent implements OnInit, OnChanges {
  @Input() visualizationData: VisualizationData;
  @Input() selectedTraineeView: TraineeView;

  @Input() filteredTrainees: Trainee[] = [];
  @Output() filteredTraineesChange = new EventEmitter<Trainee[]>(true);
  @Output() highlightTraineeChange = new EventEmitter<Trainee>();

  public maxNumOfColumns = 10;
  public numberOfColumns = 10;
  public rowHeight = 100;
  public gridWidth;
  public TraineeView = TraineeView;

  private d3;
  private rowWidth = 100;
  private minTileWidth = 80;
  private highlightedTrainee: Trainee;
  private traineeSelectData: TraineeSelectData[] = [];

  constructor(d3: D3Service) {
    this.d3 = d3.getD3();
  }

  ngOnInit() {
    this.setTraineeColumnDistribution();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setTraineeColumnDistribution();
    if (!this.filteredTrainees) this.filteredTrainees = [];
    this.visualizationData.trainees.forEach((trainee) => {
      if (!this.traineeSelectData.find((p) => p.trainee.userRefId == trainee.userRefId)) {
        const res = new TraineeSelectData();
        res.trainee = trainee;
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
        this.traineeSelectData.push(res);
        this.filteredTrainees.push(trainee);
      }
    });
    this.traineeSelectData.forEach((trainee) => {
      trainee.isActive = this.checkIfActive(trainee.trainee);
      if (trainee.isSelected == null && !this.checkIfActive(trainee.trainee)) {
        trainee.isSelected = null;
      } else if (trainee.isSelected == null && this.checkIfActive(trainee.trainee)) {
        trainee.isSelected = true;
      } else {
        trainee.isSelected = this.filteredTrainees.find((p) => p.userRefId === trainee.trainee.userRefId)
          ? true
          : false;
      }
      trainee.warnings = {
        wrongAnswerWarning: this.checkWrongAnswers(trainee.trainee),
        hintWarning: this.checkOutOfHints(trainee.trainee),
        tooLongWarning: this.checkLateTrainee(trainee.trainee),
      };

      if (!trainee.warnings.hintWarning && !trainee.warnings.wrongAnswerWarning && !trainee.warnings.tooLongWarning) {
        trainee.fadedWarnings = {
          wrongAnswerWarning: this.checkWrongAnswers(trainee.trainee),
          hintWarning: this.checkOutOfHints(trainee.trainee),
          tooLongWarning: this.checkLateTrainee(trainee.trainee),
        };
      }
      this.highlightTraineeChange.emit(this.highlightedTrainee);
    });

    if ('visualizationData' in changes) {
      this.filteredTraineesChange.emit(this.traineeSelectData.filter((p) => p.isSelected).map((p) => p.trainee));
    }
  }

  setTraineeColumnDistribution(): void {
    const fullWidth = (this.d3.select('.trainee-selection').node() as HTMLElement).offsetWidth * 0.8;
    this.maxNumOfColumns = Math.round(fullWidth / this.minTileWidth); // % 10; <- limit by 10 people max?
    this.numberOfColumns =
      this.visualizationData.trainees.length <= this.maxNumOfColumns
        ? this.visualizationData.trainees.length
        : this.maxNumOfColumns;
    const traineeNameLength = Math.max(...this.visualizationData.trainees.map((trainee) => trainee.name.length));
    this.gridWidth = this.rowWidth * this.numberOfColumns;
    this.rowHeight = traineeNameLength < 25 ? 100 : 150;
  }

  toggleTrainee(trainee: Trainee): void {
    this.traineeSelectData.find((pp) => pp.trainee.userRefId == trainee.userRefId).isSelected =
      !this.traineeSelectData.find((pp) => pp.trainee.userRefId == trainee.userRefId).isSelected;
    this.filteredTraineesChange.emit(
      this.traineeSelectData.filter((pp) => pp.isSelected == true).map((pp) => pp.trainee),
    );
  }

  showAllTrainees(): void {
    this.traineeSelectData.forEach((selectionData) => {
      if (selectionData.isActive) {
        selectionData.isSelected = true;
      }
    });
    this.filteredTraineesChange.emit(
      this.traineeSelectData.filter((pp) => pp.isSelected == true).map((pp) => pp.trainee),
    );
  }

  hideAllTrainees(): void {
    this.traineeSelectData.forEach((selectionData) => {
      if (selectionData.isActive) {
        selectionData.isSelected = false;
      }
    });
    this.filteredTraineesChange.emit(
      this.traineeSelectData.filter((pp) => pp.isSelected == true).map((pp) => pp.trainee),
    );
  }

  checkIfSelected(trainee: Trainee): boolean {
    return this.traineeSelectData.find((p) => p.trainee.userRefId == trainee.userRefId).isSelected;
  }

  checkIfActive(trainee: Trainee): boolean {
    return this.visualizationData.traineeProgress.find(
      (traineeProgress) => traineeProgress.userRefId == trainee.userRefId,
    )
      ? true
      : false;
  }

  buildWarningTooltip(trainee): string {
    let tooltipText = trainee.name;
    tooltipText += '\n( in level ' + this.getCurrentLevel(trainee).title + ')';
    let conjunction = '';
    if (this.checkLateTrainee(trainee)) {
      tooltipText += '\n is too long in the current level ';
      conjunction = 'and';
    }
    if (this.checkWrongAnswers(trainee)) {
      tooltipText += '\n' + conjunction + ' submitted many wrong answers ';
      conjunction = 'and';
    }
    if (this.checkOutOfHints(trainee)) tooltipText += '\n' + conjunction + ' had used all level hints';
    return tooltipText;
  }

  buildTraineeTooltip(trainee): string {
    let tooltipText = trainee.name;
    if (this.checkIfActive(trainee))
      tooltipText += this.getCurrentTraineeLevel(trainee)
        ? 'is in level: ' + this.getCurrentLevel(trainee).title
        : ' has finished';
    return tooltipText;
  }

  showTooltip(innerText, event): void {
    const tooltip = this.d3.select('.vis-participant-grid .kypo-viz-hurdling-trainee-tooltip');

    tooltip.style('visibility', 'visible').style('opacity', '0.8');

    const yOffset = 0;

    tooltip
      .html(innerText)
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY + yOffset + 'px');
  }

  getDisplayedTrainees(): Trainee[] {
    return this.visualizationData.trainees.filter((trainee) => this.checkIfSelected(trainee));
  }

  checkLateTrainee(trainee: Trainee): boolean {
    if (!this.checkIfActive(trainee)) return false;
    if (!this.getCurrentTraineeLevel(trainee)) return false;
    if (this.getCurrentLevel(trainee).estimatedDuration == 0) return false;
    return (
      this.visualizationData.currentTime >
      this.getCurrentTraineeLevel(trainee).startTime + this.getCurrentLevel(trainee).estimatedDuration * 60 * 1.5
    );
  }

  checkWrongAnswers(trainee: Trainee): boolean {
    return this.getNumOfWrongAnswers(trainee) >= CTF_PROGRESS_CONFIG.wrongAnswerWarningThreshold;
  }

  checkOutOfHints(trainee: Trainee): boolean {
    const levelHints = this.visualizationData.levels.find(
      (level) => level.id == this.getCurrentTraineeLevel(trainee)?.id,
    )?.hints;
    if (!levelHints || levelHints.length == 0) {
      return false;
    }
    const levelHintsTaken =
      this.getCurrentTraineeLevel(trainee).hintsTaken == null ? [] : this.getCurrentTraineeLevel(trainee).hintsTaken;
    return levelHints.length == levelHintsTaken.length;
  }

  getNumOfWrongAnswers(trainee: Trainee): number {
    return this.getCurrentTraineeLevel(trainee)?.wrongAnswers_number;
  }

  getCurrentTraineeLevel(trainee: Trainee): TraineeLevel {
    return this.visualizationData.traineeProgress
      .find((p) => p.userRefId == trainee.userRefId)
      ?.levels.find((level) => level.state != 'FINISHED');
  }

  getCurrentLevel(trainee: Trainee): Level {
    return this.visualizationData.levels.find((level) => level.id == this.getCurrentTraineeLevel(trainee)?.id);
  }

  over(trainee: Trainee): void {
    this.highlightedTrainee = trainee;
    this.highlightTraineeChange.emit(trainee);
  }

  out(): void {
    this.highlightedTrainee = null;
    this.highlightTraineeChange.emit(null);
  }

  hasWarnings(trainee: Trainee): boolean {
    const traineeWarnings = this.traineeSelectData.find((p) => p.trainee.userRefId === trainee.userRefId).warnings;
    return traineeWarnings.hintWarning || traineeWarnings.tooLongWarning || traineeWarnings.wrongAnswerWarning;
  }

  allCurrentWarningsFaded(trainee: Trainee): boolean {
    const warnings = this.traineeSelectData.find((p) => p.trainee.userRefId === trainee.userRefId).warnings;
    const fadedWarnings = this.traineeSelectData.find((p) => p.trainee.userRefId === trainee.userRefId).fadedWarnings;
    return (
      warnings.hintWarning == fadedWarnings.hintWarning &&
      warnings.tooLongWarning == fadedWarnings.tooLongWarning &&
      warnings.wrongAnswerWarning == fadedWarnings.wrongAnswerWarning
    );
  }

  fadeCurrentWarnings(trainee: Trainee): void {
    const traineeData = this.traineeSelectData.find((p) => p.trainee.userRefId === trainee.userRefId);
    traineeData.fadedWarnings.tooLongWarning = this.checkLateTrainee(trainee);
    traineeData.fadedWarnings.hintWarning = this.checkOutOfHints(trainee);
    traineeData.fadedWarnings.wrongAnswerWarning = this.checkWrongAnswers(trainee);
  }
}
