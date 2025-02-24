import { Injectable } from '@angular/core';
import { GenericObject } from '../models/generic-object.type';
import { Order } from '../models/order.enum';
import { D3, D3Service } from '@crczp/d3-service';

@Injectable()
export class SortingService {
    private d3: D3;
    private view;
    private levels;

    constructor(d3service: D3Service) {
        this.d3 = d3service.getD3();
    }

    sort(
        trainingdataset: GenericObject[],
        sortReverse: boolean,
        sortType: string,
        sortLevel: number,
        view,
        levels,
    ): GenericObject[] {
        this.view = view;
        this.levels = levels;

        let sortedTrainingdataset: GenericObject[];
        const order = sortReverse ? Order.desc : Order.asc;

        switch (sortType) {
            case 'name':
                sortedTrainingdataset = this.sortByName(trainingdataset, order);
                break;
            case 'time':
                sortedTrainingdataset = this.sortByNumericProperty('totalTime', trainingdataset, order);
                break;
            case 'level':
                sortedTrainingdataset = this.sortByLevelTime(trainingdataset, sortLevel, order);
                break;
            case 'active-level':
                sortedTrainingdataset = this.sortByActiveLevelTime(trainingdataset, sortLevel, order);
                break;
            case 'hints':
                sortedTrainingdataset = this.sortByNumericProperty('hints', trainingdataset, order);
                break;
            case 'score':
                sortedTrainingdataset = this.sortByNumericProperty('score', trainingdataset, order);
                break;
            case 'answers':
                sortedTrainingdataset = this.sortByNumericProperty('answers', trainingdataset, order);
                break;
        }

        return sortedTrainingdataset;
    }

    sortByNumericProperty(property, trainingdataset: GenericObject[], order: Order): GenericObject[] {
        let sorted: GenericObject[] = [];
        if (typeof trainingdataset !== 'undefined') {
            sorted = trainingdataset.slice(0);
            sorted.sort(
                function (teamA: GenericObject, teamB: GenericObject): number {
                    if (order === Order.asc) return this.d3.descending(teamA[property], teamB[property]);
                    else return this.d3.ascending(teamA[property], teamB[property]);
                }.bind(this),
            );
        }
        return sorted;
    }

    sortByLevelTime(trainingdataset: GenericObject[], level: number, order: Order): GenericObject[] {
        let finishedLevel,
            currentlyInLevel,
            notYetInLevel: GenericObject[] = [];
        if (typeof trainingdataset !== 'undefined') {
            finishedLevel = trainingdataset.slice(0).filter((team) => typeof team['level' + level] !== 'undefined');

            currentlyInLevel = trainingdataset
                .slice(0)
                .filter(
                    (team) => typeof team['level' + level] === 'undefined' && team['currentState'] === 'level' + level,
                );

            notYetInLevel = trainingdataset
                .slice(0)
                .filter(
                    (team) => typeof team['level' + level] === 'undefined' && team['currentState'] !== 'level' + level,
                );

            finishedLevel.sort(
                function (teamA: GenericObject, teamB: GenericObject): number {
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
                }.bind(this),
            );
        }

        return notYetInLevel.concat(currentlyInLevel.concat(finishedLevel));
    }

    sortByActiveLevelTime(trainingdataset: GenericObject[], level: number, order: Order): GenericObject[] {
        let finishedLevel,
            currentlyInLevel,
            notYetInLevel: GenericObject[] = [];
        if (typeof trainingdataset !== 'undefined') {
            finishedLevel = trainingdataset.slice(0).filter((team) => typeof team['level' + level] !== 'undefined');

            currentlyInLevel = trainingdataset
                .slice(0)
                .filter(
                    (team) => typeof team['level' + level] === 'undefined' && team['currentState'] === 'level' + level,
                );

            notYetInLevel = trainingdataset
                .slice(0)
                .filter(
                    (team) => typeof team['level' + level] === 'undefined' && team['currentState'] !== 'level' + level,
                );

            currentlyInLevel.sort((a, b) => {
                let suma = 0;

                this.levels.forEach((level) => {
                    const levelTime = a['level' + (level.order + 1)];
                    suma += levelTime ? levelTime : 0;
                });

                let sumb = 0;

                this.levels.forEach((level) => {
                    const levelTime = b['level' + (level.order + 1)];
                    sumb += levelTime ? levelTime : 0;
                });

                return order == Order.asc
                    ? b.totalTime - sumb - (a.totalTime - suma)
                    : a.totalTime - suma - (b.totalTime - sumb);
            });
        }

        return notYetInLevel.concat(currentlyInLevel.concat(finishedLevel));
    }

    sortByName(trainingdataset: GenericObject[], order: Order): GenericObject[] {
        let sorted: GenericObject[] = [];
        if (typeof trainingdataset !== 'undefined') {
            sorted = trainingdataset.slice(0);
            sorted.sort(
                function (teamA: GenericObject, teamB: GenericObject): number {
                    const nameA: string = String(teamA.traineeName).toLowerCase(),
                        nameB: string = String(teamB.traineeName).toLowerCase();
                    const compared: boolean = order === Order.asc ? nameA > nameB : nameA < nameB;
                    return 0 - (compared ? 1 : -1);
                }.bind(this),
            );
        }

        return sorted;
    }
}
