import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { MessageService, ConfirmationService } from 'primeng/api';
import { routes } from './app.routes';
import { GameGuruPreset } from './core/theme/game-guru-preset';
import { provideUiKit, UIKIT_TRANSLATE_RESOLVER } from '@EsmailElturky/ui-kit';
import { TranslateService } from '@ngx-translate/core';
import { authInterceptor, errorInterceptor, loadingInterceptor } from './core/interceptors';

function translateResolver() {
  const translate = inject(TranslateService);
  return (key: string, value?: any) => {
    return translate.instant(key, value);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useClass: TranslateHttpLoader,
        },
      }),
    ),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
    provideUiKit({
      config: {
        inputText: {
          maxLength: 250,
        },
        textArea: {
          maxLength: 1000,
          rows: 3,
        },
      },
      theme: {
        preset: GameGuruPreset,
        options: {
          prefix: '',
          darkModeSelector: '.dark',
        },
      },
    }),
    {
      provide: UIKIT_TRANSLATE_RESOLVER,
      useFactory: translateResolver,
    },
    MessageService,
    ConfirmationService,
  ],
};
