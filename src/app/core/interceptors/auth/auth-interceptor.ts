import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { inject } from '@angular/core';
import { SKIP_AUTH } from '../http/http-context.tokens';
import { LocalStorage } from '../../services';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorageService = inject(LocalStorage);

  const isLocalAsset = req.url.startsWith('./assets') || req.url.startsWith('assets');
  if (isLocalAsset) {
    return next(req);
  }

  const skipAuth = req.context.get(SKIP_AUTH);
  const token = localStorageService.getItem(environment.tokenPropertyName);
  const currentLang = localStorageService.getItem('currentLang') || environment.defaultLanguage;

  const isAbsolute = req.url.startsWith('http');

  const headers: Record<string, string> = {
    'Accept-Language': currentLang,
  };

  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cloned = req.clone({
    url: isAbsolute ? req.url : `${environment.api}${req.url}`,
    setHeaders: headers,
  });

  return next(cloned);
};
