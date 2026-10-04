import { Organization } from './../organization/organization';
import { Component, signal, inject, computed, OnInit, DestroyRef, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonComponent,
  MultiSelectComponent,
  RadioButtonComponent,
  SelectComponent,
  TextAreaComponent,
  DatePickerComponent,
  InputNumberComponent,
} from '@EsmailElturky/ui-kit';
import { Lookups } from 'src/app/shared/services/lookups/lookups';
import { BookingService } from 'src/app/features/booking/services';
import { LookupsEnum, CascadeLookupsEnum } from 'src/app/shared/enums';
import { transformDate } from 'src/app/shared/functions';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-add-slot',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    SelectComponent,
    RadioButtonComponent,
    TextAreaComponent,
    DatePickerComponent,
    InputNumberComponent,
  ],
  templateUrl: './add-slot.html',
  styleUrl: './add-slot.scss',
})
export class AddSlot {
  OrganizationId = JSON.parse(localStorage.getItem('game_guru_user') || '{}').organizationId;

  private fb = inject(FormBuilder);
  slotForm: FormGroup = this.fb.group({
    facilityId: [null, Validators.required],
    sportType: [null, Validators.required],
    genderType: [null, Validators.required],
    description: [''],
    descriptionAr: [''],
    startTime: [null, Validators.required],
    endTime: [null, Validators.required],
    bookingDate: [null, Validators.required],
    bookingFees: ['', Validators.required],
    bookingSlotSports: [null, Validators.required],
    organizationId: [this.OrganizationId, Validators.required],
  });

  private lookupsService = inject(Lookups);
  private bookingService = inject(BookingService);
  private destroyRef = inject(DestroyRef);

  courtOptions = signal<any[]>([]);
  sportOptions = toSignal(
    this.lookupsService
      .getLookup(LookupsEnum.GetSport)
      .pipe(map((data: any[]) => data.map((item: any) => ({ name: item.name, id: item.id })))),
    { initialValue: [] },
  );
  sportTypeOptions = toSignal(this.lookupsService.getLookup(LookupsEnum.GetSportType), {
    initialValue: [],
  });
  genderOptions = toSignal(this.lookupsService.getLookup(LookupsEnum.GetGenderType), {
    initialValue: [],
  });

  organizations = toSignal(this.lookupsService.getLookup(LookupsEnum.GetOrganization), {
    initialValue: [],
  });

  courtOptionsOptions = toSignal(
    this.lookupsService.getCascadeLookups(
      CascadeLookupsEnum.GetOrganizationFacility,
      this.OrganizationId,
    ),
    {
      initialValue: [],
    },
  );

  save(repeat: boolean) {
    if (this.slotForm.valid) {
      const payload = this.preparePayload();
      this.bookingService
        .createBookingSlot(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (!repeat) {
            this.slotForm.reset();
          }
        });
    } else {
      this.slotForm.markAllAsTouched();
    }
  }

  private preparePayload() {
    const formValue = this.slotForm.value;
    return [
      {
        facilityId: formValue.facilityId,
        sportType: formValue.sportType,
        genderType: formValue.genderType,
        description: formValue.description,
        descriptionAr: formValue.descriptionAr,
        startTime: this.formatTime(formValue.startTime),
        endTime: this.formatTime(formValue.endTime),
        bookingDate: transformDate(formValue.bookingDate),
        bookingFees: Number(formValue.bookingFees),
        bookingSlotSports: [{ sportId: formValue.bookingSlotSports }],
        organizationId: this.OrganizationId,
      },
    ];
  }

  // need output be like hh:mm tt 06:10 am
  private formatTime(date: Date): string {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}
