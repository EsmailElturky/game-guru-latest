import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SportsRevenue } from './sports-revenue';
import { TranslateModule } from '@ngx-translate/core';

describe('SportsRevenue', () => {
  let component: SportsRevenue;
  let fixture: ComponentFixture<SportsRevenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SportsRevenue, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SportsRevenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
