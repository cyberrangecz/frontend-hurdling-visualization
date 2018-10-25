import { async, TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { LoadDataService } from './load-data.service';
import { Data } from '../models/data';

describe('LoadDataService', () => {
  let service: LoadDataService,
    httpMock: HttpTestingController,
    apiUrl: string = "http://api.mock",
    gameId: string = "1",
    levelsTimePlan: Array<number> = [1200, 1500, 1900, 2100, 2200, 2200],
    game: any = {
      "games":[
        {
          "id":1,
          "name":"Capture the flag",
          "levels":[
            {
              "id":1,
              "title":"Level1"
            },
            {
              "id":2,
              "title":"Level2",
            },
            {
              "id":3,
              "title":"Level3",
            },
            {
              "id":4,
              "title":"Level4",
            },
          ]
        }
      ]
    },
    events: any = {
      "events":[
        {
          "game_details":{
            "player_id":11,
            "level":1,
            "logical_time":0
          },
          "type":"cz.muni.csirt.kypo.events.game.GameStarted",
          "timestamp":0
        },
        {
          "game_details":{
            "player_id":11,
            "level":1,
            "logical_time":60
          },
          "type":"cz.muni.csirt.kypo.events.game.CorrectFlagSubmitted",
          "timestamp":60
        },
        {
          "game_details":{
            "player_id":11,
            "level":2,
            "logical_time":60
          },
          "type":"cz.muni.csirt.kypo.events.game.CorrectFlagSubmitted",
          "timestamp":120
        },
        {
          "game_details":{
            "player_id":11,
            "level":3,
            "logical_time":120
          },
          "type":"cz.muni.csirt.kypo.events.game.CorrectFlagSubmitted",
          "timestamp":240
        },
        {
          "hint_id":1,
          "game_details":{
            "player_id":11,
            "level":4,
            "logical_time":60
          },
          "type":"cz.muni.csirt.kypo.events.game.HintTaken",
          "timestamp":300
        },
        {
          "game_details":{
            "player_id":11,
            "level":4,
            "logical_time":120
          },
          "type":"cz.muni.csirt.kypo.events.game.GameFinished",
          "timestamp":360
        },
      ]
    };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoadDataService]
    });
    service = TestBed.get(LoadDataService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', inject([LoadDataService], (service: LoadDataService) => {
    expect(service).toBeTruthy();
  }));

  it('should fire two requests', async(() => {
    service.getGameAndPlanData(apiUrl, gameId, levelsTimePlan).subscribe();
    let req1 = httpMock.expectOne(apiUrl+"/games/"+gameId);
    let req2 = httpMock.expectOne(apiUrl+"/games/"+gameId+"/events");
    req1.flush(game);
    req2.flush(events);
  }));

  it('should handle errors', async(() => {
    service.getGameAndPlanData(apiUrl, gameId, levelsTimePlan).subscribe(() => {
      fail('no data should be returned when a request failed');
    }, (error: string) => {
      expect(error).toEqual('An error occured while trying to fetch the data.');
    });
    let req1 = httpMock.expectOne(apiUrl+"/games/"+gameId);
    let req2 = httpMock.expectOne(apiUrl+"/games/"+gameId+"/events");
    req1.flush(game);
    req2.error(new ErrorEvent('timeout'));
  }));

  it('should return game and plan data for successful requests', async(() => {
    service.getGameAndPlanData(apiUrl, gameId, levelsTimePlan).subscribe((data: Data) => {
      expect(data.gameDataset).toBeDefined();
      expect(data.planDataset).toBeDefined();
      expect(data.levels).toBeDefined();
      expect(data.levelsTimePlan).toBeDefined();
      expect(data.time).toBeDefined();

      expect(data.gameDataset.length).toEqual(1);
      expect(data.gameDataset[0].team).toEqual(11);
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
      for(let i = 0; i < data.levelsTimePlan.length; i++) {
        expect(data.levelsTimePlan[i]).toEqual(levelsTimePlan[i]);
      }

      expect(data.planDataset.length).toEqual(1);
      expect(data.planDataset[0].team).toEqual(11);

      expect(data.time).toEqual(360);
    }, (error: string) => {
      fail('no error should be thrown for successful requests');
    });
    let req1 = httpMock.expectOne(apiUrl+"/games/"+gameId);
    let req2 = httpMock.expectOne(apiUrl+"/games/"+gameId+"/events");
    req1.flush(game);
    req2.flush(events);
  }));
});
