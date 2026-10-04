import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TermsService, ITerm } from 'src/app/shared/services/terms.service';
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html.pipe';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { Router } from '@angular/router';

const ACTIVE = 'activate';

function isActiveTerm(t: ITerm): boolean {
  return (t.statusName?.trim() ?? '').toLowerCase() === ACTIVE;
}

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent, SafeHtmlPipe],
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
})
export class Terms {
  private termsService = inject(TermsService);
  private router = inject(Router);

  terms = signal<ITerm[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.termsService.getAll().subscribe({
      next: (list) => {
        const rows = Array.isArray(list) ? list : [];
        const active = rows.filter(isActiveTerm);
        this.terms.set(active.length ? active : rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/auth/login']);
  }
}
