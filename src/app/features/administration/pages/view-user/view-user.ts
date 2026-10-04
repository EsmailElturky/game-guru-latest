import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { AdministrationService } from '../../services';
import { IUser } from '../../interfaces/user';
import { environment } from 'src/environments/environment';
import { ltrIsolate } from 'src/app/shared/functions';

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-user.html',
  styleUrl: './view-user.scss',
})
export class ViewUser {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private administration = inject(AdministrationService);

  userId = signal<string | null>(null);
  user = signal<IUser | null>(null);

  imageUrl = computed(() => {
    const name = this.user()?.imageName;
    return name ? `${environment.imageApi}/${name}` : null;
  });

  phoneDisplay = computed(() => {
    const u = this.user();
    if (!u) {
      return '-';
    }
    const code = u.countryCode ?? '';
    const num = u.phoneNumber ?? '';
    const combined = `${code} ${num}`.trim();
    return ltrIsolate(combined || '-');
  });

  dobDisplay = computed(() => {
    const d = this.user()?.dateOfBirth;
    return d ? new Date(d).toLocaleDateString() : '-';
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          this.userId.set(id);
          return id;
        }),
        switchMap((id) => {
          if (!id) {
            return of(null as IUser | null);
          }
          return this.administration.getUserById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.user.set(data));
  }

  back() {
    void this.router.navigate(['/administration/users']);
  }

  goEdit() {
    const id = this.userId();
    if (id) {
      void this.router.navigate(['/administration/users/edit-user', id]);
    }
  }
}
