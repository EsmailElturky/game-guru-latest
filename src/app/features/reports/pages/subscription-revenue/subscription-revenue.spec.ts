import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscriptionRevenue } from './subscription-revenue';
import { TranslateModule } from '@ngx-translate/core';

describe('SubscriptionRevenue', () => {
  let component: SubscriptionRevenue;
  let fixture: ComponentFixture<SubscriptionRevenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionRevenue, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionRevenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
