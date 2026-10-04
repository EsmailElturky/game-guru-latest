import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { ConfigurationsService } from '../../services';
import { ISportById } from '../../interfaces/sport';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-sport',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-sport.html',
  styleUrl: './view-sport.scss',
})
export class ViewSport {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private configurations = inject(ConfigurationsService);

  sportId = signal<string | null>(null);
  sport = signal<ISportById | null>(null);

  imageUrl = computed(() => {
    const name = this.sport()?.imageName;
    return name ? `${environment.imageApi}/${name}` : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          this.sportId.set(id);
          return id;
        }),
        switchMap((id) => {
          if (!id) {
            return of(null as ISportById | null);
          }
          return this.configurations.getSportById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.sport.set(data));
  }

  back() {
    void this.router.navigate(['/system-configurations/sports']);
  }

  goEdit() {
    const id = this.sportId();
    if (id) {
      void this.router.navigate(['/system-configurations/sports/edit-sport', id]);
    }
  }
}
