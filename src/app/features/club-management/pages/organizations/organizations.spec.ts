import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Organizations } from './organizations';
import { TranslateModule } from '@ngx-translate/core';

describe('Organizations', () => {
  let component: Organizations;
  let fixture: ComponentFixture<Organizations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Organizations, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(Organizations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
