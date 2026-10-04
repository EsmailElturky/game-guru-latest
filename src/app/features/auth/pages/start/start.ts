import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';
import { TranslationService } from 'src/app/core/services';

@Component({
  selector: 'app-start',
  imports: [ButtonComponent , RouterLink, TranslateModule],
  templateUrl: './start.html',
  styleUrl: './start.scss',
})
export class Start {  
  private translateService = inject(TranslationService);
  language = this.translateService.currentLang;

  ngOnInit(): void {    
  }
  

}
