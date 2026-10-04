import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent, EditorComponent, ToastService, ToastType } from '@EsmailElturky/ui-kit';
import { ConfigurationsService } from '../../services';

@Component({
  selector: 'app-edit-usage-agreement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ButtonComponent, EditorComponent],
  templateUrl: './edit-usage-agreement.html',
  styleUrl: './edit-usage-agreement.scss',
})
export class EditUsageAgreement implements OnInit {
  private readonly backRoute = '/system-configurations/general-configurations';

  private fb = inject(FormBuilder);
  private configurations = inject(ConfigurationsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService);
  private translateService = inject(TranslateService);

  editorBoxStyle = { minHeight: '220px' } as Record<string, string | number>;

  form = this.fb.nonNullable.group({
    description: this.fb.nonNullable.control(''),
    descriptionAr: this.fb.nonNullable.control(''),
  });

  ngOnInit(): void {
    this.configurations
      .getUsageAgreement()
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
      .editUsageAgreement(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.toastService.addToast(
          ToastType.Success,
          this.translateService.instant('generalConfigurations.updatedSuccessfully'),
          this.translateService.instant('generalConfigurations.updatedSuccessfullyDescription'),
        );
        this.router.navigate([this.backRoute]);
      });
  }

  cancel() {
    this.router.navigate([this.backRoute]);
  }
}
