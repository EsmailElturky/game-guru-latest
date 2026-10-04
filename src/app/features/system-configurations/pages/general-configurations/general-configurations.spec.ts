import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralConfigurations } from './general-configurations';

describe('GeneralConfigurations', () => {
  let component: GeneralConfigurations;
  let fixture: ComponentFixture<GeneralConfigurations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralConfigurations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralConfigurations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
