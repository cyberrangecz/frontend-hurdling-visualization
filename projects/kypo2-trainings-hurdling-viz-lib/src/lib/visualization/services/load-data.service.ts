import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable ,  forkJoin } from 'rxjs';
import { GenericObject } from '../models/generic-object.type';
import { Event } from '../models/event';
import { Game } from '../models/game';
import { Data } from '../models/data';

@Injectable()
export class LoadDataService {
  private httpClient: HttpClient;
  private levelsTimePlan: number[];
  private levelTimePlan = 1000;
  private levelTypePrefix = 'cz.muni.csirt.kypo.events.game.';
  private eventTypes: GenericObject = {
    gameStart: this.levelTypePrefix + 'GameStarted',
    gameFinished: this.levelTypePrefix + 'GameFinished',
    gameExited: this.levelTypePrefix + 'GameExited',
    hint: this.levelTypePrefix + 'HintTaken',
    skip: this.levelTypePrefix + 'LevelSkipped',
    wrongFlag: this.levelTypePrefix + 'WrongFlagSubmitted',
    correctFlag: this.levelTypePrefix + 'CorrectFlagSubmitted',
    solution: this.levelTypePrefix + 'SolutionDisplayed'
  };

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  public getGameAndPlanData(
    apiUrl: string,
    gameId: string,
    levelsTimePlan: number[]
  ) {
    this.levelsTimePlan = levelsTimePlan;
    const gameUrl: string = apiUrl + '/games/' + gameId,
      gameEventsUrl: string = gameUrl + '/events';

    return forkJoin([
      this.loadData<Game>(gameUrl),
      this.loadData<Event>(gameEventsUrl)
    ]).pipe(map(
      (data: any[]): Data => {
        const games: Game[] = data[0].games;
        let game: Game;
        games.forEach(function(el: Game) {
          if (+el.id === +gameId) {
            game = el;
          }
        });
        const events: Event[] = data[1].events;

        const result: Data = this.processData(game, events);
        return result;
      }
    ));
  }

  private loadData<T>(url: string, params?: any): Observable<any> {
    if (typeof params !== 'undefined') {
      return this.httpClient.get<T[]>(url, params); // .pipe(catchError(this.handleError));
    } else {
      return this.httpClient.get<T[]>(url); // .pipe(catchError(this.handleError));
    }
  }

  private processData(game, events): Data {
    const gamedataset: GenericObject[] = [],
      plandataset: GenericObject[] = [],
      // stores levels keys for use in d3.stack, in format "level + index" or "start" for start of the game
      levels: string[] = ['start'],
      // to get the highest time as current time
      // map for keys (team id) to game/plan datasets, because datasets must be arrays to use in d3.stack
      teamsMap: GenericObject = {},
      levelTimePlan: number = this.levelTimePlan,
      levelsTimePlan: number[] = this.levelsTimePlan,
      finalLevelsTimePlan: number[] = [];

      let gameStartTimestamp = 0,
      currentTimestamp = 0,
      time = 0;

    if (events.length) {
      gameStartTimestamp = events[0].timestamp;
      currentTimestamp = events[0].timestamp;
    }

    const levelCount: number = game.levels.length;
    for (let l = 1; l <= levelCount; l++) {
      const levelKey = 'level' + l;
      levels.push(levelKey);
    }

    events.forEach(
      function(event: Event): void {
        // eventTime is relative time of event in level
        const eventTime: number = event.game_details.logical_time,
          eventTeam: string = event.game_details.player_id,
          level: number = event.game_details.level,
          levelKey: string = 'level' + level;
        let eventType: string = event.type,
          eventName: string = event.type,
          teamIndex = 0,
          levelFinished = false;

        // if the team is not in dataset yet, it is added to game/plan datasets and map
        if (teamsMap[eventTeam] == null) {
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
    );

    time = currentTimestamp - gameStartTimestamp;

    // create final timeplan for levels
    let levelIndex = 0;
    levels.forEach(function(level): void {
      let timePlan: number = levelsTimePlan[levelIndex]
        ? levelsTimePlan[levelIndex]
        : levelTimePlan;
      if (level === 'start') timePlan = 0;
      else {
        levelIndex++;
        finalLevelsTimePlan.push(timePlan);
      }
    });
    // create dataset for plan
    plandataset.forEach(function(team: GenericObject): void {
      let levelIndex = 0;
      levels.forEach(function(level): void {
        const timePlan: number = levelsTimePlan[levelIndex]
          ? levelsTimePlan[levelIndex]
          : levelTimePlan;
        team[level] = level !== 'start' ? timePlan : 0;
        if (level !== 'start') levelIndex++;
      });
    });

    // set current level on which is team now working
    // mark finished teams and if team doesn't finished yet, adjust total time
    gamedataset.forEach(function(team: GenericObject): void {
      // sort events
      if (Array.isArray(team.events)) {
        team.events.sort(function(a, b) {
          if (a.level !== b.level) {
            return a.level - b.level;
          } else {
            return a.time - b.time;
          }
        });
      }
      // team start is now as a timestamp, subtract the game start timestamp to get it in seconds
      team['start'] =
        typeof team['start'] !== 'undefined'
          ? team['start'] - gameStartTimestamp
          : 0;
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
      if (typeof team[lastLevelKey] === 'undefined')
        team['totalTime'] = time - team['start'];
      // adjust total time
      else if (typeof team[lastLevelKey] === 'number')
        team['currentState'] = 'finished'; // finished team
    });

    console.log(gamedataset);

    return {
      gameDataset: gamedataset,
      planDataset: plandataset,
      levels: levels,
      levelsTimePlan: finalLevelsTimePlan,
      time: time
    };
  }

  private getSeconds(timeString: string): number {
    const s: string[] = timeString.split(':');

    return +s[0] * 3600 + +s[1] * 60 + +s[2];
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
