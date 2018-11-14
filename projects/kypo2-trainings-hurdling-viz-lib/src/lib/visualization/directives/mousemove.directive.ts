import { Component, Directive, HostListener, EventEmitter, ElementRef, OnInit, Output } from '@angular/core';
import 'rxjs/Rx';

@Directive({ selector: '[mouseMove]' })
export class MouseMoveDirective {
	drag;
	@Output() mouseUp = new EventEmitter();
	@Output() mouseDown = new EventEmitter();
	@Output() mouseMove = new EventEmitter();

	@Output() mouseDrag = new EventEmitter();

	@HostListener('document:mouseup', ['$event'])
	onMouseUp(event) {
		let pos: any = {
				top: event.clientY - this.element.nativeElement.getBoundingClientRect().top,
				left: event.clientX - this.element.nativeElement.getBoundingClientRect().left
			}
		this.mouseUp.emit(pos);
	}

	@HostListener('mousedown', ['$event'])
	onMouseDown(event) {
		this.mouseDown.emit(event);
		return false;
	}

	@HostListener('document:mousemove', ['$event'])
	onMouseMove(event) {
		this.mouseMove.emit(event);
	}

	constructor(public element: ElementRef) {
		this.element.nativeElement.style.position = 'relative';
		this.element.nativeElement.style.cursor = 'pointer';

		let el = this.element;

		this.drag = this.mouseDown.map(function(event: MouseEvent): any {
			return {
				top: event.clientY - el.nativeElement.getBoundingClientRect().top,
				left: event.clientX - el.nativeElement.getBoundingClientRect().left
			};
		})
		.flatMap(
			offset => this.mouseMove.map(function(pos: MouseEvent): any {
				return {
					top: (pos.clientY - el.nativeElement.getBoundingClientRect().top - offset.top),
					left: (pos.clientX - el.nativeElement.getBoundingClientRect().left - offset.left)
				};
			})
			.takeUntil(this.mouseUp)
		);
	}

	ngOnInit() {
		this.drag.subscribe(
			function(pos: any) {
				this.mouseDrag.emit(pos);
			}.bind(this)
		);
	}
}