import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';

@Component({
  selector: 'app-view-manager',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-manager.html',
  styleUrl: './view-manager.scss',
})
export class ViewManager {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  managerId = signal<string | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => this.managerId.set(id));
  }

  back() {
    void this.router.navigate(['/club-management/managers']);
  }

  goEdit() {
    const id = this.managerId();
    if (id) {
      void this.router.navigate(['/club-management/managers/edit-manager', id]);
    }
  }
}
