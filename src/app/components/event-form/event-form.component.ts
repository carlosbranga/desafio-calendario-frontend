import { Component, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Event } from '../../services/event.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent {
  title?: string; 
  
  event: Event = {
    title: '',
    start: '',
    end: ''
  };

  public onSave = new EventEmitter<Event>();
  public onDelete = new EventEmitter<Event>(); 

  constructor(public bsModalRef: BsModalRef) {}

  saveEvent(): void {
    this.onSave.emit(this.event);
    this.bsModalRef.hide();
  }

  deleteEvent(): void {
    this.onDelete.emit(this.event);
    this.bsModalRef.hide();
  }

  closeModal(): void {
    this.bsModalRef.hide();
  }
}