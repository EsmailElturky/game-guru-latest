import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPromoCode } from './add-promo-code';

describe('AddPromoCode', () => {
  let component: AddPromoCode;
  let fixture: ComponentFixture<AddPromoCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPromoCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPromoCode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
