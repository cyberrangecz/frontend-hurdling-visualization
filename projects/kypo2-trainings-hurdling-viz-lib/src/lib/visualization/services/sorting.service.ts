import { Injectable } from '@angular/core';
import { GenericObject } from '../models/generic-object.type';
import { Order } from '../models/order.enum';
import { D3, D3Service } from '@muni-kypo-crp/d3-service';

@Injectable()
export class SortingService {
  private d3: D3;
  private view;
  private levels;
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
        sortedGamedataset = this.sortByNumericProperty('totalTime', gamedataset, order);
        break;
      case 'level':
        sortedGamedataset = this.sortByLevelTime(gamedataset, sortLevel, order);
        break;
      case 'hints':
        sortedGamedataset = this.sortByNumericProperty('hints', gamedataset, order);
        break;
      case 'score':
        sortedGamedataset = this.sortByNumericProperty('score', gamedataset, order);
        break;
      case 'flags':
        sortedGamedataset = this.sortByNumericProperty('flags', gamedataset, order);
        break;

    }

    return sortedGamedataset;
  }

  sortByNumericProperty(property, gamedataset: GenericObject[], order: Order): GenericObject[] {
    let sorted: GenericObject[] = [];
    if (typeof gamedataset !== 'undefined') {
      sorted = gamedataset.slice(0);
      sorted.sort(
          function(teamA: GenericObject, teamB: GenericObject): number {
            if (order === Order.asc)
              return this.d3.descending(teamA[property], teamB[property]);
            else return this.d3.ascending(teamA[property], teamB[property]);
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
          const nameA: string = String(teamA.playerName).toLowerCase(),
            nameB: string = String(teamB.playerName).toLowerCase();
          const compared: boolean =
            order === Order.asc ? nameA > nameB : nameA < nameB;
          return 0 - (compared ? 1 : -1);
        }.bind(this)
      );
    }

    return sorted;
  }
}
