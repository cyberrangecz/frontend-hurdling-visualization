import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { TraineeSelectionComponent } from "./trainee-selection.component";

describe("TraineeSelectionComponent", () => {
  let component: TraineeSelectionComponent;
  let fixture: ComponentFixture<TraineeSelectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TraineeSelectionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraineeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
