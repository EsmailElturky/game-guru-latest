import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { ConfigurationsService } from '../../services';
import { ISlideById } from '../../interfaces/slide.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-slider',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-slider.html',
  styleUrl: './view-slider.scss',
})
export class ViewSlider {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private configurations = inject(ConfigurationsService);

  slideId = signal<string | null>(null);
  slide = signal<ISlideById | null>(null);

  imageUrl = computed(() => {
    const name = this.slide()?.imageName;
    return name ? `${environment.imageApi}/${name}` : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          this.slideId.set(id);
          return id;
        }),
        switchMap((id) => {
          if (!id) {
            return of(null as ISlideById | null);
          }
          return this.configurations.getSlideById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.slide.set(data));
  }

  back() {
    void this.router.navigate(['/system-configurations/sliders']);
  }

  goEdit() {
    const id = this.slideId();
    if (id) {
      void this.router.navigate(['/system-configurations/sliders/edit-slider', id]);
    }
  }
}
