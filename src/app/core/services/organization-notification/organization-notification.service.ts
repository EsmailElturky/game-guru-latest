import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { IOrganizationNotificationListResponse } from 'src/app/core/interfaces/organization-notification.interface';
import { Xhr } from 'src/app/core/services';

@Injectable({
  providedIn: 'root',
})
export class OrganizationNotificationService {
  private readonly xhr = inject(Xhr);

  getAll(pageNo: number, pageSize: number): Observable<IOrganizationNotificationListResponse> {
    return this.xhr.call<IOrganizationNotificationListResponse>({
      method: HttpMethod.POST,
      url: 'OrganizationNotification/GetAll',
      body: { pageNo, pageSize },
      params: { skipLoading: true },
    });
  }

  markAsRead(id: number): Observable<unknown> {
    return this.xhr.call({
      method: HttpMethod.POST,
      url: `OrganizationNotification/MarkAsRead/${id}`,
      params: { skipLoading: true },
    });
  }
}
