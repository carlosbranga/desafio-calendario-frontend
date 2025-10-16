import { Component, ChangeDetectionStrategy, LOCALE_ID, signal, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt);

import { CalendarModule, DateAdapter, CalendarView, CalendarEvent } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';

import { EventService } from '../../services/event.service';
import { EventFormComponent } from '../../components/event-form/event-form.component';
import { Event as ApiEvent } from '../../services/event.service';

import { isSameDay } from 'date-fns'
import { TodayEventsModalComponent } from '../../components/today-events-modal/today-events-modal.component';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CalendarModule,
    ModalModule,
    FormsModule,    
  ],
  template: `
    <div class="container-fluid py-4" style="max-width: 1200px;">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap bg-light p-2 rounded shadow-sm">
        
        <div class="btn-group mb-2 mb-md-0">
          <button class="btn btn-outline-primary" (click)="showTodayEvents()">Hoje</button>
          <button class="btn btn-outline-primary" [class.active]="view === CalendarView.Month" (click)="setView(CalendarView.Month)">Mês</button>
          <button class="btn btn-outline-primary" [class.active]="view === CalendarView.Week" (click)="setView(CalendarView.Week)">Semana</button>
          <button class="btn btn-outline-primary" [class.active]="view === CalendarView.Day" (click)="setView(CalendarView.Day)">Dia</button>
        </div>

        <h3 class="text-center mx-3 flex-grow-1 order-first order-md-0 mb-2 mb-md-0 fw-normal">
          {{ viewDate | calendarDate:(view + 'ViewTitle'):'pt' }}
        </h3>
        
        <div class="btn-group mb-2 mb-md-0">
          <button class="btn btn-primary" (click)="prevPeriod()" aria-label="Período anterior">&lt;</button>
          <button class="btn btn-primary" (click)="nextPeriod()" aria-label="Próximo período">&gt;</button>
        </div>

      </div>

      <div class="shadow-sm rounded overflow-hidden">
        <div [ngSwitch]="view">
          <mwl-calendar-month-view *ngSwitchCase="CalendarView.Month" [viewDate]="viewDate" [events]="events()" [locale]="'pt'" (dayClicked)="handleDayClick($event.day.date)" (eventClicked)="handleEventClick($event.event)"></mwl-calendar-month-view>
          <mwl-calendar-week-view *ngSwitchCase="CalendarView.Week" [viewDate]="viewDate" [events]="events()" [locale]="'pt'" (eventClicked)="handleEventClick($event.event)" (dayHeaderClicked)="handleDayClick($event.day.date)"></mwl-calendar-week-view>
          <mwl-calendar-day-view *ngSwitchCase="CalendarView.Day" [viewDate]="viewDate" [events]="events()" [locale]="'pt'" (eventClicked)="handleEventClick($event.event)"></mwl-calendar-day-view>
        </div>
      </div>
      
      <button class="btn btn-success btn-lg fixed-bottom-right" (click)="createNewEvent()" title="Adicionar Novo Evento">
        &#43;
      </button>
    </div>
  `,
  styles: [`
    :host {
      --cor-primaria: #00f5d4;
      --cor-fundo-pagina: #1a1a1a;
      --cor-componente-fundo: #2a2a2a;
      --cor-borda: #4a4a4a;
      --cor-texto-principal: #ffffffff;
      --cor-texto-secundario: #ffffffff;
      --cor-texto-ativo-escuro: #121212;
      
      --cor-destaque-vermelho: #ef4444;
      --cor-destaque-vermelho-fundo: rgba(239, 68, 68, 0.64);
      --cor-destaque-vermelho-hover: rgba(239, 68, 68, 0.47);

      --raio-borda: 0.6rem;
      font-family: 'Inter', sans-serif;
      background-color: var(--cor-fundo-pagina);
      display: block;
      min-height: 100vh;
    }

    .container-fluid { background-color: var(--cor-fundo-pagina); }
    .d-flex.justify-content-between { background-color: var(--cor-componente-fundo); border: 1px solid var(--cor-borda); border-radius: var(--raio-borda); padding: 0.75rem 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); margin-bottom: 1.5rem !important; }
    h3 { color: #black); font-weight: 600; }
    .btn-group .btn { transition: all 0.2s ease-in-out; border-radius: var(--raio-borda); font-weight: 500; background-color: #00bfa5; border: 1px solid var(--cor-borda); color: var(--cor-texto-principal); }
    .btn-group .btn.active { background-color: var(--cor-primaria); border-color: var(--cor-primaria); color: var(--cor-texto-ativo-escuro); box-shadow: 0 2px 5px rgba(0, 245, 212, 0.3); }
    .btn-group .btn:hover:not(.active) { background-color: rgba(0, 245, 212, 0.15); color: var(--cor-primaria); border-color: var(--cor-primaria); }
    .btn-primary { background-color: var(--cor-primaria); border-color: var(--cor-primaria); color: var(--cor-texto-ativo-escuro); }
    .btn-primary:hover { background-color: #00bfa5; border-color: #00bfa5; }

    :host ::ng-deep .angular-calendar { background-color: var(--cor-componente-fundo); border-radius: var(--raio-borda); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1); border: 1px solid var(--cor-borda); }
    :host ::ng-deep .cal-month-view .cal-header .cal-cell { color: var(--cor-texto-principal); font-weight: 500; background-color: var(--cor-componente-fundo); border-bottom: 1px solid var(--cor-borda); }
    :host ::ng-deep .cal-month-view .cal-day-cell .cal-day-number { color: #ffff; }
    :host ::ng-deep .cal-month-view .cal-day-cell { background-color: var(--cor-componente-fundo); border-color: var(--cor-borda); transition: background-color 0.2s ease-in-out; }
    :host ::ng-deep .cal-month-view .cal-day-cell.cal-weekend .cal-day-number { color: #ffff ; }
    :host ::ng-deep .cal-day-cell.cal-out-month .cal-day-number { color: #ffff ; opacity: 0.5; }
    :host ::ng-deep .cal-event { background-color: var(--cor-primaria); color: var(--cor-texto-ativo-escuro) !important; }

    :host ::ng-deep .cal-month-view .cal-day-cell.cal-today {
      background-color: var(--cor-destaque-vermelho-fundo);
      border: 1px solid var(--cor-destaque-vermelho);
    }

    :host ::ng-deep .cal-month-view .cal-day-cell:hover:not(.cal-today) {
      background-color: var(--cor-destaque-vermelho-hover);
      cursor: pointer;
    }

    .fixed-bottom-right {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 1000;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  padding: 0; 
  font-size: 28px;
  
  background-color: var(--cor-primaria);
  color: var(--cor-texto-ativo-escuro);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  
  display: flex;
  justify-content: center;
  align-items: center; 
}
    .fixed-bottom-right:hover { transform: scale(1.08) translateY(-3px); box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2); }
    @media (max-width: 768px) { .d-flex.justify-content-between { flex-direction: column; align-items: stretch !important; gap: 0.75rem; } h3 { order: -1; } .btn-group { width: 100%; display: flex; justify-content: space-between; } .btn-group .btn { flex-grow: 1; } .fixed-bottom-right { width: 50px; height: 50px; font-size: 24px; bottom: 15px; right: 15px; } }
  `],

  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: DateAdapter, useFactory: adapterFactory },
    BsModalService
  ]
})
export class CalendarViewComponent implements OnInit {

