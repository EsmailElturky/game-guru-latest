import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-requests-layout',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './requests-layout.html',
  styleUrl: './requests-layout.scss',
})
export class RequestsLayout {}
