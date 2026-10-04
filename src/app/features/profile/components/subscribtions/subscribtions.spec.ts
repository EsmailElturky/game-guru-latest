import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { Subscribtions } from './subscribtions';
import { ProfileService } from '../../services/profile.service';

describe('Subscribtions', () => {
  let component: Subscribtions;
  let fixture: ComponentFixture<Subscribtions>;

  beforeEach(async () => {
    const profileService = jasmine.createSpyObj('ProfileService', ['getOrganizationMemberships']);
    profileService.getOrganizationMemberships.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Subscribtions, TranslateModule.forRoot()],
      providers: [{ provide: ProfileService, useValue: profileService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Subscribtions);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
