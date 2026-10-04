import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSlots } from './booking-slots';

describe('BookingSlots', () => {
  let component: BookingSlots;
  let fixture: ComponentFixture<BookingSlots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSlots]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingSlots);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
