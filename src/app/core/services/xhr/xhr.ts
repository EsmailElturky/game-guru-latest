import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams, HttpEvent } from '@angular/common/http';
import { catchError, defer, map, Observable, throwError } from 'rxjs';
import { SKIP_AUTH, SKIP_LOADING } from '../../interceptors/http/http-context.tokens';
import { Connection } from '../connection/connection';
import { ToastService } from 'src/app/shared/services';
import { ToastType } from 'src/app/shared/enums';
import { Primitive, XhrCallConfig, XhrParameters, XhrResponse } from '../../interfaces';
import { TranslationService } from '../translation.service';

@Injectable({
  providedIn: 'root',
})
export class Xhr {
  private readonly translateService = inject(TranslationService);
  private readonly connection = inject(Connection);
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);

  call<T>(config: XhrCallConfig): Observable<T> {
    if (!this.connection.connected()) {
      this.toastService.addToast(
        ToastType.Error,
        this.translateService.instant('errors.errorOccurred'),
        this.translateService.instant('errors.noInternetConnection'),
      );
      return throwError(() => new Error('No internet connection'));
    }

    return defer<Observable<T>>(() =>
      this.http
        .request<XhrResponse<T>>(config.method, config.url, {
          body: config.body ?? null,
          ...this.buildOptions(config.params),
        })
        .pipe(
          map((res) => {
            if (res && res.isSuccess === false && !config.skipIsSuccessCheck) {
              throw res;
            }
            return res.value;
          }),
          catchError((err) => throwError(() => err)),
        ),
    );
  }

  upload<T>(
    url: string,
    file: File | File[],
    fieldName = 'file',
    additionalData?: Record<string, Primitive>,
    options?: XhrParameters,
  ): Observable<HttpEvent<T>> {
    const formData = new FormData();

    if (Array.isArray(file)) {
      file.forEach((f) => formData.append(fieldName, f, f.name));
    } else {
      formData.append(fieldName, file, file.name);
    }

    if (additionalData) {
      for (const [key, value] of Object.entries(additionalData)) {
        formData.append(key, String(value));
      }
    }

    return this.http.post<T>(url, formData, {
      ...this.buildOptions(options),
      reportProgress: true,
      observe: 'events',
    });
  }

  private buildOptions(options?: XhrParameters): Record<string, unknown> {
    if (!options) return {};

    const context = options.context ?? new HttpContext();

    if (options.skipAuth) {
      context.set(SKIP_AUTH, true);
    }

    if (options.skipLoading) {
      context.set(SKIP_LOADING, true);
    }

    const httpOptions: Record<string, unknown> = { context };

    if (options.params) {
      httpOptions['params'] =
        options.params instanceof HttpParams
          ? options.params
          : new HttpParams({ fromObject: options.params as Record<string, string> });
    }

    if (options.headers) {
      httpOptions['headers'] =
        options.headers instanceof HttpHeaders
          ? options.headers
          : new HttpHeaders(options.headers as Record<string, string>);
    }

    return httpOptions;
  }
}
