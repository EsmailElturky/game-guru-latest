import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Audits } from './audits';
import { TranslateModule } from '@ngx-translate/core';

describe('Audits', () => {
  let component: Audits;
  let fixture: ComponentFixture<Audits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Audits, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(Audits);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
