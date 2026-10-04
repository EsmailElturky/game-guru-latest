import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { PromoCodeService } from '../../services/promo-code.service';
import { IPromoCode } from '../../interfaces/promo-code.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-promo-code',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-promo-code.html',
  styleUrl: './view-promo-code.scss',
})
export class ViewPromoCode {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private promoCodeService = inject(PromoCodeService);

  promoId = signal<string | null>(null);
  promo = signal<IPromoCode | null>(null);

  imageUrl = computed(() => {
    const name = this.promo()?.imageName;
    return name ? `${environment.imageApi}/${name}` : null;
  });

  startDateDisplay = computed(() => {
    const d = this.promo()?.startDate;
    return d ? new Date(d).toLocaleString() : '-';
  });

  endDateDisplay = computed(() => {
    const d = this.promo()?.endDate;
    return d ? new Date(d).toLocaleString() : '-';
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          this.promoId.set(id);
          return id;
        }),
        switchMap((id) => {
          if (!id) {
            return of(null as IPromoCode | null);
          }
          return this.promoCodeService.getById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.promo.set(data));
  }

  back() {
    void this.router.navigate(['/promo-codes']);
  }

  goEdit() {
    const id = this.promoId();
    if (id) {
      void this.router.navigate(['/promo-codes/edit-promo-code', id]);
    }
  }
}
