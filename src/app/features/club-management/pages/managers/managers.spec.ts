import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Managers } from './managers';
import { TranslateModule } from '@ngx-translate/core';

describe('Managers', () => {
  let component: Managers;
  let fixture: ComponentFixture<Managers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Managers, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(Managers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
