import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { environment } from 'src/environments/environment';
import { ClubManagementService } from '../../services';
import { IOrganizationDetail } from '../../interfaces';
import { TranslationService } from 'src/app/core/services';
import { ltrIsolate } from 'src/app/shared/functions';

@Component({
  selector: 'app-view-organization',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-organization.html',
  styleUrl: './view-organization.scss',
})
export class ViewOrganization {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private clubManagement = inject(ClubManagementService);
  private translationService = inject(TranslationService);

  readonly imageBase = environment.imageApi;
  readonly isArabic = computed(() => this.translationService.currentLang() === 'ar');

  organization = signal<IOrganizationDetail | null>(null);
  loadFailed = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.organization.set(null);
          this.loadFailed.set(false);
        }),
        map((pm) => pm.get('id')),
        distinctUntilChanged(),
        switchMap((id) => {
          const n = id ? Number(id) : NaN;
          if (!Number.isFinite(n) || n <= 0) {
            return of(null);
          }
          return this.clubManagement.getOrganizationById(n).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        const raw = this.route.snapshot.paramMap.get('id');
        const n = raw ? Number(raw) : NaN;
        const hadValidId = Number.isFinite(n) && n > 0;
        if (!hadValidId) {
          this.organization.set(null);
          this.loadFailed.set(true);
          return;
        }
        this.organization.set(data);
        this.loadFailed.set(data === null);
      });
  }

  imageUrl(fileName: string | null | undefined): string | null {
    if (!fileName?.trim()) return null;
    return `${this.imageBase}/${fileName}`;
  }

  phoneLine(org: IOrganizationDetail): string {
    const parts = [org.countryCode, org.phoneNumber].filter((p) => p != null && String(p).trim() !== '');
    if (!parts.length) return '—';
    return ltrIsolate(parts.join(' '));
  }

  coordinatesLine(org: IOrganizationDetail): string {
    if (org.latitude == null || org.longitude == null) return '—';
    return ltrIsolate(`${org.latitude}, ${org.longitude}`);
  }

  mapsLink(org: IOrganizationDetail): string | null {
    if (org.urlMap?.trim()) return org.urlMap.trim();
    if (org.latitude != null && org.longitude != null) {
      return `https://www.google.com/maps?q=${org.latitude},${org.longitude}`;
    }
    return null;
  }

  displayOrDash(value: string | null | undefined): string {
    const v = value?.trim();
    return v ? v : '—';
  }

  organizationName(org: IOrganizationDetail): string {
    return this.isArabic()
      ? this.displayOrDash(org.nameAr)
      : this.displayOrDash(org.name);
  }

  organizationDescription(org: IOrganizationDetail): string {
    return this.isArabic()
      ? this.displayOrDash(org.descriptionAr)
      : this.displayOrDash(org.description);
  }

  organizationAbout(org: IOrganizationDetail): string {
    return this.isArabic() ? this.displayOrDash(org.aboutAr) : this.displayOrDash(org.about);
  }

  back() {
    void this.router.navigate(['/club-management/organizations']);
  }

  goEdit() {
    const id = this.organization()?.id ?? this.route.snapshot.paramMap.get('id');
    if (id != null) {
      void this.router.navigate(['/club-management/organizations/edit-organization', id]);
    }
  }
}
