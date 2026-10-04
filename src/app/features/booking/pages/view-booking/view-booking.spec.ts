import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { ViewBooking } from './view-booking';
import { BookingService } from '../../services';

describe('ViewBooking', () => {
  let component: ViewBooking;
  let fixture: ComponentFixture<ViewBooking>;

  beforeEach(async () => {
    const bookingService = jasmine.createSpyObj('BookingService', ['getBookingById']);
    bookingService.getBookingById.and.returnValue(
      of({
        id: 37,
        organizationId: 20,
        fullName: null,
        phoneNumber: null,
        userId: 36,
        sportId: 1,
        sportName: null,
        description: null,
        descriptionAr: null,
        status: 9,
        statusName: 'Ended',
        duration: 30,
        startTime: '2026-04-04T09:00:00',
        endTime: '2026-04-04T09:30:00',
        bookingAmount: 0,
        isPaid: true,
        bookingType: 2,
        bookingTypeName: 'Private',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ViewBooking, TranslateModule.forRoot()],
      providers: [
        { provide: BookingService, useValue: bookingService },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '37' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewBooking);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
