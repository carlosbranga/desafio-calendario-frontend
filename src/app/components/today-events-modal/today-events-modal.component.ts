import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-today-events-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './today-events-modal.component.html',
})
export class TodayEventsModalComponent {
  @Input() events: CalendarEvent[] = [];

  constructor(public bsModalRef: BsModalRef) {}

  closeModal(): void {
    this.bsModalRef.hide();
  }
}