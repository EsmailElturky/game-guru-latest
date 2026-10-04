import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { IOrganizationNotification } from 'src/app/core/interfaces/organization-notification.interface';

@Component({
  selector: 'app-notification-detail-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, TranslateModule],
  templateUrl: './notification-detail-dialog.html',
  styleUrl: './notification-detail-dialog.scss',
})
export class NotificationDetailDialog {
  readonly notification = input<IOrganizationNotification | null>(null);
  readonly closed = output<void>();

  visible = signal(false);

  show(): void {
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
    this.closed.emit();
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) {
      return '—';
    }
    return new Date(iso).toLocaleString();
  }
}
