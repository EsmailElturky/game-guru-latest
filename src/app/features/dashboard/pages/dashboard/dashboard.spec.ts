import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Dashboard } from './dashboard';
import { DashboardService } from '../../services';
import { Auth } from 'src/app/features/auth/services/auth';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard, TranslateModule.forRoot()],
      providers: [
        {
          provide: Auth,
          useValue: {
            userData: () => ({ fullName: 'Test User' }),
            isAdminApp: () => true,
          },
        },
        {
          provide: DashboardService,
          useValue: {
            getDashboard: () =>
              of({
                cards: {
                  totalUsersLoggedIn: 0,
                  totalActiveOrganizations: 0,
                  totalNewRequests: 0,
                  totalBookings: 0,
                  totalUpcomingBookings: 0,
                  totalCancelledBookings: 0,
                  totalCompletedBookingAmount: 0,
                  totalMonthlyFixedAmount: 0,
                  totalYearlyFixedAmount: 0,
                  totalMonthlyFixedPercentage: 0,
                  totalYearlyFixedPercentage: 0,
                },
                bookingAnalytics: {
                  totalUpcomingBookings: 0,
                  totalCompletedBookings: 0,
                  totalCancelledBookings: 0,
                },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
