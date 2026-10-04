import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManager } from './add-manager';

describe('AddManager', () => {
  let component: AddManager;
  let fixture: ComponentFixture<AddManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
