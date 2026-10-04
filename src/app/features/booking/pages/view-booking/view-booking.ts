import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { IBookingDetail } from '../../interfaces';
import { BookingService } from '../../services';
import { TranslationService } from 'src/app/core/services';
import { ltrIsolate } from 'src/app/shared/functions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-booking',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-booking.html',
  styleUrl: './view-booking.scss',
})
export class ViewBooking {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private bookingService = inject(BookingService);
  private translationService = inject(TranslationService);

  readonly isArabic = computed(() => this.translationService.currentLang() === 'ar');

  id = signal<number | null>(null);
  routeParams = toSignal(this.route.paramMap);
  bookingData = signal<IBookingDetail | null>(null);

  constructor() {
    effect(() => {
      const idParam = this.routeParams()?.get('id');
      const parsed = idParam != null && idParam !== '' ? Number(idParam) : null;
      this.id.set(Number.isFinite(parsed as number) ? (parsed as number) : null);

      if (this.id()) {
        this.getBooking();
      }
    });
  }

  getBooking() {
    const bookingId = this.id();
    if (bookingId == null) {
      return;
    }
    this.bookingService
      .getBookingById(bookingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((booking) => {
        this.bookingData.set(booking);
      });
  }

  imageUrl(thumbnail: string | null | undefined): string | null {
    if (!thumbnail?.trim()) return null;
    return `${environment.imageApi}/${thumbnail}`;
  }

  displayOrDash(value: string | number | null | undefined): string {
    if (value == null) return '—';
    const v = String(value).trim();
    return v ? v : '—';
  }

  phoneLine(b: IBookingDetail): string {
    const parts = [b.countryCode, b.phoneNumber].filter(
      (p) => p != null && String(p).trim() !== '',
    );
    if (!parts.length) return '—';
    return ltrIsolate(parts.join(' '));
  }

  hasCoach(b: IBookingDetail): boolean {
    return Boolean(b.coachName?.trim());
  }

  bookingDescription(b: IBookingDetail): string {
    return this.isArabic()
      ? this.displayOrDash(b.descriptionAr)
      : this.displayOrDash(b.description);
  }

  formatMoney(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return `${value} ${this.translationService.instant('booking.currency')}`;
  }

  commentText(comment: { text?: string; comment?: string }): string {
    return comment.text?.trim() || comment.comment?.trim() || '—';
  }

  backToList() {
    this.router.navigate(['/booking']);
  }
}
