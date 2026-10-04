import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonComponent,
  FileInputComponent,
  InputTextComponent,
  TextAreaComponent,
} from '@EsmailElturky/ui-kit';
import { Formify, toFormData } from 'src/app/shared/functions/utils';
import { ConfigurationsService } from '../../services';
import { environment } from 'src/environments/environment';
import { ISlideCreate } from '../../interfaces';

@Component({
  selector: 'app-add-edit-slide',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    TextAreaComponent,
    FileInputComponent,
    ButtonComponent,
  ],
  templateUrl: './add-edit-slide.html',
  styleUrl: './add-edit-slide.scss',
})
export class AddEditSlide {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private configurations = inject(ConfigurationsService);
  private router = inject(Router);

  slideId = signal<string | null>(null);
  routeParams = toSignal(this.route.paramMap);
  private lastLoadedId: string | null = null;
  urlPattern = /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|localhost)(:\d+)?(\/[^\s]*)?$/;

  slideForm = this.fb.group<Formify<ISlideCreate>>({
    Title: this.fb.nonNullable.control('', Validators.required),
    TitleAr: this.fb.nonNullable.control('', Validators.required),
    Description: this.fb.nonNullable.control('', Validators.required),
    DescriptionAr: this.fb.nonNullable.control('', Validators.required),
    Url: this.fb.nonNullable.control('', [Validators.pattern(this.urlPattern)]),
    ImageFile: this.fb.control(null, Validators.required),
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
      this.slideId.set(id);

      if (!id) {
        this.lastLoadedId = null;
        this.slideForm.reset({
          Title: '',
          TitleAr: '',
          Description: '',
          DescriptionAr: '',
          Url: '',
          ImageFile: null,
        });
        return;
      }

      if (this.lastLoadedId === id) {
        return;
      }
      this.lastLoadedId = id;
      this.getSlide();
    });
  }

  getSlide() {
    this.configurations
      .getSlideById(this.slideId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((slide) => {
        this.slideForm.patchValue({
          Title: slide.title,
          TitleAr: slide.titleAr,
          Description: slide.description,
          DescriptionAr: slide.descriptionAr,
          Url: slide.url,
          ImageFile: slide.imageName ? `${environment.imageApi}/${slide.imageName}` : null,
        });
      });
  }

  save() {
    if (this.slideForm.valid) {
      const raw = this.slideForm.getRawValue();
      const payload: Record<string, unknown> = { ...raw };

      if (this.slideId()) {
        payload['Id'] = this.slideId()!;
      }

      const formData = toFormData(payload);

      if (this.slideId()) {
        this.configurations
          .updateSlide(formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/sliders']);
          });
      } else {
        this.configurations
          .createSlide(formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/sliders']);
          });
      }
    } else {
      this.slideForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/system-configurations/sliders']);
  }
}
