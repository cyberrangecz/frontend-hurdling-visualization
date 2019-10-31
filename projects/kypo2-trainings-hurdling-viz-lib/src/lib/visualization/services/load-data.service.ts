import { map, timestamp } from "rxjs/operators";
import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from "@angular/common/http";

import { Observable, forkJoin } from "rxjs";
import { GenericObject } from "../models/generic-object.type";
import { Event } from "../models/event";
import { Game } from "../models/game";
import { Data } from "../models/data";
import { ConfigService } from "../config/config.service";
import { User, UserDTO } from "kypo2-auth";

@Injectable()
export class LoadDataService {
  private levelsTimePlan: number[] = [];
  private levelTimePlan = 500;
  private levelTypePrefix = "cz.muni.csirt.kypo.events.trainings.";
  private eventTypes: GenericObject = {
    gameStart: this.levelTypePrefix + "TrainingRunStarted",
    gameFinished: this.levelTypePrefix + "TrainingRunEnded",
    assessmentAnswers: this.levelTypePrefix + "AssessmentAnswers",
    gameExited: this.levelTypePrefix + "TrainingRunSurrendered",
    hint: this.levelTypePrefix + "HintTaken",
    wrongFlag: this.levelTypePrefix + "WrongFlagSubmitted",
    levelCompleted: this.levelTypePrefix + "LevelCompleted",
    correctFlag: this.levelTypePrefix + "CorrectFlagSubmitted",
    solution: this.levelTypePrefix + "SolutionDisplayed"
  };

  constructor(private http: HttpClient, private configService: ConfigService) {}

  public getGameAndPlanData(
    trainingDefinitionId: string,
    trainingInstanceId: string,
    levelsTimePlan: number[]
  ) {
    const defUrl: string =
      this.configService.config.restBaseUrl +
      "training-definitions/" +
      this.configService.trainingDefinitionId;
    const eventsUrl: string =
      this.configService.config.restBaseUrl +
      "training-events/training-definitions/" +
      this.configService.trainingDefinitionId +
      "/training-instances/" +
      this.configService.trainingInstanceId;

    return forkJoin([
      this.loadData<Game>(defUrl),
      this.loadData<Event>(eventsUrl),
      this.getParticipants()
    ]).pipe(
      map(
        (data: any[]): Data => {
          const game: Game = data[0];
          const events: Event[] = data[1];
          const participants = data[2];
          const result: Data = this.processData(game, events, participants);
          return result;
        }
      )
    );
  }

  public getGameAndPlanMock(gameInfo, gameEvents, participants) {
    return this.processData(gameInfo, gameEvents, participants);
  }

  private loadData<T>(url: string, params?: any): Observable<any> {
    if (typeof params !== "undefined") {
      return this.http.get<T[]>(url, params);
    } else {
      return this.http.get<T[]>(url);
    }
  }

  /**
   * Fetches participants data
   */
  getParticipants(): Observable<User[]> {
    return this.http
      .get<UserDTO[]>(
        `${this.configService.config.restBaseUrl}visualizations/training-instances/${this.configService.trainingInstanceId}/participants`
      )
      .pipe(map(userDTOs => userDTOs.map(userDTO => User.fromDTO(userDTO))));
  }

  private getLevelNumber(id, levels): number {
    let newId = -1;
    levels.forEach((level, i) => {
      if (level.id === id) {
        newId = i + 1;
      }
    });
    return newId;
  }

