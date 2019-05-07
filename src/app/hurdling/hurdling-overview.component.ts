import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hurdling-overview',
  templateUrl: './hurdling-overview.component.html',
  styleUrls: ['./hurdling-overview.component.css']
})
export class HurdlingOverviewComponent implements OnInit {
  title = 'app';
  hideCSVUpload = false;

  constructor() { }

  ngOnInit() {
  }

}
