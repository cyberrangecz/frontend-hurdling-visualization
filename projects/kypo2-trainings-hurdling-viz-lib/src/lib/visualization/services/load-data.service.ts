import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse, HttpHeaders
} from '@angular/common/http';

import { Observable ,  forkJoin } from 'rxjs';
import { GenericObject } from '../models/generic-object.type';
import { Event } from '../models/event';
import { Game } from '../models/game';
import { Data } from '../models/data';
import {forEach} from '@angular/router/src/utils/collection';

@Injectable()
export class LoadDataService {
  private httpClient: HttpClient;
  private levelsTimePlan: number[] = [];
  private levelTimePlan = 120;
  private levelTypePrefix = 'cz.muni.csirt.kypo.events.trainings.';
  private eventTypes: GenericObject = {
    gameStart: this.levelTypePrefix + 'TrainingRunStarted',
    gameFinished: this.levelTypePrefix + 'TrainingRunEnded',
    assessmentAnswers: this.levelTypePrefix + 'AssessmentAnswers',
    gameExited: this.levelTypePrefix + 'TrainingRunSurrendered',
    hint: this.levelTypePrefix + 'HintTaken',
    skip: this.levelTypePrefix + 'LevelSkipped', // obsolete?
    wrongFlag: this.levelTypePrefix + 'WrongFlagSubmitted',
    levelCompleted: this.levelTypePrefix + 'LevelCompleted',
    correctFlag: this.levelTypePrefix + 'CorrectFlagSubmitted',
    solution: this.levelTypePrefix + 'SolutionDisplayed'
  };

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public getGameAndPlanData(
    token: string,
    apiUrl: string,
    definitionId: string,
    gameId: string,
    levelsTimePlan: number[]
  ) {
    this.levelsTimePlan = levelsTimePlan;
    const defUrl: string = apiUrl + '/training-definitions/' + definitionId;
    const eventsUrl: string = apiUrl + '/training-events/training-definitions/' + definitionId + '/training-instances/' + gameId;

    return forkJoin([
      this.loadData<Game>(token, defUrl),
      this.loadData<Event>(token, eventsUrl)
    ]).pipe(map(
      (data: any[]): Data => {
        const game: Game = data[0];
        const events: Event[] = data[1];
        const result: Data = this.processData(game, events);
        return result;
      }
    ));
  }

  public getGameAndPlanMock(gameInfo, gameEvents) {
      return this.processData(gameInfo, gameEvents);
  }

