/* tslint:disable:no-unused-variable */

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { PlayerSelectionService } from './player-selection.service';

describe('Service: PlayerSelection', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlayerSelectionService]
    });
  });

  it('should ...', inject([PlayerSelectionService], (service: PlayerSelectionService) => {
    expect(service).toBeTruthy();
  }));
});
