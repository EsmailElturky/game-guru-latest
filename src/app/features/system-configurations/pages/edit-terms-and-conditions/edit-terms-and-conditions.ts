import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent, EditorComponent, ToastService, ToastType } from '@EsmailElturky/ui-kit';
import { ConfigurationsService } from '../../services';
import { AppPage } from 'src/app/core/constants/app-pages';
import { injectPagePermissions } from 'src/app/core/utils/inject-page-permissions';

@Component({
  selector: 'app-edit-terms-and-conditions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ButtonComponent, EditorComponent],
  templateUrl: './edit-terms-and-conditions.html',
  styleUrl: './edit-terms-and-conditions.scss',
})
export class EditTermsAndConditions implements OnInit {
  private fb = inject(FormBuilder);
  private configurations = inject(ConfigurationsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService);
  private translateService = inject(TranslateService);

  readonly perms = injectPagePermissions(AppPage.TermsConditions);
  editorBoxStyle = { minHeight: '220px' } as Record<string, string | number>;

  form = this.fb.nonNullable.group({
    description: this.fb.nonNullable.control(''),
    descriptionAr: this.fb.nonNullable.control(''),
  });

  ngOnInit(): void {
    this.getTermsAndConditions();
  }

  getTermsAndConditions() {
    this.configurations
      .getTermsAndConditions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.form.patchValue({
            description: data.description ?? '',
            descriptionAr: data.descriptionAr ?? '',
          });
        },
      });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = this.form.getRawValue();
    this.configurations
      .editTermsAndConditions(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.toastService.addToast(
          ToastType.Success,
          this.translateService.instant('generalConfigurations.updatedSuccessfully'),
          this.translateService.instant('generalConfigurations.updatedSuccessfullyDescription'),
        );
        this.getTermsAndConditions();
      });
  }

  cancel() {
    this.form.reset();
  }
}
