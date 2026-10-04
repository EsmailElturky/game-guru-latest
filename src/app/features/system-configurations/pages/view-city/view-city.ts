import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { ConfigurationsService } from '../../services';
import { ICityList } from '../../interfaces/city';

@Component({
  selector: 'app-view-city',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-city.html',
  styleUrl: './view-city.scss',
})
export class ViewCity {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private configurations = inject(ConfigurationsService);

  cityId = signal<string | null>(null);
  city = signal<ICityList | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          this.cityId.set(id);
          return id;
        }),
        switchMap((id) => {
          if (!id) {
            return of(null as ICityList | null);
          }
          return this.configurations.getCityById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.city.set(data));
  }

  back() {
    void this.router.navigate(['/system-configurations/cities']);
  }

  goEdit() {
    const id = this.cityId();
    if (id) {
      void this.router.navigate(['/system-configurations/cities/edit-city', id]);
    }
  }
}
