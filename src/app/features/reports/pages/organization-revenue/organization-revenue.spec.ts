import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizationRevenue } from './organization-revenue';
import { TranslateModule } from '@ngx-translate/core';

describe('OrganizationRevenue', () => {
  let component: OrganizationRevenue;
  let fixture: ComponentFixture<OrganizationRevenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationRevenue, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationRevenue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
