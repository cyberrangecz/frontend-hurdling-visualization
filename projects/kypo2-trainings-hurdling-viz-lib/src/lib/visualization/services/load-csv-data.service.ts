import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { GenericObject } from '../models/generic-object.type';

import { DataEntry } from '../models/data-entry';
import { Event } from '../models/event';
import { Game } from '../models/game';
import { Data } from '../models/data';

@Injectable()
export class LoadCsvDataService {
  private levelsTimePlan: number[];
  private levelTimePlan = 1000;
  private eventTypes: GenericObject = {
    gameStart: 'Game started',
    skip: 'Level cowardly skipped',
    correctFlag: 'Correct flag submited',
    solution: 'Returned from help level'
  };

  constructor(private papa: Papa) {}

  public getGameAndPlanData(
    file: File,
    levelsTimePlan: number[],
    endInPercents: number = 100
  ) {
    this.levelsTimePlan = levelsTimePlan;
    let startTime = 0;
    let index = 0;
    const rawData: DataEntry[] = [];
    const promise: Promise<any> = new Promise(
      function(resolve, reject) {
        const fileTypes: string[] = [
          'text/csv',
          'text/tsv',
          'text/comma-separated-values',
          'application/vnd.ms-excel',
          'application/vnd.msexcel',
          'application/excel',
          'application/csv'
        ];
        if (fileTypes.indexOf(file.type) === -1) {
          reject('It seems that the provided file is not a CSV file.');
        }
        this.papa.parse(file, {
          header: false,
          step: function(row): void {
            const d: string[] = row.data[0],
              datetime: Date = new Date(d[1]),
              timestamp: number = datetime.getTime() / 1000;

            if (d[0] === 'uco' || d.length !== 5) {
              return;
            }

            if (
              index === 0 ||
              (d[4] === 'Game started' &&
                parseInt(d[3]) === 1 &&
                startTime > timestamp)
            ) {
              startTime = timestamp;
            }

            rawData.push({
              team: d[0],
              event: d[4],
              level: parseInt(d[3]),
              time: this.getSeconds(d[2]),
              timestamp: timestamp
            });

            index++;
          }.bind(this),

          complete: function(): void {
            if (rawData.length === 0) {
              // tslint:disable-next-line:max-line-length
              reject(
                'The provided CSV file could not be parsed. Required format: team, absolute time (YYYY-MM-DD HH:mm:ss), elapsed time (HH:mm:ss), level, event.'
              );
            } else {
              const result: any = this.processCSVData(
                rawData,
                startTime,
                endInPercents
              );
              resolve(result);
            }
          }.bind(this)
        });
      }.bind(this)
    );

    return fromPromise(promise);
  }

