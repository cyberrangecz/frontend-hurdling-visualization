import { Component, OnInit } from '@angular/core';
import data from '../../assets/mock.json';

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
    this.data = data as any;
  }
}
