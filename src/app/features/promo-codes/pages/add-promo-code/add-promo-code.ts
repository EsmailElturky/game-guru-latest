import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonComponent,
  DatePickerComponent,
  FileInputComponent,
  InputNumberComponent,
  InputTextComponent,
  SelectComponent,
} from '@EsmailElturky/ui-kit';
import { toFormData, transformDate } from 'src/app/shared/functions/utils';
import { PromoCodeService } from '../../services/promo-code.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-promo-code',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    SelectComponent,
    FileInputComponent,
    ButtonComponent,
    DatePickerComponent,
    InputNumberComponent,
  ],
  templateUrl: './add-promo-code.html',
  styleUrl: './add-promo-code.scss',
})
export class AddPromoCode {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private promoCodeService = inject(PromoCodeService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isEdit = signal(false);
  promoId = signal<string | null>(null);
  routeParams = toSignal(this.route.paramMap);
  private lastLoadedId: string | null = null;

  promoCodeForm = this.fb.group({
    Name: this.fb.nonNullable.control('', Validators.required),
    NameAr: this.fb.nonNullable.control('', Validators.required),
    StartDate: this.fb.nonNullable.control('', Validators.required),
    EndDate: this.fb.nonNullable.control('', Validators.required),
    PromotionCode: this.fb.nonNullable.control('', Validators.required),
    PromotionType: this.fb.nonNullable.control(0, Validators.required),
    FixedValue: this.fb.nonNullable.control(0),
    Percentage: this.fb.nonNullable.control(0),
    MaxAmount: this.fb.nonNullable.control(0),
    Summary: this.fb.nonNullable.control(''),
    SummaryAr: this.fb.nonNullable.control(''),
    Description: this.fb.nonNullable.control(''),
    DescriptionAr: this.fb.nonNullable.control(''),
    ImageFile: this.fb.nonNullable.control<File | string>('', Validators.required),
  });

  promoType = toSignal(this.promoCodeForm.get('PromotionType')?.valueChanges as Observable<number>);

  fileValidation = {
    maxFileSize: 5 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png'],
  };

  promoTypeOptions = signal([
    { label: 'Fixed Value', value: 1 },
    { label: 'Percentage', value: 2 },
  ]);

  today = new Date();

  constructor() {
    this.setEffects();
  }

  setEffects() {
    effect(() => {
      const id = this.routeParams()?.get('id') ?? null;
      this.promoId.set(id);
      this.isEdit.set(!!id);

      if (!id) {
        this.lastLoadedId = null;
        this.promoCodeForm.reset({
          Name: '',
          NameAr: '',
          StartDate: '',
          EndDate: '',
          PromotionCode: '',
          PromotionType: 0,
          FixedValue: 0,
          Percentage: 0,
          MaxAmount: 0,
          Summary: '',
          SummaryAr: '',
          Description: '',
          DescriptionAr: '',
          ImageFile: '',
        });
        return;
      }

      if (this.lastLoadedId === id) {
        return;
      }
      this.lastLoadedId = id;
      this.getPromoCode();
    });
    effect(() => {
      const promoType = this.promoType();
      this.promoCodeForm.get('FixedValue')?.reset();
      this.promoCodeForm.get('Percentage')?.reset();
    });
  }

  getPromoCode() {
    this.promoCodeService
      .getById(this.promoId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((promo) => {
        this.promoCodeForm.patchValue({
          Name: promo.name,
          NameAr: promo.nameAr,
          StartDate: new Date(promo.startDate) as any,
          EndDate: new Date(promo.endDate) as any,
          PromotionCode: promo.promotionCode,
          PromotionType: promo.promotionType,
          FixedValue: promo.fixedValue,
          Percentage: promo.percentage,
          MaxAmount: promo.maxAmount,
          Summary: promo.summary,
          SummaryAr: promo.summaryAr,
          Description: promo.description ?? '',
          DescriptionAr: promo.descriptionAr ?? '',
          ImageFile: `${environment.imageApi}/${promo.imageName}`,
        });
      });
  }

  /**
   * Generate a random promo code mix of letters and numbers
   */
  generateCode() {
    const code = Array.from({ length: 12 }, () => {
      const random = Math.random();
      return random < 0.5
        ? String.fromCharCode(Math.floor(random * 26) + 65)
        : Math.floor(random * 10);
    }).join('');
    this.promoCodeForm.controls.PromotionCode.setValue(code);
  }

  addCode() {
    if (!this.promoCodeForm.controls.PromotionCode.value) {
      this.generateCode();
    }
  }

  get minDate() {
    const date = new Date(this.promoCodeForm.controls.StartDate.value);
    date.setDate(date.getDate() + 1);
    return date;
  }

  save() {
    if (this.promoCodeForm.valid) {
      const raw = this.promoCodeForm.getRawValue();
      const payload: Record<string, any> = {
        ...raw,
        StartDate: transformDate(raw.StartDate as unknown as string),
        EndDate: transformDate(raw.EndDate as unknown as string),
      };

      if (this.isEdit()) {
        payload['Id'] = this.promoId()!;
      }

      const formData = toFormData(payload);

      const request = this.isEdit()
        ? this.promoCodeService.edit(formData)
        : this.promoCodeService.add(formData);

      request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.router.navigate(['/promo-codes']);
      });
    } else {
      this.promoCodeForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/promo-codes']);
  }
}
