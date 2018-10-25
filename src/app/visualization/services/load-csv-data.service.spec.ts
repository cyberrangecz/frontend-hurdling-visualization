import { async, TestBed, inject } from '@angular/core/testing';

import { LoadCsvDataService } from './load-csv-data.service';
import { PapaParseService } from 'ngx-papaparse';
import { Data } from '../models/data';

describe('LoadCsvDataService', () => {
  let service: LoadCsvDataService,
    pngFile = new File([""], "picture.png", {type: "image/png"}),
    invalidCsvFile = new File(["a;b;c\n1;2;3"], "data.csv", {type: "text/csv"}),
    csvString = "team11;2011-11-11 11:11:11;00:00:00;1;Game started\n"+
      "team11;2011-11-11 11:12:11;00:01:00;1;Correct flag submited\n"+
      "team11;2011-11-11 11:13:11;00:01:00;2;Correct flag submited\n"+
      "team11;2011-11-11 11:15:11;00:02:00;3;Correct flag submited\n"+
      "team11;2011-11-11 11:16:11;00:01:00;4;Hint 1 taken\n"+
      "team11;2011-11-11 11:17:11;00:02:00;4;Correct flag submited\n",
    validCsvFile = new File([csvString], "data.csv", {type: "text/csv"});

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadCsvDataService, PapaParseService]
    });
    service = TestBed.get(LoadCsvDataService);
  });

  it('should be created', inject([LoadCsvDataService], (service: LoadCsvDataService) => {
    expect(service).toBeTruthy();
  }));

  it('should return error for a non CSV file', async(() => {
      service.getGameAndPlanData(pngFile, []).subscribe(() => {
        fail('no data should be returned for a non CSV file');
      }, (error: string) => {
        expect(error).toEqual('It seems that the provided file is not a CSV file.');
      });
  }));

  it('should return error for a non valid CSV file', async(() => {
      service.getGameAndPlanData(invalidCsvFile, []).subscribe(() => {
        fail('no data should be returned for a non valid CSV file');
      }, (error: string) => {
        expect(error).toEqual('The provided CSV file could not be parsed. Required format: team, absolute time (YYYY-MM-DD HH:mm:ss), elapsed time (HH:mm:ss), level, event.');
      });
  }));

  it('should return game and plan data for a valid CSV file', async(() => {
      service.getGameAndPlanData(validCsvFile, []).subscribe((data: Data) => {
        expect(data.gameDataset).toBeDefined();
        expect(data.planDataset).toBeDefined();
        expect(data.levels).toBeDefined();
        expect(data.levelsTimePlan).toBeDefined();
        expect(data.time).toBeDefined();

        expect(data.gameDataset.length).toEqual(1);
        expect(data.gameDataset[0].team).toEqual('team11');
        expect(data.gameDataset[0].level1).toEqual(60);
        expect(data.gameDataset[0].level3).toEqual(120);
        expect(data.gameDataset[0].totalTime).toEqual(360);
        expect(data.gameDataset[0].currentState).toEqual('finished');
        expect(data.gameDataset[0].events.length).toEqual(1);
        expect(data.gameDataset[0].events[0].level).toEqual(4);
        expect(data.gameDataset[0].events[0].type).toEqual('hint');

        expect(data.levels.length).toEqual(5);
        expect(data.levels[0]).toEqual('start');
        expect(data.levels[4]).toEqual('level4');

        expect(data.levelsTimePlan.length).toEqual(4);

        expect(data.planDataset.length).toEqual(1);
        expect(data.planDataset[0].team).toEqual('team11');

        expect(data.time).toEqual(360);
      }, () => {
        fail('no error should be thrown for a valid CSV file');
      });
  }));
});
