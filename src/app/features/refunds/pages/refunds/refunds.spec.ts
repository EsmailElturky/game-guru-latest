import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Refunds } from './refunds';
import { TranslateModule } from '@ngx-translate/core';
import { BookingRefundService } from '../../services/booking-refund.service';

describe('Refunds', () => {
  let component: Refunds;
  let fixture: ComponentFixture<Refunds>;

  beforeEach(async () => {
    const bookingRefundService = jasmine.createSpyObj('BookingRefundService', ['getAll']);
    bookingRefundService.getAll.and.returnValue(
      of({
        items: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [Refunds, TranslateModule.forRoot()],
      providers: [{ provide: BookingRefundService, useValue: bookingRefundService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Refunds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
