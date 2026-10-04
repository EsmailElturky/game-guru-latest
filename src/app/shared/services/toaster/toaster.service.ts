import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastType } from '../../enums';
import { ToastData } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);

  addToast(
    severity: ToastType,
    summary: string,
    detail: string,
    data?: ToastData,
    icon?: string,
    sticky: boolean = false,
    closable: boolean = false
  ): void {
    const toastIcon = {
      [ToastType.Success]: 'pi pi-check-circle',
      [ToastType.Error]: 'pi pi-times-circle',
      [ToastType.Info]: 'pi pi-info-circle',
      [ToastType.Warning]: 'pi pi-exclamation-triangle',
    };
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      data: data,
      icon: icon ?? toastIcon[severity],
      sticky: sticky,
      closable: closable,
      key: 'uiKitToast',
    });
  }

  clear(): void {
    if (this.messageService) {
      this.messageService.clear();
    }
  }
}
