import { ISportCreate } from './../../interfaces/sport';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonComponent,
  FileInputComponent,
  InputTextComponent,
  SelectComponent,
} from '@EsmailElturky/ui-kit';
import { Formify, toFormData } from 'src/app/shared/functions/utils';
import { ConfigurationsService } from '../../services';
import { environment } from 'src/environments/environment';
import { Lookups } from 'src/app/shared/services';
import { LookupsEnum } from 'src/app/shared/enums';
import { ILookup } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-add-sport',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    SelectComponent,
    FileInputComponent,
    ButtonComponent,
  ],
  templateUrl: './add-sport.html',
  styleUrl: './add-sport.scss',
})
export class AddSport {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private configurations = inject(ConfigurationsService);
  private router = inject(Router);
  private lookups = inject(Lookups);

  sportId = signal<string | null>(null);
  routeParams = toSignal(this.route.paramMap);
  private lastLoadedId: string | null = null;

  sportForm = this.fb.group<Formify<ISportCreate>>({
    Name: this.fb.control(null, Validators.required),
    NameAr: this.fb.control(null, Validators.required),
    SportType: this.fb.control(null, Validators.required),
    ImageFile: this.fb.control<File | string | null>(null),
  });

  fileValidation = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png'],
  };

  sportTypeOptions = toSignal(this.lookups.getLookup(LookupsEnum.GetSportType), {
    initialValue: [] as ILookup[],
  });

  constructor() {
    this.setEffects();
  }

  setEffects() {
    effect(() => {
      const id = this.routeParams()?.get('id') ?? null;
      this.sportId.set(id);

      if (!id) {
        this.lastLoadedId = null;
        this.sportForm.reset({
          Name: '',
          NameAr: '',
          SportType: null,
          ImageFile: '',
        });
        return;
      }

      if (this.lastLoadedId === id) {
        return;
      }
      this.lastLoadedId = id;
      this.getSport();
    });
  }

  getSport() {
    this.configurations
      .getSportById(this.sportId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sport) => {
        this.sportForm.patchValue({
          Name: sport.name,
          NameAr: sport.nameAr,
          SportType: sport.sportType,
          ImageFile: `${environment.imageApi}/${sport.imageName}`,
        });
      });
  }

  save() {
    if (this.sportForm.valid) {
      const raw = this.sportForm.getRawValue();
      const payload: Record<string, unknown> = { ...raw };
      console.log(payload);
      if (this.sportId()) {
        payload['Id'] = this.sportId()!;
      }
      const formData = toFormData(payload);

      if (this.sportId()) {
        this.configurations
          .updateSport(formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/sports']);
          });
      } else {
        this.configurations
          .createSport(formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/sports']);
          });
      }
    } else {
      this.sportForm.markAllAsTouched();
      this.sportForm.controls['SportType']?.markAsTouched();
      console.log(this.sportForm);
    }
  }

  cancel() {
    this.router.navigate(['/system-configurations/sports']);
  }
}