  events = signal<CalendarEvent[]>([]);
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  bsModalRef?: BsModalRef;

  constructor(
    private eventService: EventService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.eventService.getEvents().subscribe(apiEvents => {
      const formattedEvents = apiEvents.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      this.events.set(formattedEvents);
    });
  }
  
  createNewEvent(): void {
    this.bsModalRef = this.modalService.show(EventFormComponent);
    this.bsModalRef.content.onSave.subscribe((newEvent: ApiEvent) => {
      this.eventService.addEvent(newEvent).subscribe(() => {
        this.fetchEvents();
      });
    });
  }

  setView(view: CalendarView): void { this.view = view; }
  
  showTodayEvents(): void {
  const today = new Date();
  
  const todayEvents = this.events().filter(event => isSameDay(event.start, today));

  const initialState = {
    events: todayEvents
  };

  this.modalService.show(TodayEventsModalComponent, { initialState });

  this.viewDate = today; 
}

  prevPeriod(): void {
    const fn = { [CalendarView.Month]: subMonths, [CalendarView.Week]: subWeeks, [CalendarView.Day]: subDays };
    this.viewDate = fn[this.view](this.viewDate, 1);
  }

  nextPeriod(): void {
    const fn = { [CalendarView.Month]: addMonths, [CalendarView.Week]: addWeeks, [CalendarView.Day]: addDays };
    this.viewDate = fn[this.view](this.viewDate, 1);
  }
  
  handleDayClick(date: Date): void {
    console.log('Dia clicado para novo evento:', date);
  }

handleEventClick(clickedEvent: CalendarEvent): void {
  const formatForInput = (date: Date) => {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const initialState = {
    title: 'Editar Evento',
    event: {
      id: Number(clickedEvent.id),
      title: clickedEvent.title,
      start: formatForInput(clickedEvent.start),
      end: clickedEvent.end ? formatForInput(clickedEvent.end) : ''
    }
  };

  this.bsModalRef = this.modalService.show(EventFormComponent, { initialState });

  if (this.bsModalRef && this.bsModalRef.content) {
    this.bsModalRef.content.onSave.subscribe((updatedEvent: ApiEvent) => {
      if (updatedEvent.id) {
        this.eventService.updateEvent(updatedEvent.id, updatedEvent).subscribe(() => {
          this.fetchEvents();
        });
      }
    });

    this.bsModalRef.content.onDelete.subscribe((eventToDelete: ApiEvent) => {
      if (eventToDelete.id) {
        this.eventService.deleteEvent(eventToDelete.id).subscribe(() => {
          this.fetchEvents();
        });
      }
    });
  }
}
}