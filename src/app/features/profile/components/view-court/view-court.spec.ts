import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { ViewCourt } from './view-court';
import { OrganizationFacilityService } from '../../services/organization-facility.service';

describe('ViewCourt', () => {
  let component: ViewCourt;
  let fixture: ComponentFixture<ViewCourt>;

  beforeEach(async () => {
    const organizationFacilityService = jasmine.createSpyObj('OrganizationFacilityService', [
      'getById',
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

    await TestBed.configureTestingModule({
      imports: [ViewCourt, TranslateModule.forRoot()],
      providers: [
        { provide: OrganizationFacilityService, useValue: organizationFacilityService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewCourt);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
