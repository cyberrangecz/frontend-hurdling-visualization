import { Injectable } from '@angular/core';
import { GenericObject } from '../models/generic-object.type';
import { Order } from '../models/order.enum';
import { View } from '../models/view.enum';
import { D3, D3Service } from './d3.service';

@Injectable()
export class SortingService {
  private d3: D3;
  private view;
  private levels;
  private time: number;
  private lastLevelIndex: number;
  constructor(d3service: D3Service) {
    this.d3 = d3service.getD3();
  }

  sort(
    gamedataset: GenericObject[],
    sortReverse: boolean,
    sortType: string,
    sortLevel: number,
    view,
    levels
  ): GenericObject[] {
    this.view = view;
    this.levels = levels;

    let order: Order, sortedGamedataset: GenericObject[];

    order = sortReverse ? Order.desc : Order.asc;

    switch (sortType) {
      case 'name':
        sortedGamedataset = this.sortByName(gamedataset, order);
        break;
      case 'time':
        sortedGamedataset = this.sortByTime(gamedataset, order);
        break;
      case 'level':
        sortedGamedataset = this.sortByLevelTime(gamedataset, sortLevel, order);
        break;
    }

    return sortedGamedataset;
  }

  sortByTime(gamedataset: GenericObject[], order: Order): GenericObject[] {
    let sorted: GenericObject[] = [];
    if (typeof gamedataset !== 'undefined') {
      sorted = gamedataset.slice(0);
      sorted.sort(
        function(teamA: GenericObject, teamB: GenericObject): number {
          if (order === Order.asc)
            return this.d3.descending(teamA.totalTime, teamB.totalTime);
          else return this.d3.ascending(teamA.totalTime, teamB.totalTime);
        }.bind(this)
      );
    }
    return sorted;
  }

  sortByLevelTime(
    gamedataset: GenericObject[],
    level: number,
    order: Order
  ): GenericObject[] {
    let finishedLevel,
      currentlyInLevel,
      notYetInLevel: GenericObject[] = [];
    if (typeof gamedataset !== 'undefined') {
      finishedLevel = gamedataset
        .slice(0)
        .filter(team => typeof team['level' + level] !== 'undefined');

      currentlyInLevel = gamedataset
        .slice(0)
        .filter(
          team =>
            typeof team['level' + level] === 'undefined' &&
            team['currentState'] === 'level' + level
        );

      notYetInLevel = gamedataset
        .slice(0)
        .filter(
          team =>
            typeof team['level' + level] === 'undefined' &&
            team['currentState'] !== 'level' + level
        );

      finishedLevel.sort(
        function(teamA: GenericObject, teamB: GenericObject): number {
          let timeA, timeB: number;
          if (typeof teamA['level' + level] !== 'undefined') {
            timeA = teamA['level' + level];
          } else {
            timeA = teamA.totalTime;
          }
          if (typeof teamB['level' + level] !== 'undefined') {
            timeB = teamB['level' + level];
          } else {
            timeB = teamB.totalTime;
          }
          if (order === Order.asc) return this.d3.descending(timeA, timeB);
          else return this.d3.ascending(timeA, timeB);
        }.bind(this)
      );
    }

    return notYetInLevel.concat(currentlyInLevel.concat(finishedLevel));
  }

  sortByName(gamedataset: GenericObject[], order: Order): GenericObject[] {
    let sorted: GenericObject[] = [];
    if (typeof gamedataset !== 'undefined') {
      sorted = gamedataset.slice(0);
      sorted.sort(
        function(teamA: GenericObject, teamB: GenericObject): number {
          const nameA: string = String(teamA.team).toLowerCase(),
            nameB: string = String(teamB.team).toLowerCase();
          const compared: boolean =
            order === Order.asc ? nameA > nameB : nameA < nameB;
          return 0 - (compared ? 1 : -1);
        }.bind(this)
      );
    }

    return sorted;
  }
}
