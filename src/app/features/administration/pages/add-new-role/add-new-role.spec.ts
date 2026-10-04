import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewRole } from './add-new-role';

describe('AddNewRole', () => {
  let component: AddNewRole;
  let fixture: ComponentFixture<AddNewRole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewRole]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewRole);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
