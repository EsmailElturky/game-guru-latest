import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingReport } from './booking-report';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';

describe('BookingReport', () => {
  let component: BookingReport;
  let fixture: ComponentFixture<BookingReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingReport, TranslateModule.forRoot()],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
