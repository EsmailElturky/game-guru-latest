import { Component, inject, model, output, signal } from '@angular/core';
import { SidebarMenuItem } from '../../interfaces';
import { BadgeModule } from 'primeng/badge';
import { PanelMenuModule } from 'primeng/panelmenu';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar-menu-items',
  imports: [BadgeModule, PanelMenuModule, NgClass, TranslateModule],
  templateUrl: './sidebar-menu-items.html',
  styleUrl: './sidebar-menu-items.scss',
})
export class SidebarMenuItems {
  router = inject(Router);

  /**
   * Get the side menu item.
   */
  sideMenuItem = model<SidebarMenuItem>();

  /**
   * Emit the route changed event.
   */
  routChanged = output();
  /**
   * Get the expanded state of the side menu item.
   */
  expanded = signal(this.sideMenuItem()?.expanded ?? false);
  /**
   * Get the current route from the router events.
   */
  currentRoute = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      distinctUntilChanged(),
    ),
  );

  /**
   * Check if the route is active.
   * @param route The route to check.
   * @returns True if the route is active, false otherwise.
   */
  isRouteActive(route: string): boolean {
    return [this.currentRoute(), this.router.url].includes(route);
  }

  /**
   * Navigate to the given route.
   * @param route The route to navigate to.
   */
  navigate(route: string): void {
    this.router.navigate([route]);
    this.routChanged.emit();
  }
}
