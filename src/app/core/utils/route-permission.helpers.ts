import { Route } from '@angular/router';
import { AppPage } from '../constants/app-pages';
import { permissionGuard } from '../guards/permission-guard';

type PageRouteConfig = Omit<Route, 'canActivate' | 'data'> & { page: AppPage };

function withGuard(route: Route, data: Record<string, unknown>): Route {
  return {
    ...route,
    canActivate: [permissionGuard],
    data: { ...route.data, ...data },
  };
}

export function pageRoute(config: PageRouteConfig): Route {
  const { page, ...route } = config;
  return withGuard(route, { page });
}

export function addPageRoute(config: PageRouteConfig): Route {
  const { page, ...route } = config;
  return withGuard(route, { page, isAdd: true });
}

export function editPageRoute(config: PageRouteConfig): Route {
  const { page, ...route } = config;
  return withGuard(route, { page, isEdit: true });
}

export function viewPageRoute(config: PageRouteConfig): Route {
  const { page, ...route } = config;
  return withGuard(route, { page, requiresView: true });
}
