import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  FileInputComponent,
  MobileInputComponent,
  InputTextComponent,
  TextAreaComponent,
} from '@EsmailElturky/ui-kit';
import { IFileValidation } from 'src/app/shared/interfaces';
import { ProfileService } from '../../services/profile.service';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { extractCode, extractNumber, toFormData } from 'src/app/shared/functions';
import { toSignal } from '@angular/core/rxjs-interop';
import { Lookups } from 'src/app/shared/services';
import { LookupsEnum } from 'src/app/shared/enums';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    InputTextComponent,
    TextAreaComponent,
    FileInputComponent,
    ButtonComponent,
    MobileInputComponent,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private lookups = inject(Lookups);

  isEditMode = signal(false);
  profileData = signal<any>(null);

  profileForm = new FormGroup({
    userName: new FormControl({ value: '', disabled: true }, Validators.required),
    fullName: new FormControl('', Validators.required),
    phoneNumber: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    address: new FormControl(''),
    attachment: new FormControl<string>(''),
  });

  phoneCountryCodeOptions = toSignal(this.lookups.getLookup(LookupsEnum.GetCountryCode), {
    initialValue: [],
  });
  imageApi = environment.imageApi;

  fileValidation: IFileValidation = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png'],
  };

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    this.profileService.getMyProfile().subscribe((res) => {
      this.profileData.set(res);
      this.profileForm.patchValue({
        userName: res?.username,
        fullName: res?.fullName,
        phoneNumber: `(${res?.countryCode})${res?.phoneNumber}`,
        email: res?.email,
        address: res?.address,
        attachment: `${this.imageApi}/${res?.imageName}`,
      });
    });
  }

  toggleEdit() {
    this.isEditMode.set(true);
  }

  cancelEdit() {
    this.isEditMode.set(false);
    if (this.profileData()) {
      const res = this.profileData();
      this.profileForm.patchValue({
        userName: res.username,
        fullName: res.fullName,
        phoneNumber: `(${res.countryCode}) ${res.phoneNumber}`,
        email: res.email,
        address: res.address,
      });
    }
  }

  save() {
    if (this.profileForm.valid) {
      let body = {
        email: this.profileForm.get('email')?.value,
        fullName: this.profileForm.get('fullName')?.value,
        phoneNumber: extractNumber(this.profileForm.get('phoneNumber')?.value!),
        address: this.profileForm.get('address')?.value,
        countryCode: extractCode(this.profileForm.get('phoneNumber')?.value!),
        attachment: this.profileForm.get('attachment')?.value,
      };
      const formData = toFormData(body);

      this.profileService.editProfile(formData).subscribe(() => {
        this.getProfile();
        this.isEditMode.set(false);
      });
    }
  }
}
