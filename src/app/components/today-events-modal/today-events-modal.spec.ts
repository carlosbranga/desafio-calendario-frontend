import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayEventsModal } from './today-events-modal';

describe('TodayEventsModal', () => {
  let component: TodayEventsModal;
  let fixture: ComponentFixture<TodayEventsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayEventsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayEventsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
