import { TestBed, waitForAsync } from '@angular/core/testing';

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppConfig, CTF_PROGRESS_CONFIG } from './app.config';
import { D3Service } from 'd3-ng2-service';
import { LoadDataService } from './visualization/services/load-data.service';
import { LoadCsvDataService } from './visualization/services/load-csv-data.service';
import { PapaParseModule } from 'ngx-papaparse';
import { GameAnalysisComponent } from './visualization/components/game-analysis/game-analysis.component';
import { MouseWheelDirective } from './visualization/directives/mousewheel.directive';
import { MouseMoveDirective } from './visualization/directives/mousemove.directive';
import { ColumnHeaderComponent } from './visualization/components/column-header/column-header.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        GameAnalysisComponent,
        MouseWheelDirective,
        MouseMoveDirective,
        ColumnHeaderComponent
      ],
      imports: [
        FormsModule,
        HttpClientModule,
        PapaParseModule
      ],
      providers: [
        D3Service,
        LoadDataService,
        LoadCsvDataService,
        { provide: AppConfig, useValue: CTF_PROGRESS_CONFIG }
      ]
    }).compileComponents();
  }));

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
