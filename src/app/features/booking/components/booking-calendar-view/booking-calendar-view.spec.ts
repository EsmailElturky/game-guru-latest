import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCalendarView } from './booking-calendar-view';

describe('BookingCalendarView', () => {
  let component: BookingCalendarView;
  let fixture: ComponentFixture<BookingCalendarView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCalendarView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCalendarView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
