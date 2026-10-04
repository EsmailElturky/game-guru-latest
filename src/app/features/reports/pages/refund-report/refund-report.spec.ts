import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundReport } from './refund-report';

describe('RefundReport', () => {
  let component: RefundReport;
  let fixture: ComponentFixture<RefundReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefundReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
