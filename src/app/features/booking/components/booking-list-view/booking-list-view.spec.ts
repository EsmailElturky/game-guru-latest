import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingListView } from './booking-list-view';

describe('BookingListView', () => {
  let component: BookingListView;
  let fixture: ComponentFixture<BookingListView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingListView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingListView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
