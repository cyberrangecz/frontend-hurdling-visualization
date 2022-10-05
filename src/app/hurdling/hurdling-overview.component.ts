import { Component, OnInit } from '@angular/core';
import data from '../../../utils/json/mock.json';
import {BehaviorSubject, Observable} from 'rxjs';

@Component({
  selector: 'app-hurdling-overview',
  templateUrl: './hurdling-overview.component.html',
  styleUrls: ['./hurdling-overview.component.css']
})
export class HurdlingOverviewComponent implements OnInit {
  title = 'app';
  data:JSON;

  constructor() { }

  ngOnInit() {
    this.data = undefined;     //disable simulation
    //this.data = data as any; //enable simulation
  }
}
