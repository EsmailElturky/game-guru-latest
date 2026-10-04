import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@EsmailElturky/ui-kit';

@Component({
  selector: 'app-thank-you',
  imports: [TranslateModule, ButtonComponent],
  templateUrl: './thank-you.html',
  styleUrl: './thank-you.scss',
})
export class ThankYou {
  private router = inject(Router);

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}

