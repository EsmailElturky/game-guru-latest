import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { Profile } from './profile';
import { Auth } from 'src/app/features/auth/services/auth';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile, TranslateModule.forRoot(), RouterTestingModule],
      providers: [
        {
          provide: Auth,
          useValue: {
            isAdminApp: () => false,
            userData: () => ({ imageName: 'i.png', logoName: 'l.png', fullName: 'Test' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
