import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HurdlingOverviewComponent } from './hurdling-overview.component';

describe('HurdlingOverviewComponent', () => {
    let component: HurdlingOverviewComponent;
    let fixture: ComponentFixture<HurdlingOverviewComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HurdlingOverviewComponent]
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
