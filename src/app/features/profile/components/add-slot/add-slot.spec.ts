import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSlot } from './add-slot';

describe('AddSlot', () => {
  let component: AddSlot;
  let fixture: ComponentFixture<AddSlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSlot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSlot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