  private processCSVData(
    rawData: DataEntry[],
    startTime: number,
    endInPercents: number = 100
  ): any {
    const gamedataset: GenericObject[] = [],
      plandataset: GenericObject[] = [],
      // stores levels keys for use in d3.stack, in format "level + index" or "start" for start of the game
      levels: string[] = ['start'],
      // map for keys (team id) to game/plan datasets, because datasets must be arrays to use in d3.stack
      teamsMap: GenericObject = {},
      levelTimePlan = this.levelTimePlan,
      levelsTimePlan = this.levelsTimePlan,
      finalLevelsTimePlan: number[] = [],
      rowCount = rawData.length;
    // to get the highest time as current time
    let time: number = startTime;

    let levelCount: number = Math.max.apply(
      Math,
      rawData.map(function(d) {
        return d.level;
      })
    );
    levelCount = Math.max(4, levelCount);
    for (let l = 1; l <= levelCount; l++) {
      const levelKey = 'level' + l;
      levels.push(levelKey);
    }

    rawData.forEach(
      function(d: DataEntry, index: number): void {
        // eventTime is relative time of event in level
        const eventTime: number = d.time,
          levelKey: string = 'level' + d.level;
        let eventType: string = null,
          // delete possible higher levels from some previous game after game restart
          nextLevel: number = d.level + 1,
          teamIndex = 0,
          levelFinished = false;

        // if the team is not in dataset yet, it is added to game/plan datasets and map
        if (teamsMap[d.team] == null) {
          teamIndex = gamedataset.length;
          teamsMap[d.team] = teamIndex;
          gamedataset[teamIndex] = {};
          gamedataset[teamIndex]['team'] = d.team;
          gamedataset[teamIndex]['events'] = [];
          gamedataset[teamIndex]['totalTime'] = 0;

          plandataset[teamIndex] = {};
          plandataset[teamIndex]['team'] = d.team;
          plandataset[teamIndex]['start'] = 0;
        } else {
          teamIndex = teamsMap[d.team];
        }

        if (((index + 1) / rowCount) * 100 > endInPercents) {
          return;
        }

        // after restart, if there was some data from previous game, delete its events and levels
        if (gamedataset[teamIndex]['level' + nextLevel] !== undefined) {
          // finish of last level from previous game is considered as the start of new game
          const events: any[] = gamedataset[teamIndex]['events'],
            lastEvent: any = events[events.length - 1];
          if (lastEvent !== undefined) {
            const lastEventTime: number = lastEvent.time;
            gamedataset[teamIndex]['start'] = lastEventTime;
            for (let l = 1; l <= levelCount; l++) {
              // tslint:disable-next-line:no-shadowed-variable
              const levelKey = 'level' + l;
              gamedataset[teamIndex][levelKey] = undefined;
            }
          }

          gamedataset[teamIndex]['events'] = [];
        }
        while (
          gamedataset[teamIndex]['level' + nextLevel] !== undefined &&
          nextLevel <= levels.length
        ) {
          delete gamedataset[teamIndex]['level' + nextLevel];
          nextLevel++;
        }

        // add level to levels array, if it does not contain it yet
        if (levels.indexOf(levelKey) === -1) levels.push(levelKey);

        if (time < d.timestamp) time = d.timestamp;

        // according to type of event, add it to events array of the team and/or store the time of level end
        switch (d.event) {
          case this.eventTypes.gameStart:
            // start at 0 time, not added to structure
            eventType = null;
            if (d.level === 1) {
              // if the first level started, save start of game as level 0 end
              gamedataset[teamIndex]['start'] = Math.max(
                0,
                d.timestamp - startTime
              );
            }
            break;
          case this.eventTypes.solution:
            eventType = 'solution';
            break;
          case this.eventTypes.correctFlag:
            eventType = null;
            levelFinished = true;
            // level is finished, save the time
            break;
          case this.eventTypes.skip:
            eventType = 'skip';
            levelFinished = true;
            // level is finished, save the time
            break;
          default:
            if (d.event.substr(0, 4) === 'Hint') eventType = 'hint';
            else eventType = null;
            break;
        }

        if (levelFinished) {
          // level is finished, save the time
          // sometimes there are some events twice with different time, take the bigger
          if (
            typeof gamedataset[teamIndex][levelKey] === 'undefined' ||
            gamedataset[teamIndex][levelKey] < d.time
          ) {
            if (gamedataset[teamIndex][levelKey] < d.time) {
              gamedataset[teamIndex]['totalTime'] -=
                gamedataset[teamIndex][levelKey];
            }
            gamedataset[teamIndex][levelKey] = d.time;
            gamedataset[teamIndex]['totalTime'] += d.time;
          }
        }

        if (eventType != null) {
          const event: any = {
            type: eventType,
            name: d.event,
            time: eventTime,
            levelTime: d.time,
            level: d.level
          };
          gamedataset[teamIndex]['events'].push(event);
        }
      }.bind(this)
    );

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

    // set current level on which is team working now
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
        team['totalTime'] = time - startTime - team['start'];
      // adjust total time
      else if (typeof team[lastLevelKey] === 'number')
        team['currentState'] = 'finished'; // finished team
    });

    return {
      gameDataset: gamedataset,
      planDataset: plandataset,
      levels: levels,
      levelsTimePlan: finalLevelsTimePlan,
      time: time - startTime
    };
  }

  private getSeconds(timeString: string): number {
    const s: string[] = timeString.split(':');

    return +s[0] * 3600 + +s[1] * 60 + +s[2];
  }
}
