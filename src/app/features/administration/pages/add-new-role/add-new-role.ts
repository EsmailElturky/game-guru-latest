import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent, InputTextComponent, MultiSelectComponent } from '@EsmailElturky/ui-kit';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AdministrationService } from '../../services';
import { IPagePermission, IRoleCreate, IRolePermission } from '../../interfaces';
import { map } from 'rxjs';
import { Auth } from 'src/app/features/auth/services/auth';

@Component({
  selector: 'app-add-new-role',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    InputTextComponent,
    ButtonComponent,
    MultiSelectComponent,
  ],
  templateUrl: './add-new-role.html',
  styleUrl: './add-new-role.scss',
})
export class AddNewRole {
  private fb = inject(FormBuilder);
  private administration = inject(AdministrationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private auth = inject(Auth);

  isAppAdmin = this.auth.isAdminApp;

  organizationId = this.isAppAdmin()
    ? null
    : JSON.parse(localStorage.getItem('game_guru_user')!).organizationId;

  roleId = signal<number | null>(null);
  routeParams = toSignal(this.route.paramMap);
  private lastLoadedId: string | null = null;

  roleForm = this.fb.group({
    name: this.fb.control('', Validators.required),
    nameAr: this.fb.control('', Validators.required),
    permissions: this.fb.control([], Validators.required),
  });

  permissionsOptions = toSignal(
    this.administration.getPermissions().pipe(
      map((roles) => {
        return roles.map((role) => {
          return {
            label: role.name,
            value: role.id,
            items: [
              {
                label: this.translateService.instant('common.add'),
                value: `${role.name}_${role.id}_1`,
              },
              {
                label: this.translateService.instant('common.edit'),
                value: `${role.name}_${role.id}_2`,
              },
              {
                label: this.translateService.instant('common.delete'),
                value: `${role.name}_${role.id}_3`,
              },
              {
                label: this.translateService.instant('common.view'),
                value: `${role.name}_${role.id}_4`,
              },
            ],
          };
        });
      }),
    ),
    { initialValue: [] },
  );

  constructor() {
    this.setEffects();
  }

  setEffects() {
    effect(() => {
      const id = this.routeParams()?.get('id') ?? null;

      if (!id) {
        this.roleId.set(null);
        this.lastLoadedId = null;
        this.roleForm.reset({ name: '', nameAr: '', permissions: [] });
        return;
      }

      if (this.lastLoadedId === id) {
        return;
      }
      this.lastLoadedId = id;
      this.roleId.set(+id);
      this.getRole(+id);
    });
  }

  getRole(id: number) {
    this.administration
      .getRoleById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((role) => {
        if (role.groupRolePermissions) {
          this.roleForm.patchValue({
            name: role.name,
            nameAr: role.nameAr,
            permissions: this.getPreSelectedPermissions(role.groupRolePermissions) as any,
          });
        }
      });
  }

  getPreSelectedPermissions(pagePermissions: IPagePermission[]) {
    return pagePermissions.reduce((acc, page) => {
      page.pageActions.forEach((action) => {
        if (action.isSelected) {
          acc.push(`${page.name}_${page.pageId}_${action.actionType}`);
        }
      });
      return acc;
    }, [] as string[]);
  }

  save() {
    if (this.roleForm.valid) {
      const formValue = this.roleForm.getRawValue();

      const payload: IRoleCreate = {
        name: formValue.name!,
        nameAr: formValue.nameAr!,
        groupRolePermissions: this.extractPermissions(formValue.permissions!),
      };

      if (!this.isAppAdmin()) {
        payload.organizationId = +this.organizationId!;
      }

      if (this.roleId()) {
        payload.id = this.roleId()!;
        this.administration
          .updateRole(payload)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/administration/roles']);
          });
      } else {
        this.administration
          .createRole(payload)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/administration/roles']);
          });
      }
    } else {
      this.roleForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/administration/roles']);
  }

  extractPermissions(permissions: string[]): IRolePermission[] {
    const grouped = permissions.reduce(
      (acc, perm) => {
        const [pageName, pageId, actionType] = perm.split('_');
        const pageIdNum = +pageId;
        const actionTypeNum = +actionType;

        if (!acc[pageIdNum]) {
          acc[pageIdNum] = {
            pageId: pageIdNum,
            pageActions: [],
          };
        }

        acc[pageIdNum].pageActions.push({
          actionType: actionTypeNum,
        });

        return acc;
      },
      {} as Record<number, IRolePermission>,
    );

    return Object.values(grouped);
  }
}
