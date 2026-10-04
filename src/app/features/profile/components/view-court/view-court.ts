import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { OrganizationFacilityService } from '../../services/organization-facility.service';
import { IOrganizationFacilityDetail } from '../../interfaces/organization-facility.interface';
import { profileReturnQuery } from '../../profile-tab.constants';

@Component({
  selector: 'app-view-court',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-court.html',
  styleUrl: './view-court.scss',
})
export class ViewCourt {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private organizationFacilityService = inject(OrganizationFacilityService);

  courtId = signal<string | null>(null);
  facility = signal<IOrganizationFacilityDetail | null>(null);

  sportNamesDisplay = computed(() => {
    const sports = this.facility()?.sports;
    return sports?.length ? sports.map((s) => s.name).join(', ') : '-';
  });

  viewAttachmentUrls = computed(() => {
    const list = this.facility()?.attachments;
    if (!list?.length) {
      return [] as string[];
    }
    return list
      .map((a: { attachmentName?: string; fileName?: string }) => {
        const name = a?.attachmentName ?? a?.fileName;
        return name ? `${environment.imageApi}/${name}` : null;
      })
      .filter((x): x is string => !!x);
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          this.courtId.set(id);
          return id;
        }),
        switchMap((idParam) => {
          const numericId = idParam ? Number(idParam) : NaN;
          if (!Number.isFinite(numericId)) {
            return of(null as IOrganizationFacilityDetail | null);
          }
          return this.organizationFacilityService.getById(numericId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.facility.set(data));
  }

  back() {
    this.router.navigate(['/profile'], profileReturnQuery('courts'));
  }

  goEdit() {
    const id = this.courtId();
    if (id) {
      void this.router.navigate(['/profile/edit-court', id]);
    }
  }
}
