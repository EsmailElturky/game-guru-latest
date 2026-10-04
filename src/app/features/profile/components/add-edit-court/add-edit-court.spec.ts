import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AddEditCourt } from './add-edit-court';
import { OrganizationFacilityService } from '../../services/organization-facility.service';
import { LocalStorage } from 'src/app/core/services';
import { Lookups } from 'src/app/shared/services';

describe('AddEditCourt', () => {
  let component: AddEditCourt;
  let fixture: ComponentFixture<AddEditCourt>;

  beforeEach(async () => {
    const organizationFacilityService = jasmine.createSpyObj('OrganizationFacilityService', [
      'getById',
      'add',
      'edit',
    ]);
    organizationFacilityService.getById.and.returnValue(
      of({
        id: 1,
        organizationId: 20,
        name: 'Court',
        nameAr: 'ملعب',
        description: null,
        descriptionAr: null,
        width: 5,
        height: 5,
        sports: [{ id: 1, name: 'Sport A' }],
        attachments: [],
      }),
    );

    const lookups = jasmine.createSpyObj('Lookups', ['getLookup']);
    lookups.getLookup.and.returnValue(of([{ id: '1', name: 'Sport' }]));

    const localStorage = jasmine.createSpyObj('LocalStorage', ['getItem']);
    localStorage.getItem.and.callFake((key: string) =>
      key === 'game_guru_user' ? '{"organizationId":20}' : null,
    );

    await TestBed.configureTestingModule({
      imports: [AddEditCourt, TranslateModule.forRoot()],
      providers: [
        { provide: OrganizationFacilityService, useValue: organizationFacilityService },
        { provide: Lookups, useValue: lookups },
        { provide: LocalStorage, useValue: localStorage },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: { url: [{ path: 'edit-court' }] },
          },
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditCourt);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
