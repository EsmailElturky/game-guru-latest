import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { Courts } from './courts';
import { OrganizationFacilityService } from '../../services/organization-facility.service';
import { Auth } from 'src/app/features/auth/services/auth';
import { LocalStorage } from 'src/app/core/services';

describe('Courts', () => {
  let component: Courts;
  let fixture: ComponentFixture<Courts>;

  beforeEach(async () => {
    const organizationFacilityService = jasmine.createSpyObj('OrganizationFacilityService', [
      'getAll',
    ]);
    organizationFacilityService.getAll.and.returnValue(
      of({
        items: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      }),
    );

    const auth = jasmine.createSpyObj('Auth', ['convertTokenJWT']);
    auth.convertTokenJWT.and.returnValue({ organizationId: '20' });

    const localStorage = jasmine.createSpyObj('LocalStorage', ['getItem']);
    localStorage.getItem.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [Courts, TranslateModule.forRoot()],
      providers: [
        { provide: OrganizationFacilityService, useValue: organizationFacilityService },
        { provide: Auth, useValue: auth },
        { provide: LocalStorage, useValue: localStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Courts);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
