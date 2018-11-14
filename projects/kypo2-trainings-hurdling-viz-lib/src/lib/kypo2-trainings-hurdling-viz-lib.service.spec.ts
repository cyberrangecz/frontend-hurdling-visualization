import { TestBed } from '@angular/core/testing';

import { Kypo2TrainingsHurdlingVizLibService } from './kypo2-trainings-hurdling-viz-lib.service';

describe('Kypo2TrainingsHurdlingVizLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Kypo2TrainingsHurdlingVizLibService = TestBed.get(Kypo2TrainingsHurdlingVizLibService);
    expect(service).toBeTruthy();
  });
});
