import { Component, OnInit } from '@angular/core';
import { ProgressView } from '../../../projects/trainings-hurdling-viz-lib/src/public_api';

// import data from '../../../utils/json/mock.json';

@Component({
    selector: 'app-hurdling-overview',
    templateUrl: './hurdling-overview.component.html',
    styleUrls: ['./hurdling-overview.component.css']
})
export class HurdlingOverviewComponent implements OnInit {
    data: JSON;

    constructor() {
    }

    ngOnInit() {
        this.data = undefined;     //disable simulation
        //this.data = data as any; //enable simulation
    }

    protected readonly ProgressView = ProgressView;
}
