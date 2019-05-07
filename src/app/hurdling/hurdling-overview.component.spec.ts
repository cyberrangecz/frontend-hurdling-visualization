import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizationOverviewComponent } from './visualization-overview.component';

describe('VisualizationOverviewComponent', () => {
  let component: VisualizationOverviewComponent;
  let fixture: ComponentFixture<VisualizationOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizationOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizationOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
