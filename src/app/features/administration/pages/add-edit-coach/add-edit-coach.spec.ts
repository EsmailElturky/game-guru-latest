import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEditCoach } from './add-edit-coach';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('AddEditCoach', () => {
  let component: AddEditCoach;
  let fixture: ComponentFixture<AddEditCoach>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditCoach, TranslateModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditCoach);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
