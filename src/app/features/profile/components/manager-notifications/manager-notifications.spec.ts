import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerNotifications } from './manager-notifications';

describe('ManagerNotifications', () => {
  let component: ManagerNotifications;
  let fixture: ComponentFixture<ManagerNotifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerNotifications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerNotifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
