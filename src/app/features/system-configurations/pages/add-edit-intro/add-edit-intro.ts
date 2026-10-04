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
import { IIntroCreate } from '../../interfaces';

@Component({
  selector: 'app-add-edit-intro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    FileInputComponent,
    ButtonComponent,
  ],
  templateUrl: './add-edit-intro.html',
  styleUrl: './add-edit-intro.scss',
})
export class AddEditIntro {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private configurations = inject(ConfigurationsService);
  private router = inject(Router);

  introId = signal<string | null>(null);
  routeParams = toSignal(this.route.paramMap);
  private lastLoadedId: string | null = null;

  introForm = this.fb.group<Formify<IIntroCreate>>({
    Title: this.fb.nonNullable.control('', Validators.required),
    TitleAr: this.fb.nonNullable.control('', Validators.required),
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
      this.introId.set(id);

      if (!id) {
        this.lastLoadedId = null;
        this.introForm.reset({
          Title: '',
          TitleAr: '',
          ImageFile: null,
        });
        return;
      }

      if (this.lastLoadedId === id) {
        return;
      }
      this.lastLoadedId = id;
      this.getIntro();
    });
  }

  getIntro() {
    this.configurations
      .getIntroById(this.introId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((intro) => {
        this.introForm.patchValue({
          Title: intro.title,
          TitleAr: intro.titleAr,
          ImageFile: intro.imageName ? `${environment.imageApi}/${intro.imageName}` : null,
        });
      });
  }

  save() {
    if (this.introForm.valid) {
      const raw = this.introForm.getRawValue();
      const payload: Record<string, unknown> = { ...raw };

      if (this.introId()) {
        payload['Id'] = this.introId()!;
      }

      if (typeof payload['ImageFile'] === 'string') {
        delete payload['ImageFile'];
      }

      const formData = toFormData(payload);

      if (this.introId()) {
        this.configurations
          .updateIntro(formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/intro']);
          });
      } else {
        this.configurations
          .createIntro(formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/intro']);
          });
      }
    } else {
      this.introForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/system-configurations/intro']);
  }
}
