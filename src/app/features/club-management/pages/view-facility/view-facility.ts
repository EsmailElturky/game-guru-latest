import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { environment } from 'src/environments/environment';
import { TranslationService } from 'src/app/core/services';
import { OrganizationFacilityService } from 'src/app/features/profile/services/organization-facility.service';
import { IOrganizationFacilityDetail } from 'src/app/features/profile/interfaces/organization-facility.interface';

@Component({
  selector: 'app-view-facility',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-facility.html',
  styleUrl: './view-facility.scss',
})
export class ViewFacility {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private facilityService = inject(OrganizationFacilityService);
  private translationService = inject(TranslationService);

  readonly isArabic = computed(() => this.translationService.currentLang() === 'ar');

  facilityId = signal<string | null>(null);
  facility = signal<IOrganizationFacilityDetail | null>(null);
  loadFailed = signal(false);

  sportNamesDisplay = computed(() => {
    const sports = this.facility()?.sports;
    return sports?.length ? sports.map((s) => s.name).join(', ') : '—';
  });

  viewAttachmentUrls = computed(() => {
    const list = this.facility()?.attachments;
    if (!list?.length) {
      return [] as string[];
    }
    return list
      .map((a: { attachmentName?: string; fileName?: string; thumbnail?: string }) => {
        const name = a?.attachmentName ?? a?.fileName ?? a?.thumbnail;
        return name ? `${environment.imageApi}/${name}` : null;
      })
      .filter((x): x is string => !!x);
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        switchMap((idParam) => {
          this.facilityId.set(idParam);
          this.facility.set(null);
          this.loadFailed.set(false);

          const numericId = idParam ? Number(idParam) : NaN;
          if (!Number.isFinite(numericId)) {
            this.loadFailed.set(true);
            return of(null);
          }
          return this.facilityService.getById(numericId).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.facility.set(data);
        this.loadFailed.set(data === null);
      });
  }

  displayOrDash(value: string | null | undefined): string {
    const v = value?.trim();
    return v ? v : '—';
  }

  facilityDescription(fc: IOrganizationFacilityDetail): string {
    return this.isArabic()
      ? this.displayOrDash(fc.descriptionAr)
      : this.displayOrDash(fc.description);
  }

  back() {
    void this.router.navigate(['/club-management/facilities']);
  }

  goEdit() {
    const id = this.facilityId();
    if (id) {
      void this.router.navigate(['/club-management/facilities/edit-facility', id]);
    }
  }
}
