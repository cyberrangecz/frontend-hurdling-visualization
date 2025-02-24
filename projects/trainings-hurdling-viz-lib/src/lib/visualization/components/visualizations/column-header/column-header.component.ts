import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CTF_PROGRESS_CONFIG } from '../../../../app.config';

@Component({
    selector: 'crczp-viz-hurdling-column-header',
    templateUrl: './column-header.component.html',
    styleUrls: ['./column-header.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ColumnHeaderComponent {
    public assetsRoot: string = CTF_PROGRESS_CONFIG.assetsRoot;

    @Input() sortType: string;
    @Input() label: string;
    @Input() selectedSortType: string;
    @Input() selectedSortReverse: boolean;
    @Input() level: any;

    @Output() sortEmitter = new EventEmitter();

    constructor() {}

    sort() {
        const event: any = { sortReverse: !this.selectedSortReverse };
        this.sortEmitter.emit(event);
    }
}
