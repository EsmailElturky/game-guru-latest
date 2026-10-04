import {
  HttpErrorResponse,
  HttpEventType,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { ToastService } from 'src/app/shared/services';
import { ToastType } from 'src/app/shared/enums';
import { TranslationService } from '../../services';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const isLocalAsset = req.url.startsWith('./assets') || req.url.startsWith('assets');
  if (isLocalAsset) {
    return next(req);
  }

  const toastService = inject(ToastService);
  const translateService = inject(TranslationService);
  const errorToastHeader = translateService.instant('errors.errorOccurred');
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as any;
        if (body && body.isSuccess === false) {
          if (body.errors && body.errors.length > 0) {
            body.errors.forEach((error: string) => {
              toastService.addToast(ToastType.Error, errorToastHeader, error);
            });
          } else if (body.message) {
            toastService.addToast(ToastType.Error, errorToastHeader, body.message);
          }
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (req.url.includes('api.tap.company')) {
        const errBody = error.error as { errors?: Array<{ description?: string }> } | undefined;
        const tapMsg =
          errBody?.errors?.[0]?.description ??
          (typeof error.error === 'object' && error.error && 'message' in error.error
            ? String((error.error as { message?: string }).message)
            : null);
        toastService.addToast(
          ToastType.Error,
          errorToastHeader,
          tapMsg ?? translateService.instant('errors.unexpectedError'),
        );
        return throwError(() => error);
      }

      switch (error.status) {
        case 401:
          toastService.addToast(
            ToastType.Error,
            errorToastHeader,
            translateService.instant('errors.unauthorized'),
          );
          router.navigate(['/auth/login']);
          break;

        case 403:
          toastService.addToast(
            ToastType.Error,
            errorToastHeader,
            translateService.instant('errors.forbidden'),
          );
          break;

        case 500:
          toastService.addToast(
            ToastType.Error,
            errorToastHeader,
            translateService.instant('errors.serverError'),
          );
          break;

        default:
          toastService.addToast(
            ToastType.Error,
            errorToastHeader,
            translateService.instant('errors.unexpectedError'),
          );
      }

      return throwError(() => error);
    }),
  );
};
