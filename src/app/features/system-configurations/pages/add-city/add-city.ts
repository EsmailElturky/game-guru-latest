import { ICityCreate } from './../../interfaces/city';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, InputTextComponent } from '@EsmailElturky/ui-kit';
import { Formify } from 'src/app/shared/functions/utils';
import { ConfigurationsService } from '../../services';

@Component({
  selector: 'app-add-city',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    ButtonComponent,
  ],
  templateUrl: './add-city.html',
  styleUrl: './add-city.scss',
})
export class AddCity {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private configurations = inject(ConfigurationsService);
  private router = inject(Router);

  cityId = signal<string | null>(null);
  routeParams = toSignal(this.route.paramMap);
  private lastLoadedId: string | null = null;

  cityForm = this.fb.group({
    name: this.fb.control(null, Validators.required),
    nameAr: this.fb.control(null, Validators.required),
  });

  constructor() {
    this.setEffects();
  }

  setEffects() {
    effect(() => {
      const id = this.routeParams()?.get('id') ?? null;
      this.cityId.set(id);

      if (!id) {
        this.lastLoadedId = null;
        this.cityForm.reset({ name: null, nameAr: null });
        return;
      }

      if (this.lastLoadedId === id) {
        return;
      }
      this.lastLoadedId = id;
      this.getCity();
    });
  }

  getCity() {
    this.configurations
      .getCityById(this.cityId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((city) => {
        this.cityForm.patchValue(city as any);
      });
  }

  save() {
    if (this.cityForm.valid) {
      if (this.cityId()) {
        let body: any = this.cityForm.getRawValue();
        body.id = this.cityId()!;
        this.configurations
          .updateCity(body)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/cities']);
          });
      } else {
        this.configurations
          .createCity(this.cityForm.getRawValue())
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.router.navigate(['/system-configurations/cities']);
          });
      }
    } else {
      this.cityForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/system-configurations/cities']);
  }
}
