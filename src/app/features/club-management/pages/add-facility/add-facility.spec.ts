import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFacility } from './add-facility';

describe('AddFacility', () => {
  let component: AddFacility;
  let fixture: ComponentFixture<AddFacility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFacility]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFacility);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
