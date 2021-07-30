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
    trainingDataSet: GenericObject[],
    sortReverse: boolean,
    sortType: string,
    sortLevel: number,
    view,
    levels
  ): GenericObject[] { 
    this.view = view;
    this.levels = levels;

    let order: Order, sortedTrainingDataSet: GenericObject[];
    
    order = sortReverse ? Order.desc : Order.asc;

    switch (sortType) {
      case 'name':
        sortedTrainingDataSet = this.sortByName(trainingDataSet, order);
        break;
      case 'time':
        sortedTrainingDataSet = this.sortByNumericProperty('totalTime', trainingDataSet, order);
        break;
      case 'level':
        sortedTrainingDataSet = this.sortByLevelTime(trainingDataSet, sortLevel, order);
        break;
      case 'active-level':
        sortedTrainingDataSet = this.sortByActiveLevelTime(trainingDataSet, sortLevel, order);
        break;
      case 'hints':
        sortedTrainingDataSet = this.sortByNumericProperty('hints', trainingDataSet, order);
        break;
      case 'score':
        sortedTrainingDataSet = this.sortByNumericProperty('score', trainingDataSet, order);
        break;
      case 'answers':
        sortedTrainingDataSet = this.sortByNumericProperty('answers', trainingDataSet, order);
        break;

    }

    return sortedTrainingDataSet;
  }

  sortByNumericProperty(property, trainingDataSet: GenericObject[], order: Order): GenericObject[] {
    let sorted: GenericObject[] = [];
    if (typeof trainingDataSet !== 'undefined') {
      sorted = trainingDataSet.slice(0);
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
    trainingDataSet: GenericObject[],
    level: number,
    order: Order
  ): GenericObject[] {
    let finishedLevel,
      currentlyInLevel,
      notYetInLevel: GenericObject[] = [];
    if (typeof trainingDataSet !== 'undefined') {
      finishedLevel = trainingDataSet
        .slice(0)
        .filter(team => typeof team['level' + level] !== 'undefined');

      currentlyInLevel = trainingDataSet
        .slice(0)
        .filter(
          team =>
            typeof team['level' + level] === 'undefined' &&
            team['currentState'] === 'level' + level
        );

      notYetInLevel = trainingDataSet
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

  sortByActiveLevelTime(
    trainingDataSet: GenericObject[],
    level: number,
    order: Order
  ): GenericObject[] {
    let finishedLevel,
      currentlyInLevel,
      notYetInLevel: GenericObject[] = [];
    if (typeof trainingDataSet !== 'undefined') {
      finishedLevel = trainingDataSet
        .slice(0)
        .filter(team => typeof team['level' + level] !== 'undefined');

      currentlyInLevel = trainingDataSet
        .slice(0)
        .filter(
          team =>
            typeof team['level' + level] === 'undefined' &&
            team['currentState'] === 'level' + level
        );

      notYetInLevel = trainingDataSet
        .slice(0)
        .filter(
          team =>
            typeof team['level' + level] === 'undefined' &&
            team['currentState'] !== 'level' + level
        );

        currentlyInLevel.sort((a,b) => {
          a.totalTime;

          let suma = 0;
          
          this.levels.forEach((level) => {
            const levelTime = a['level'+(level.order+1)];
              suma += levelTime ? levelTime : 0;
          })

          let sumb = 0;

          this.levels.forEach((level) => {
            const levelTime = b['level'+(level.order+1)];
              sumb += levelTime ? levelTime : 0;
          })

          return  order == Order.asc ? (b.totalTime - sumb) - (a.totalTime - suma) : (a.totalTime - suma) - (b.totalTime - sumb);
        });
    }

    return notYetInLevel.concat(currentlyInLevel.concat(finishedLevel));
  }

  sortByName(trainingDataSet: GenericObject[], order: Order): GenericObject[] {
    let sorted: GenericObject[] = [];
    if (typeof trainingDataSet !== 'undefined') {
      sorted = trainingDataSet.slice(0);
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
