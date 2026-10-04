import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewBooking } from './add-new-booking';

describe('AddNewBooking', () => {
  let component: AddNewBooking;
  let fixture: ComponentFixture<AddNewBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
