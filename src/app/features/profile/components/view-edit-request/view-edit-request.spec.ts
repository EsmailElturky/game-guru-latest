import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEditRequest } from './view-edit-request';

describe('ViewEditRequest', () => {
  let component: ViewEditRequest;
  let fixture: ComponentFixture<ViewEditRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEditRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEditRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
