import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { CTF_PROGRESS_CONFIG } from '../../../../app.config';

@Component({
  selector: 'kypo-viz-hurdling-column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ColumnHeaderComponent implements OnInit {

	public assetsRoot: string = CTF_PROGRESS_CONFIG.assetsRoot;

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
