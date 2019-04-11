import { Injectable } from '@angular/core';
import { GenericObject } from '../models/generic-object.type';
import { Order } from '../models/order.enum';
import { View } from '../models/view.enum';
import { D3, D3Service } from 'd3-ng2-service';

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
    let sorted: GenericObject[] = [];
    if (typeof gamedataset !== 'undefined') {
      sorted = gamedataset.slice(0);
      sorted.sort(
        function(teamA: GenericObject, teamB: GenericObject): number {
          let timeA: number = teamA['level' + level],
            timeB: number = teamB['level' + level];
          const lastLevelIndex: number =
            this.lastLevelIndex === 2 ? level - 1 : level;
          if (teamA['currentState'] === 'level' + level) {
            timeA = this.time;
            this.levels.forEach(
              function(l: number, i: number): void {
                if (i + 1 < lastLevelIndex) timeA -= teamA[l];
              }.bind(this)
            );
            if (
              this.view === View.overview &&
              typeof teamA['start'] !== 'undefined'
            )
              timeA -= teamA['start'];
          } else if (typeof teamA['level' + level] === 'undefined') {
            timeA = this.time;
          }

          if (teamB['currentState'] === 'level' + level) {
            timeB = this.time;
            this.levels.forEach(
              function(l: number, i: number): void {
                if (i + 1 < lastLevelIndex) timeB -= teamB[l];
              }.bind(this)
            );
            if (
              this.view === View.overview &&
              typeof teamB['start'] !== 'undefined'
            )
              timeB -= teamB['start'];
          } else if (typeof teamB['level' + level] === 'undefined') {
            timeB = this.time;
          }
          if (order === Order.asc) return this.d3.descending(timeA, timeB);
          else return this.d3.ascending(timeA, timeB);
        }.bind(this)
      );
    }

    return sorted;
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
