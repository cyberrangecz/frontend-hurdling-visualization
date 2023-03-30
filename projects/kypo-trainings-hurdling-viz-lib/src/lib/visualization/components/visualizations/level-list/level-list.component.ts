import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  OnChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { Level } from "../../../models/level";
import { User } from "@sentinel/auth";
import { Trainee } from "../../../models/trainee";
import { VisualizationData } from "../../../models/visualization-data";

@Component({
  selector: "kypo-viz-hurdling-level-list",
  templateUrl: "./level-list.component.html",
  styleUrls: ["./level-list.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class LevelListComponent {
  @Input() visualizationData: VisualizationData;

  @Output() filteredTrainees = new EventEmitter<Trainee[]>();
  @Output() traineeSort = new EventEmitter<Level>();

  constructor() {}
  ngOnInit() {}

  ngOnChanges() {}

  getTraineesForLevel(levelId): Trainee[] {
    const trainees: Trainee[] = [];
    this.visualizationData.traineeProgress.forEach((traineeProgress) => {
      if (
        traineeProgress.levels.find(
          (level) => level.id == levelId && level.startTime && !level.endTime
        )
      ) {
        trainees.push(
          this.visualizationData.trainees.find(
            (trainee) => trainee.userRefId === traineeProgress.userRefId
          )
        );
      }
    });
    return trainees;
  }

  getFinishedTrainees() {
    const trainees: Trainee[] = [];
    this.visualizationData.traineeProgress.forEach((traineeProgress) => {
      const finishedLevels = traineeProgress.levels.filter(
        (level) => level.state == "FINISHED"
      );
      if (finishedLevels.length == this.visualizationData.levels.length) {
        trainees.push(
          this.visualizationData.trainees.find(
            (trainee) => trainee.userRefId == traineeProgress.userRefId
          )
        );
      }
    });
    return trainees;
  }

  isFinished(levelId: number): boolean {
    return (
      this.visualizationData.traineeProgress
        .map((traineeProgress) =>
          traineeProgress.levels.filter(
            (level) => level.id == levelId && level.state == "FINISHED"
          )
        )
        .reduce((accumulator, value) => accumulator.concat(value), []).length ==
      this.visualizationData.traineeProgress.length
    );
  }

  getLevelTooltip(level: Level) {
    if (level.answer) return level.title + "\nCorrect answer: " + level.answer;
    return level.title;
  }

  filterTrainees(trainees: Trainee[], level: Level): void {
    this.filteredTrainees.emit(trainees);
    if (level) this.traineeSort.emit(level);
  }

  parseLevelName(level: Level) {
    let name =
      level.levelType.charAt(0).toUpperCase() +
      level.levelType.slice(1) +
      " level ";
    name +=
      level.levelType === "training" ? this.getTrainingLevelNumber(level) : "";
    return name;
  }

  private getTrainingLevelNumber(level: Level): number {
    return (
      this.visualizationData.levels
        .filter((level) => level.levelType == "training")
        .indexOf(level) + 1
    );
  }
}
