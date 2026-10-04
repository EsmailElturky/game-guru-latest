import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Facilities } from './facilities';
import { TranslateModule } from '@ngx-translate/core';

describe('Facilities', () => {
  let component: Facilities;
  let fixture: ComponentFixture<Facilities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Facilities, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(Facilities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