  private processData(game, events, participants): Data {
    const gamedataset: GenericObject[] = [],
      plandataset: GenericObject[] = [],
      // stores levels keys for use in d3.stack, in format "level + index" or "start" for start of the game
      levels: string[] = ["start"],
      // stores types of levels in the same order as the level names
      types: string[] = [],
      // to get the highest time as current time
      // map for keys (team id) to game/plan datasets, because datasets must be arrays to use in d3.stack
      teamsMap: GenericObject = {},
      finalLevelsTimePlan: number[] = [];
    let time = 0;

    const levelCount = game.levels.length;
    for (let l = 1; l <= levelCount; l++) {
      let levelType: string;
      if (game.levels[l - 1].level_type === "INFO_LEVEL") {
        levelType = "info";
      } else if (game.levels[l - 1].level_type === "ASSESSMENT_LEVEL") {
        levelType = "assessment";
      } else {
        levelType = "game";
      }
      const levelKey = "level" + l;
      levels.push(levelKey);
      types.push(levelType);
      this.levelsTimePlan.push(
        game.levels[l - 1].estimated_duration > 0
          ? game.levels[l - 1].estimated_duration * 60
          : this.levelTimePlan
      );
    }

    const playersFromEvents = Array.from(
      new Set(events.map(event => event.user_ref_id))
    );
    gamedataset.length = playersFromEvents.length;

    const gameStartTimestamp = events[0].timestamp / 1000;

    events.forEach(event => {
      const gameTime = event.game_time / 1000;
      const player = this.getParticipantById(event.user_ref_id, participants);
      const playerIndex = playersFromEvents.indexOf(player.id);
      const levelNum: number = this.getLevelNumber(event.level, game.levels);
      const levelKey: string = "level" + levelNum;
      let levelFinished = false;

      if (gamedataset[playerIndex] === undefined) {
        gamedataset[playerIndex] = {};
        gamedataset[playerIndex].team = player.name;
        gamedataset[playerIndex].teamAvatar = player.picture;
        gamedataset[playerIndex].events = [];
        gamedataset[playerIndex].totalTime = 0;

        plandataset[playerIndex] = {};
        plandataset[playerIndex]["team"] = player.name;
        plandataset[playerIndex]["teamAvatar"] = player.picture;
        plandataset[playerIndex]["start"] = 0;
      }

      const gameEvent: Event = new Event();
      if (event.hint_id !== undefined) {
        gameEvent.hint_id = event.hint_id;
      }
      gameEvent.game_details = {
        player_id: event.user_ref_id,
        player_name: player.name,
        logical_time: gameTime,
        level: event.level,
        level_number: levelNum
      };
      gameEvent.timestamp = event.timestamp / 1000;

      // time = event.game_time > time ? event.game_time : time;
      time = events[events.length - 1].timestamp - events[0].timestamp;

      switch (event.type) {
        case this.eventTypes.gameStart:
          gameEvent.type = null;
          // if the first level started, save the team start (it must be as timestamp,
          // later when the game start timestamp will be known, it will be deducted)
          gamedataset[playerIndex]["start"] =
            gameEvent.timestamp - gameStartTimestamp;
          break;
        case this.eventTypes.solution:
          gameEvent.type = "solution";
          gameEvent.name = "Solution displayed";
          break;
        case this.eventTypes.correctFlag:
        case this.eventTypes.levelCompleted:
          gameEvent.type = null;
          levelFinished = true;
          break;
        case this.eventTypes.gameExited:
        case this.eventTypes.gameFinished:
          gameEvent.type = null;
          levelFinished = true;
          gamedataset[playerIndex]["currentState"] = "finished";
          break;
        case this.eventTypes.hint:
          gameEvent.type = "hint";
          gameEvent.name = "Hint " + event.hint_title + " taken";
          break;
        case this.eventTypes.wrongFlag:
          gameEvent.type = "wrong";
          gameEvent.name = "Wrong flag submitted: " + event.flag_content;
          break;
        default:
          gameEvent.type = null;
          break;
      }

      // level is finished, save the time
      if (levelFinished) {
        let prevLevels = 0;
        for (let i = 1; i < levelNum; i++) {
          prevLevels +=
            typeof gamedataset[playerIndex]["level" + i] !== "undefined"
              ? gamedataset[playerIndex]["level" + i]
              : 0;
        }

        // if there are more events with different time, take the bigger
        if (
          typeof gamedataset[playerIndex][levelKey] === "undefined" ||
          gamedataset[playerIndex][levelKey] < gameTime - prevLevels
        ) {
          gamedataset[playerIndex][levelKey] = gameTime - prevLevels;
          gamedataset[playerIndex]["totalTime"] = gameTime;
        }
      } else {
        gamedataset[playerIndex]["totalTime"] = gameTime;
      }

      if (gameEvent.type != null) {
        gamedataset[playerIndex].events.push(gameEvent);
      }
    });
    // create final timeplan for levels
    levels.forEach((level, i): void => {
      let timePlan: number = this.levelsTimePlan[i]
        ? this.levelsTimePlan[i]
        : this.levelTimePlan;
      if (level === "start") timePlan = 0;
      else {
        finalLevelsTimePlan.push(timePlan);
      }
    });

    // create dataset for plan
    plandataset.forEach((team: GenericObject): void => {
      levels.forEach((level, i): void => {
        const timePlan: number = this.levelsTimePlan[i]
          ? this.levelsTimePlan[i]
          : this.levelTimePlan;
        team[level] = level !== "start" ? timePlan : 0;
      });
    });

    // set current level on which is team now working
    // mark finished teams and if team doesn't finished yet, adjust total time
    gamedataset.forEach(function(team: GenericObject): void {
      // if the team finished, there is no need to search current state
      if (team["currentState"] === "finished") return;

      levels.forEach(function(level, i): void {
        if (
          typeof team[level] === "undefined" &&
          typeof team["currentState"] === "undefined"
        ) {
          team["currentState"] = level;
        }
      });

      const lastLevelKey: string = levels[levels.length - 1];
      if (typeof team[lastLevelKey] === "number")
        // adjust total time
        team["currentState"] = "finished"; // finished team
    });
    return {
      gameDataset: gamedataset,
      planDataset: plandataset,
      levels: levels,
      types: types,
      levelsTimePlan: finalLevelsTimePlan,
      time: time / 1000
    };
  }

  private getParticipantById(id: number, participants: User[]): User {
    return participants.find(participant => participant.id === id);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error("An error occurred:", error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an ErrorObservable with a user-facing error message
    // return new ErrorObservable('An error occured while trying to fetch the data.');
  }
}
