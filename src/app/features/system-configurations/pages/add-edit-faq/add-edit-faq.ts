import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, FileInputComponent, InputTextComponent } from '@EsmailElturky/ui-kit';
import { Formify, toFormData } from 'src/app/shared/functions/utils';
import { ConfigurationsService } from '../../services';
import { environment } from 'src/environments/environment';
import { IFaqCreate } from '../../interfaces';

@Component({
  selector: 'app-add-edit-faq',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    FileInputComponent,
    ButtonComponent,
  ],
  templateUrl: './add-edit-faq.html',
  styleUrl: './add-edit-faq.scss',
})
export class AddEditFaq {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private configurations = inject(ConfigurationsService);
  private router = inject(Router);

  faqId = signal<string | null>(null);
  routeParams = toSignal(this.route.paramMap);
  private lastLoadedId: string | null = null;

  faqForm = this.fb.group<Formify<IFaqCreate>>({
    Title: this.fb.nonNullable.control('', Validators.required),
    TitleAr: this.fb.nonNullable.control('', Validators.required),
    Description: this.fb.nonNullable.control('', Validators.required),
    DescriptionAr: this.fb.nonNullable.control('', Validators.required),
    ImageFile: this.fb.control(null),
  });

  fileValidation = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  };

  constructor() {
    this.setEffects();
  }

  setEffects() {
    effect(() => {
      const id = this.routeParams()?.get('id') ?? null;
      this.faqId.set(id);

      if (!id) {
        this.lastLoadedId = null;
        this.faqForm.reset({
          Title: '',
          TitleAr: '',
          Description: '',
          DescriptionAr: '',
          ImageFile: null,
        });
        return;
      }

      if (this.lastLoadedId === id) {
        return;
      }
      this.lastLoadedId = id;
      this.getFaq();
    });
  }

  getFaq() {
    this.configurations
      .getFaqById(this.faqId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((faq) => {
        this.faqForm.patchValue({
          Title: faq.title,
          TitleAr: faq.titleAr,
          Description: faq.description,
          DescriptionAr: faq.descriptionAr,
          ImageFile: faq.imageName ? `${environment.imageApi}/${faq.imageName}` : null,
        });
      });
  }

  save() {
    if (this.faqForm.valid) {
      const raw = this.faqForm.getRawValue();
      const payload: Record<string, unknown> = { ...raw };

      if (this.faqId()) {
        payload['Id'] = this.faqId()!;
      }

      if (typeof payload['ImageFile'] === 'string') {
        delete payload['ImageFile'];
      }

      const formData = toFormData(payload);

      if (this.faqId()) {
        this.configurations
          .updateFaq(formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/faq']);
          });
      } else {
        this.configurations
          .createFaq(formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/faq']);
          });
      }
    } else {
      this.faqForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/system-configurations/faq']);
  }
}
