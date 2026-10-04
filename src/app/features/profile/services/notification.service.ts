import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private xhr = inject(Xhr);

  getNotifications(pageNo: number, pageSize: number): Observable<any> {
    return this.xhr.call<any>({
      method: HttpMethod.POST,
      url: 'AdminNotification/GetAll',
      body: { pageNo, pageSize },
    });
  }
}
