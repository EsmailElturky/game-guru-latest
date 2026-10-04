import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { ConfigurationsService } from '../../services';
import { IFaqById } from '../../interfaces/faq.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-faq',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-faq.html',
  styleUrl: './view-faq.scss',
})
export class ViewFaq {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private configurations = inject(ConfigurationsService);

  faqId = signal<string | null>(null);
  faq = signal<IFaqById | null>(null);

  imageUrl = computed(() => {
    const name = this.faq()?.imageName;
    return name ? `${environment.imageApi}/${name}` : null;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          this.faqId.set(id);
          return id;
        }),
        switchMap((id) => {
          if (!id) {
            return of(null as IFaqById | null);
          }
          return this.configurations.getFaqById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.faq.set(data));
  }

  back() {
    void this.router.navigate(['/system-configurations/faq']);
  }

  goEdit() {
    const id = this.faqId();
    if (id) {
      void this.router.navigate(['/system-configurations/faq/edit-faq', id]);
    }
  }
}
