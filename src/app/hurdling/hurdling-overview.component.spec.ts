import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HurdlingOverviewComponent } from './hurdling-overview.component';

describe('HurdlingOverviewComponent', () => {
  let component: HurdlingOverviewComponent;
  let fixture: ComponentFixture<HurdlingOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HurdlingOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HurdlingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
