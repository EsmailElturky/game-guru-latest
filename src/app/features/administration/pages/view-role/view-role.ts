import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { AdministrationService } from '../../services';
import { IRole } from '../../interfaces/role';

@Component({
  selector: 'app-view-role',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  templateUrl: './view-role.html',
  styleUrl: './view-role.scss',
})
export class ViewRole {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private administration = inject(AdministrationService);

  roleId = signal<number | null>(null);
  role = signal<IRole | null>(null);

  permissionLines = computed(() => {
    const perms = this.role()?.groupRolePermissions;
    if (!perms?.length) {
      return [] as string[];
    }
    const lines: string[] = [];
    for (const page of perms) {
      const pageName = page.name ?? String(page.pageId);
      const actions = page.pageActions
        ?.filter((a) => a.isSelected)
        .map((a) => a.actionTypeName ?? String(a.actionType))
        .filter(Boolean);
      if (actions?.length) {
        lines.push(`${pageName}: ${actions.join(', ')}`);
      }
    }
    return lines;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        map((id) => {
          const n = id ? Number(id) : NaN;
          this.roleId.set(Number.isFinite(n) ? n : null);
          return id;
        }),
        switchMap((id) => {
          const n = id ? Number(id) : NaN;
          if (!Number.isFinite(n)) {
            return of(null as IRole | null);
          }
          return this.administration.getRoleById(n);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.role.set(data));
  }

  back() {
    void this.router.navigate(['/administration/roles']);
  }

  goEdit() {
    const id = this.roleId();
    if (id != null) {
      void this.router.navigate(['/administration/roles/edit-role', id]);
    }
  }
}
