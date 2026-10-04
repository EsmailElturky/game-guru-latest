import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from 'src/environments/environment';

export type SupportedLanguage = 'en' | 'ar';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly translateService = inject(TranslateService);

  // Signal for current language
  private readonly _currentLang = signal<SupportedLanguage>(
    environment.defaultLanguage as SupportedLanguage,
  );

  // Public readonly signal for current language
  readonly currentLang = this._currentLang.asReadonly();

  // Signal for language change events from TranslateService
  readonly onLangChange = toSignal(this.translateService.onLangChange, {
    initialValue: { lang: 'en', translations: {} },
  });

  // Computed signal for checking if current language is RTL
  readonly isRTL = computed(() => this.currentLang() === 'ar');

  // Available languages
  readonly supportedLanguages: SupportedLanguage[] = ['en', 'ar'];

  constructor() {
    // Initialize default language
    this.translateService.setDefaultLang(environment.defaultLanguage);
    this.translateService.use(environment.defaultLanguage);

    // Sync signal with TranslateService changes
    effect(() => {
      const langChange = this.onLangChange();
      if (langChange) {
        this._currentLang.set(langChange.lang as SupportedLanguage);
      }
    });
  }

  /**
   * Change the current language
   * @param lang - The language code to switch to
   */
  changeLanguage(lang: SupportedLanguage): void {
    this.translateService.use(lang);
    this._currentLang.set(lang);

    // Update HTML lang and dir attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Store preference
    this.storeLanguagePreference(lang);
  }

  /**
   * Get instant translation for a key
   * @param key - Translation key
   * @param params - Optional interpolation parameters
   */
  instant(key: string, params?: object): string {
    return this.translateService.instant(key, params);
  }

  /**
   * Get translation as a signal
   * @param key - Translation key
   * @param params - Optional interpolation parameters
   */
  translate(key: string, params?: object) {
    return toSignal(this.translateService.get(key, params), {
      initialValue: key,
    });
  }

  /**
   * Get the browser language or default to English
   */
  getBrowserLang(): SupportedLanguage {
    const browserLang = this.translateService.getBrowserLang();
    return this.supportedLanguages.includes(browserLang as SupportedLanguage)
      ? (browserLang as SupportedLanguage)
      : 'en';
  }

  /**
   * Initialize language based on browser or stored preference
   */
  initializeLanguage(): void {
    const storedLang = localStorage.getItem('currentLang') || environment.defaultLanguage;
    this.changeLanguage(storedLang as SupportedLanguage);
  }

  /**
   * Store language preference in localStorage
   */
  private storeLanguagePreference(lang: SupportedLanguage): void {
    localStorage.setItem('currentLang', lang);
  }
}
