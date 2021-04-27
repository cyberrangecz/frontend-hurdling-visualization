import { Injectable } from '@angular/core';
import { GenericObject } from '../models/generic-object.type';

@Injectable({
  providedIn: 'root'
})
export class FilteringService {
  constructor() {}

  filter(gamedataset: GenericObject[], selectedFilterValue): GenericObject[] {
    let filteredGamedataset: GenericObject[];

    switch (selectedFilterValue) {
      case 1:
        filteredGamedataset = gamedataset;
        break;
      case 2:
        filteredGamedataset = this.filterByFinished(gamedataset, true);
        break;
      case 3:
        filteredGamedataset = this.filterByFinished(gamedataset, false);
        break;
    }

    return filteredGamedataset;
  }

  filterByFinished(
    gamedataset: GenericObject[],
    byFinished: boolean
  ): GenericObject[] {
    let filtered: GenericObject[] = [];
    if (typeof gamedataset !== 'undefined') {
      filtered = gamedataset.filter(function(d: GenericObject): boolean {
        return (d.currentState === 'FINISHED') === byFinished;
      });
    }

    return filtered;
  }
}
