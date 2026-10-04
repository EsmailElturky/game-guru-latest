import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './core/services';
import { Loading } from './core/services/loading/loading';
import { ToastComponent } from '@EsmailElturky/ui-kit';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ProgressSpinnerModule, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Game-Guru');
  private readonly translationService = inject(TranslationService);
  protected readonly loading = inject(Loading);

  constructor() {
    // Initialize language from browser or stored preference
    this.translationService.initializeLanguage();
    this.fixLeafletIcons();
  }

  private fixLeafletIcons() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });
  }
}
