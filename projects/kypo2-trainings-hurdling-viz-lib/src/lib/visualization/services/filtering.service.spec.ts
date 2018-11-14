import { TestBed } from '@angular/core/testing';

import { FilteringService } from './filtering.service';

describe('FilteringService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FilteringService = TestBed.get(FilteringService);
    expect(service).toBeTruthy();
  });
});
