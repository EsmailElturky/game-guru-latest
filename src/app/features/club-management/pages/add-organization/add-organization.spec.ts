import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrganization } from './add-organization';

describe('AddOrganization', () => {
  let component: AddOrganization;
  let fixture: ComponentFixture<AddOrganization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrganization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrganization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
