import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent, InputTextComponent, TextAreaComponent } from '@EsmailElturky/ui-kit';

@Component({
  selector: 'app-view-edit-request',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    InputTextComponent,
    TextAreaComponent,
    ButtonComponent,
  ],
  templateUrl: './view-edit-request.html',
  styleUrl: './view-edit-request.scss',
})
export class ViewEditRequest {
  requestForm = new FormGroup({
    subject: new FormControl('mohamed'),
    organizationName: new FormControl('mohamed'),
    requestDate: new FormControl('11/05/2025'),
    contactPhone: new FormControl('mohamed'),
    contactName: new FormControl('123456789'),
    contactEmail: new FormControl('Email address'),

    // Changes section
    oldInfo1: new FormControl('mohamed'),
    newInfo1: new FormControl('123456789'),

    oldInfo2: new FormControl('mohamed'),
    newInfo2: new FormControl('123456789'),

    oldInfo3: new FormControl('mohamed'),
    newInfo3: new FormControl('123456789'),

    reason: new FormControl(''),
  });

  save() {
    console.log(this.requestForm.getRawValue());
  }

  ngOnInit(): void {
    this.requestForm.disable();
  }
}
