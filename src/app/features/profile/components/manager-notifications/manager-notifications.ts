import { Component, inject, signal, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent, TableComponent } from '@EsmailElturky/ui-kit';
import { AddNotificationDialog } from '../add-notification-dialog/add-notification-dialog';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-manager-notifications',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent, TableComponent, AddNotificationDialog],
  templateUrl: './manager-notifications.html',
  styleUrl: './manager-notifications.scss',
})
export class ManagerNotifications implements OnInit {
  private translateService = inject(TranslateService);
  private notificationService = inject(NotificationService);

  translate = (key: string) => this.translateService.instant(key);

  @ViewChild('addNotificationDialog') addNotificationDialog!: AddNotificationDialog;

  notifications = signal<any[]>([]);
  totalCount = signal(0);
  pageNo = signal(1);
  pageSize = signal(10);

  tableColumns = signal<any>([
    { field: 'id', header: 'ID', width: '100px' },
    { field: 'message', header: this.translate('table.notificationTitle'), width: 'auto' },
  ]);

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService
      .getNotifications(this.pageNo() - 1, this.pageSize())
      .subscribe((res) => {
        this.notifications.set(res.items);
        this.totalCount.set(res.totalCount);
      });
  }

  onPageChanged(event: any) {
    if (event != this.pageNo()) {
      this.pageNo.set(event.page + 1);
      this.loadNotifications();
    }
  }

  onRowsPerPageChanged(event: any) {
    if (event != this.pageSize()) {
      this.pageSize.set(event);
      this.loadNotifications();
    }
  }

  showAddNotificationDialog() {
    this.addNotificationDialog.show();
  }

  onNotificationSave(data: any) {
    this.loadNotifications();
  }
}
