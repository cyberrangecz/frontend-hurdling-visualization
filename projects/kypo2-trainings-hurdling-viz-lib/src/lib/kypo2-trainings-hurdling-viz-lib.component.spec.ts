import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Kypo2TrainingsHurdlingVizLibComponent } from './kypo2-trainings-hurdling-viz-lib.component';

describe('Kypo2TrainingsHurdlingVizLibComponent', () => {
  let component: Kypo2TrainingsHurdlingVizLibComponent;
  let fixture: ComponentFixture<Kypo2TrainingsHurdlingVizLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Kypo2TrainingsHurdlingVizLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Kypo2TrainingsHurdlingVizLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
