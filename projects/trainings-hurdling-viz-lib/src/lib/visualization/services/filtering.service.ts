import { Injectable } from '@angular/core';
import { GenericObject } from '../models/generic-object.type';

@Injectable({
    providedIn: 'root',
})
export class FilteringService {
    constructor() {}

    filter(trainingDataSet: GenericObject[], selectedFilterValue): GenericObject[] {
        let filteredTrainingDataSet: GenericObject[];

        switch (selectedFilterValue) {
            case 1:
                filteredTrainingDataSet = trainingDataSet;
                break;
            case 2:
                filteredTrainingDataSet = this.filterByFinished(trainingDataSet, true);
                break;
            case 3:
                filteredTrainingDataSet = this.filterByFinished(trainingDataSet, false);
                break;
        }

        return filteredTrainingDataSet;
    }

    filterByFinished(trainingDataSet: GenericObject[], byFinished: boolean): GenericObject[] {
        let filtered: GenericObject[] = [];
        if (typeof trainingDataSet !== 'undefined') {
            filtered = trainingDataSet.filter(function (d: GenericObject): boolean {
                return (d.currentState === 'FINISHED') === byFinished;
            });
        }

        return filtered;
    }
}
