import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { ViewRefund } from './view-refund';
import { BookingRefundService } from '../../services/booking-refund.service';

describe('ViewRefund', () => {
  let component: ViewRefund;
  let fixture: ComponentFixture<ViewRefund>;

  beforeEach(async () => {
    const bookingRefundService = jasmine.createSpyObj('BookingRefundService', ['getById']);
    bookingRefundService.getById.and.returnValue(
      of({
        id: 1,
        refundByName: 'Test',
        reason: null,
        countryCode: '+20',
        phoneNumber: '123',
        refundDate: '2025-11-05T20:53:15.209334',
        bookingDate: '2025-11-04T13:17:42.998039',
        status: 6,
        statusName: 'Cancelled',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ViewRefund, TranslateModule.forRoot()],
      providers: [
        { provide: BookingRefundService, useValue: bookingRefundService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewRefund);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
