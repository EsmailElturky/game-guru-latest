import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingRevenue } from './booking-revenue';
import { TranslateModule } from '@ngx-translate/core';

describe('BookingRevenue', () => {
  let component: BookingRevenue;
  let fixture: ComponentFixture<BookingRevenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingRevenue, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingRevenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
