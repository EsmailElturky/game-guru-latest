import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarMenuItems } from './sidebar-menu-items';

describe('SidebarMenuItems', () => {
  let component: SidebarMenuItems;
  let fixture: ComponentFixture<SidebarMenuItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarMenuItems]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarMenuItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
