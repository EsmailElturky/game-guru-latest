import { HttpInterceptorFn } from '@angular/common/http';
import { Loading } from '../../services';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { SKIP_LOADING } from '../http/http-context.tokens';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const isLocalAsset = req.url.startsWith('./assets') || req.url.startsWith('assets');
  if (isLocalAsset || req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  const loadingService = inject(Loading);
  loadingService.start();
  return next(req).pipe(
    finalize(() => {
      loadingService.stop();
    }),
  );
};
