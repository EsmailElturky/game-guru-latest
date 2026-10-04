import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { ConfigurationsService } from '../../services';
import { IIntroById } from '../../interfaces/intro.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-intro',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-intro.html',
  styleUrl: './view-intro.scss',
})
export class ViewIntro {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private configurations = inject(ConfigurationsService);

  introId = signal<string | null>(null);
  intro = signal<IIntroById | null>(null);

  imageUrl = computed(() => {
    const name = this.intro()?.imageName;
    return name ? `${environment.imageApi}/${name}` : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          this.introId.set(id);
          return id;
        }),
        switchMap((id) => {
          if (!id) {
            return of(null as IIntroById | null);
          }
          return this.configurations.getIntroById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.intro.set(data));
  }

  back() {
    void this.router.navigate(['/system-configurations/intro']);
  }

  goEdit() {
    const id = this.introId();
    if (id) {
      void this.router.navigate(['/system-configurations/intro/edit-intro', id]);
    }
  }
}
