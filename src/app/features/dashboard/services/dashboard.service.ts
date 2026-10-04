import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import { Auth } from 'src/app/features/auth/services/auth';
import { IDashboardRequest, IDashboardResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly xhr = inject(Xhr);
  private readonly auth = inject(Auth);

  getDashboard(body: IDashboardRequest): Observable<IDashboardResponse> {
    const url = this.auth.isAdminApp()
      ? 'AdminAuth/GetDashboard'
      : 'OrganizationAuth/GetDashboard';

    return this.xhr.call<IDashboardResponse>({
      method: HttpMethod.POST,
      url,
      body,
    });
  }
}