  private loadData<T>(token: string, url: string, params?: any): Observable<any> {
    const headers = new HttpHeaders();
    if (typeof params !== 'undefined') {
      return this.httpClient.get<T[]>(url, {headers: new HttpHeaders({'Authorization': 'Bearer ' + token})});
    } else {
      return this.httpClient.get<T[]>(url, {headers: new HttpHeaders({'Authorization': 'Bearer ' + token})});
    }
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

  private processData(game, events): Data {
    const gamedataset: GenericObject[] = [],
      plandataset: GenericObject[] = [],
      // stores levels keys for use in d3.stack, in format "level + index" or "start" for start of the game
      levels: string[] = ['start'],
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
      if (game.levels[l - 1].level_type === 'INFO_LEVEL') {
          levelType = 'info';
      } else if (game.levels[l - 1].level_type === 'ASSESSMENT_LEVEL') {
          levelType = 'assessment';
      } else {
          levelType = 'game';
      }
      const levelKey = 'level' + l;
      levels.push(levelKey);
      types.push(levelType);
      this.levelsTimePlan.push(game.levels[l - 1].estimated_duration > 0 ?
          game.levels[l - 1].estimated_duration * 60 : this.levelTimePlan);
    }

    const players: string[] = new Array();
    // preprocessing
    events.forEach( event => {
        if (players.indexOf(event.player_login) === -1) {
          players.push(event.player_login);
        }
    });

    gamedataset.length = players.length;
    let gameStartTimestamp = events[0].timestamp / 1000;

    events.forEach(event => {
        const player = event.player_login;
        const playerIndex = players.indexOf(player);
        const levelNum: number = this.getLevelNumber(event.level, game.levels);
        const levelKey: string = 'level' + levelNum;
        let levelFinished = false;

        if (gamedataset[playerIndex] === undefined) {
            gamedataset[playerIndex] = {};
            gamedataset[playerIndex].team = player;
            gamedataset[playerIndex].events = [];
            gamedataset[playerIndex].totalTime = 0;

            plandataset[playerIndex] = {};
            plandataset[playerIndex]['team'] = player;
            plandataset[playerIndex]['start'] = 0;
        }

        const gameEvent: Event = new Event();
        if (event.hint_id !== undefined) {
            gameEvent.hint_id = event.hint_id;
        }
        gameEvent.game_details = {
            player_id: event.player_login,
            logical_time: event.game_time / 1000,
            level: event.level,
            level_number: levelNum
        };

        // const type = event.type.split('.');
        // gameEvent.type = type[type.length - 1];
        gameEvent.timestamp = event.timestamp / 1000;


        switch (event.type) {
            case this.eventTypes.gameStart:
                gameEvent.type = null;
                // if the first level started, save the team start (it must be as timestamp,
                // later when the game start timestamp will be known, it will be deducted)
                gameStartTimestamp =  gameEvent.timestamp < gameStartTimestamp ? gameEvent.timestamp : gameStartTimestamp;
                gamedataset[playerIndex]['start'] = gameEvent.timestamp - gameStartTimestamp;
                break;
            case this.eventTypes.solution:
                gameEvent.type = 'solution';
                gameEvent.name = 'Solution displayed';
                break;
            case this.eventTypes.correctFlag:
            case this.eventTypes.levelCompleted:
                gameEvent.type = null;
                levelFinished = true;
                break;
            case this.eventTypes.skip:
                gameEvent.type = 'skip';
                gameEvent.name = 'Level cowardly skipped';
                levelFinished = true;
                break;
            case this.eventTypes.gameExited:
            case this.eventTypes.gameFinished:
                gameEvent.type = null;
                levelFinished = true;
                gamedataset[playerIndex]['currentState'] = 'finished';
                time = event.game_time > time ? event.game_time : time;
                break;
            case this.eventTypes.hint:
                gameEvent.type = 'hint';
                gameEvent.name = 'Hint ' + event.hint_id + ' taken';
                break;
            case this.eventTypes.wrongFlag:
                gameEvent.type = 'wrong';
                gameEvent.name = 'Wrong flag submitted: ' + event.flag_content;
                break;
            default:
                gameEvent.type = null;
                break;
        }

        // level is finished, save the time
        if (levelFinished) {
            let prevLevels = 0;
            for (let i = 1; i < levelNum; i++) {
                prevLevels += (typeof gamedataset[playerIndex]['level' + i ] !== 'undefined') ?
                    gamedataset[playerIndex]['level' + i] : 0;
            }

            // if there are more events with different time, take the bigger
            if (typeof gamedataset[playerIndex][levelKey] === 'undefined' ||
                gamedataset[playerIndex][levelKey] < event.game_time / 1000 - prevLevels) {
                gamedataset[playerIndex][levelKey] = event.game_time / 1000 - prevLevels;
                gamedataset[playerIndex]['totalTime'] = event.game_time / 1000;
            }
        } else {
            gamedataset[playerIndex]['totalTime'] =  events[events.length - 1].game_time / 1000 - gamedataset[playerIndex]['start'];
        }

        if (gameEvent.type != null) {
            gamedataset[playerIndex].events.push(gameEvent);
        }
    });

    /*events.forEach(
      function(event: Event): void {
        // eventTime is relative time of event in level
        const eventTime: number = event.timestamp, // game_details.logical_time,
          eventTeam: string = event.player_login, // game_details.player_id,
          level: number = event.level, // game_details.level,
          levelKey: string = 'level' + level;
        let eventType: string = event.type,
          eventName: string = event.type,
          teamIndex = 0,
          levelFinished = false;

        // if the team is not in dataset yet, it is added to game/plan datasets and map
        if (players[eventTeam] == null) {
          teamIndex = gamedataset.length;
          teamsMap[eventTeam] = teamIndex;
          gamedataset[teamIndex] = {};
          gamedataset[teamIndex]['team'] = eventTeam;
          gamedataset[teamIndex]['events'] = [];
          gamedataset[teamIndex]['totalTime'] = 0;

          plandataset[teamIndex] = {};
          plandataset[teamIndex]['team'] = eventTeam;
          plandataset[teamIndex]['start'] = 0;
        } else {
          teamIndex = teamsMap[eventTeam];
        }

        console.log(gamedataset);
        // add level to levels array, if it does not contain it yet
        if (levels.indexOf(levelKey) === -1) levels.push(levelKey);

        // finding out the game start timestamp (it is the smallest)
        if (gameStartTimestamp > event.timestamp)
          gameStartTimestamp = event.timestamp;
        // finding out the current timestamp (it is the greatest)
        if (currentTimestamp < event.timestamp)
          currentTimestamp = event.timestamp;

        // according to type of event, add it to events array of the team and/or store the time of level end
        switch (event.type) {
          case this.eventTypes.gameStart:
            eventType = null;
            // if the first level started, save the team start (it must be as timestamp,
            // later when the game start timestamp will be known, it will be deducted)
            gamedataset[teamIndex]['start'] = event.timestamp;
            break;
          case this.eventTypes.solution:
            eventType = 'solution';
            eventName = 'Solution displayed';
            break;
          case this.eventTypes.correctFlag:
            eventType = null;
            levelFinished = true;
            break;
          case this.eventTypes.skip:
            eventType = 'skip';
            eventName = 'Level cowardly skipped';
            levelFinished = true;
            break;
          case this.eventTypes.gameExited:
          case this.eventTypes.gameFinished:
            eventType = null;
            levelFinished = true;
            gamedataset[teamIndex]['currentState'] = 'finished';
            break;
          case this.eventTypes.hint:
            eventType = 'hint';
            eventName = 'Hint ' + event.hint_id + ' taken';
            break;
          default:
            eventType = null;
            break;
        }

        if (levelFinished) {
          // level is finished, save the time
          // sometimes there are some events twice with different time, take the bigger
          if (
            typeof gamedataset[teamIndex][levelKey] === 'undefined' ||
            gamedataset[teamIndex][levelKey] < eventTime
          ) {
            if (gamedataset[teamIndex][levelKey] < eventTime) {
              gamedataset[teamIndex]['totalTime'] -=
                gamedataset[teamIndex][levelKey];
            }
            gamedataset[teamIndex][levelKey] = eventTime;
            gamedataset[teamIndex]['totalTime'] += eventTime;
          }
        }

        if (eventType != null) {
          const eventData: any = {
            type: eventType,
            name: eventName,
            time: eventTime,
            level: event.game_details.level
          };
          gamedataset[teamIndex]['events'].push(eventData);
        }
      }.bind(this)
    );*/

    time = events[events.length - 1].timestamp - events[0].timestamp;

    // create final timeplan for levels
    levels.forEach((level, i): void => {
      let timePlan: number = this.levelsTimePlan[i]
        ? this.levelsTimePlan[i] : this.levelTimePlan;
      if (level === 'start') timePlan = 0;
      else {
        finalLevelsTimePlan.push(timePlan);
      }
    });

    // create dataset for plan
    plandataset.forEach((team: GenericObject): void => {
      levels.forEach((level, i): void => {
        const timePlan: number = this.levelsTimePlan[i]
          ? this.levelsTimePlan[i] : this.levelTimePlan;
        team[level] = level !== 'start' ? timePlan : 0;
      });
    });

    // set current level on which is team now working
    // mark finished teams and if team doesn't finished yet, adjust total time
    gamedataset.forEach(function(team: GenericObject): void {
      // if the team finished, there is no need to search current state
      if (team['currentState'] === 'finished') return;

      levels.forEach(function(level, i): void {
        if (
          typeof team[level] === 'undefined' &&
          typeof team['currentState'] === 'undefined'
        ) {
          team['currentState'] = level;
        }
      });

      const lastLevelKey: string = levels[levels.length - 1];
      /*if (typeof team[lastLevelKey] === 'undefined') {
          //team['totalTime'] = 0 - team['start'];
      } else */if (typeof team[lastLevelKey] === 'number') // adjust total time
        team['currentState'] = 'finished'; // finished team

    });

    console.log(gamedataset);
    console.log(plandataset);

    return {
      gameDataset: gamedataset,
      planDataset: plandataset,
      levels: levels,
      types: types,
      levelsTimePlan: finalLevelsTimePlan,
      time: time / 1000
    };
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an ErrorObservable with a user-facing error message
    // return new ErrorObservable('An error occured while trying to fetch the data.');
  }
}
