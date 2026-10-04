import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { BookingRefundService } from '../../services/booking-refund.service';
import { IBookingRefund } from '../../interfaces/booking-refund.interface';
import { ltrIsolate } from 'src/app/shared/functions';

@Component({
  selector: 'app-view-refund',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-refund.html',
  styleUrl: './view-refund.scss',
})
export class ViewRefund {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private bookingRefundService = inject(BookingRefundService);

  refundId = signal<string | null>(null);
  refund = signal<IBookingRefund | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          this.refundId.set(id);
          return id;
        }),
        switchMap((idParam) => {
          if (!idParam) {
            return of(null as IBookingRefund | null);
          }
          return this.bookingRefundService.getById(idParam);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.refund.set(data));
  }

  refundPhoneDisplay(r: IBookingRefund): string {
    const raw = `${r.countryCode ?? ''} ${r.phoneNumber ?? ''}`.trim();
    return raw ? ltrIsolate(raw) : '-';
  }

  back() {
    void this.router.navigate(['/refunds/all-refunds']);
  }

  approve() {
    console.log('approve refund', this.refundId());
  }

  reject() {
    console.log('reject refund', this.refundId());
  }
}
