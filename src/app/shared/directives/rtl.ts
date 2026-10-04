import { Directive, inject, HostBinding } from '@angular/core';
import { TranslationService } from 'src/app/core/services';

@Directive({
  selector: '[appRtl]',
  standalone: true,
})
export class Rtl {
  private readonly translationService = inject(TranslationService);

  @HostBinding('attr.dir')
  get dir(): 'rtl' | 'ltr' {
    return this.translationService.isRTL() ? 'rtl' : 'ltr';
  }

  @HostBinding('class.rtl')
  get isRtl(): boolean {
    return this.translationService.isRTL();
  }

  // add css class to element
  @HostBinding('class')
  get cssClass(): string {
    return this.translationService.isRTL() ? 'rtl' : 'ltr';
  }
}
