import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ColumnHeaderComponent implements OnInit {

	public assetsRoot: string = environment.assetsRoot;

	@Input() sortType: string;
	@Input() label: string;
	@Input() selectedSortType: string;
	@Input() selectedSortReverse: boolean;
	@Input() level: any;

	@Output() onSort = new EventEmitter();

	constructor() { }

	ngOnInit() {
	}

	sort() {
		const event: any = { 'sortReverse': !this.selectedSortReverse };
		this.onSort.emit(event);
	}
}
