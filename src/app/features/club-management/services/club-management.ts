import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { Xhr } from '../../../core/services/xhr/xhr';
import { HttpMethod } from 'src/app/core/enums';
import {
  IAddClubResponse,
  IOrganizationDetail,
  IOrganizationPaginatedRequest,
  IOrganizationPaginatedResponse,
} from '../interfaces';
import { ActionType } from '../../promo-codes/enums';

@Injectable({
  providedIn: 'root',
})
export class ClubManagementService {
  private xhr = inject(Xhr);

  addClub(body: FormData): Observable<IAddClubResponse> {
    return this.xhr.call<IAddClubResponse>({
      method: HttpMethod.POST,
      url: 'Organization/AddClub',
      body,
    });
  }

  getOrganizationById(id: number): Observable<IOrganizationDetail> {
    return this.xhr.call<IOrganizationDetail>({
      method: HttpMethod.GET,
      url: `Organization/${id}`,
    });
  }

  editOrganizationProfile(body: FormData): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: 'Organization/EditProfile',
      body,
    });
  }

  getOrganizations(
    body: IOrganizationPaginatedRequest,
  ): Observable<IOrganizationPaginatedResponse> {
    return this.xhr.call<IOrganizationPaginatedResponse>({
      method: HttpMethod.POST,
      url: 'Organization/GetClub',
      body,
    });
  }

  deleteOrganization(id: number) {
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url: `Organization/${id}`,
    });
  }

  actionOrganization(id: number, actionType: ActionType) {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: `Club/ActionType`,
      body: { id: Number(id), actionType: Number(actionType) },
    });
  }
}
