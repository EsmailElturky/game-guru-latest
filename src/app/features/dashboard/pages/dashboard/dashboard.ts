import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectButtonComponent } from '@EsmailElturky/ui-kit';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { Auth } from 'src/app/features/auth/services/auth';
import { transformDate } from 'src/app/shared/functions';
import { DashboardService } from '../../services';
import { IDashboardResponse } from '../../interfaces';

export type DashboardPeriod = 'daily' | 'weekly' | 'monthly';

export interface MetricCard {
  value: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, SelectButtonComponent, ChartModule, CardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(Auth);
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  userName = computed(() => this.auth.userData()?.fullName ?? '');
  period = signal<DashboardPeriod>('monthly');
  loading = signal(false);

  periodOptions = computed(() => [
    { label: this.translate.instant('dashboard.daily'), value: 'daily' as const },
    { label: this.translate.instant('dashboard.weekly'), value: 'weekly' as const },
    { label: this.translate.instant('dashboard.monthly'), value: 'monthly' as const },
  ]);

  dataPeriodLabel = computed(() => {
    const { dateFrom, dateTo } = this.getDateRange(this.period());
    if (!dateFrom && !dateTo) {
      return '';
    }
    if (dateFrom === dateTo) {
      return dateFrom;
    }
    return `${dateFrom} - ${dateTo}`;
  });

  metrics = signal<MetricCard[]>([]);

  bookingsChartData = signal({
    labels: [] as string[],
    datasets: [
      {
        label: 'Bookings',
        data: [] as number[],
        backgroundColor: ['#3B82F6', '#14B8A6', '#64748B'],
        borderColor: ['#3B82F6', '#14B8A6', '#64748B'],
        borderWidth: 0,
      },
    ],
  });

  bookingsChartOptions = signal({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: number }) => String(ctx.raw),
        },
      },
    },
    scales: {
      x: { display: false },
      y: {
        grid: { display: false },
        ticks: {
          font: { size: 12 },
          callback: function (_: unknown, i: number, arr: { label: string }[]) {
            return arr[i].label;
          },
        },
      },
    },
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  onPeriodChange(value: DashboardPeriod) {
    this.period.set(value);
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const { dateFrom, dateTo } = this.getDateRange(this.period());
    this.loading.set(true);

    this.dashboardService
      .getDashboard({ dateFrom, dateTo })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.applyDashboardData(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private applyDashboardData(data: IDashboardResponse): void {
    const cards = data.cards;
    this.metrics.set([
      {
        value: String(cards.totalUsersLoggedIn ?? 0),
        labelKey: 'dashboard.totalUsersLoggedIn',
        icon: 'pi pi-user',
      },
      {
        value: String(cards.totalActiveOrganizations ?? 0),
        labelKey: 'dashboard.totalActiveOrganizations',
        icon: 'pi pi-building',
      },
      {
        value: String(cards.totalNewRequests ?? 0),
        labelKey: 'dashboard.totalNewRequests',
        icon: 'pi pi-inbox',
      },
      {
        value: String(cards.totalBookings ?? 0),
        labelKey: 'dashboard.totalBookings',
        icon: 'pi pi-calendar',
      },
      {
        value: String(cards.totalUpcomingBookings ?? 0),
        labelKey: 'dashboard.totalUpcomingBookings',
        icon: 'pi pi-clock',
      },
      {
        value: String(cards.totalCancelledBookings ?? 0),
        labelKey: 'dashboard.totalCancelledBookings',
        icon: 'pi pi-times-circle',
      },
      {
        value: this.formatAmount(cards.totalCompletedBookingAmount),
        labelKey: 'dashboard.totalCompletedBookingAmount',
        icon: 'pi pi-wallet',
      },
      {
        value: this.formatAmount(cards.totalMonthlyFixedAmount),
        labelKey: 'dashboard.totalMonthlyFixedAmount',
        icon: 'pi pi-money-bill',
      },
      {
        value: this.formatAmount(cards.totalYearlyFixedAmount),
        labelKey: 'dashboard.totalYearlyFixedAmount',
        icon: 'pi pi-chart-line',
      },
      {
        value: `${cards.totalMonthlyFixedPercentage ?? 0}%`,
        labelKey: 'dashboard.totalMonthlyFixedPercentage',
        icon: 'pi pi-percentage',
      },
      {
        value: `${cards.totalYearlyFixedPercentage ?? 0}%`,
        labelKey: 'dashboard.totalYearlyFixedPercentage',
        icon: 'pi pi-percentage',
      },
    ]);

    const analytics = data.bookingAnalytics;
    this.bookingsChartData.set({
      labels: [
        this.translate.instant('dashboard.upcoming'),
        this.translate.instant('dashboard.completed'),
        this.translate.instant('dashboard.canceled'),
      ],
      datasets: [
        {
          label: this.translate.instant('dashboard.bookings'),
          data: [
            analytics.totalUpcomingBookings ?? 0,
            analytics.totalCompletedBookings ?? 0,
            analytics.totalCancelledBookings ?? 0,
          ],
          backgroundColor: ['#3B82F6', '#14B8A6', '#64748B'],
          borderColor: ['#3B82F6', '#14B8A6', '#64748B'],
          borderWidth: 0,
        },
      ],
    });
  }

  private getDateRange(period: DashboardPeriod): { dateFrom: string; dateTo: string } {
    const now = new Date();
    const dateTo = transformDate(now.toISOString());
    let from = new Date(now);

    if (period === 'weekly') {
      from.setDate(from.getDate() - 6);
    } else if (period === 'monthly') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      dateFrom: transformDate(from.toISOString()),
      dateTo,
    };
  }

  private formatAmount(value: number | undefined): string {
    return (value ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
}
