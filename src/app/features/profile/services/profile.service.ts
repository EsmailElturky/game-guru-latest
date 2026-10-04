import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import { IChangePasswordRequest, IOrganizationMembership } from '../interfaces/profile.interface';
import { Auth } from '../../auth/services/auth';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private xhr = inject(Xhr);
  private auth = inject(Auth);
  isAdminApp = this.auth.isAdminApp;

  changePassword(body: IChangePasswordRequest): Observable<void> {
    const url = this.isAdminApp() ? 'AdminAuth/changePassword' : 'OrganizationAuth/changePassword';
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url,
      body,
    });
  }

  uploadLogo(formData: FormData): Observable<void> {
    const url = this.isAdminApp() ? 'AdminAuth/UploadImageProfile' : 'OrganizationAuth/UploadLogo';
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url,
      body: formData,
    });
  }

  getMyProfile(): Observable<any> {
    const url = this.isAdminApp() ? 'AdminAuth/GetMyProfile' : 'OrganizationAuth/GetMyProfile';
    return this.xhr.call<any>({
      method: HttpMethod.GET,
      url,
    });
  }

  editProfile(body: FormData): Observable<void> {
    const url = this.isAdminApp() ? 'AdminAuth/EditProfile' : 'OrganizationAuth/EditProfile';
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url,
      body,
    });
  }

  getOrganizationMemberships(): Observable<IOrganizationMembership[]> {
    return this.xhr.call<IOrganizationMembership[]>({
      method: HttpMethod.GET,
      url: 'OrganizationMembership/GetAll',
    });
  }
}
