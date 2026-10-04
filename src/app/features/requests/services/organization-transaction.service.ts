import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import {
  IOrganizationTransactionApproveRequest,
  IOrganizationTransactionDetail,
  IOrganizationTransactionDisapproveRequest,
  IOrganizationTransactionListQuery,
  IOrganizationTransactionListResponse,
} from '../interfaces/organization-transaction.interface';

@Injectable({
  providedIn: 'root',
})
export class OrganizationTransactionService {
  private readonly xhr = inject(Xhr);

  getWaitingApproval(
    body: IOrganizationTransactionListQuery,
  ): Observable<IOrganizationTransactionListResponse> {
    return this.xhr.call<IOrganizationTransactionListResponse>({
      method: HttpMethod.POST,
      url: 'OrganizationTransaction/GetWaitingApproval',
      body,
    });
  }

  getCancelled(
    body: IOrganizationTransactionListQuery,
  ): Observable<IOrganizationTransactionListResponse> {
    return this.xhr.call<IOrganizationTransactionListResponse>({
      method: HttpMethod.POST,
      url: 'OrganizationTransaction/GetCancelle',
      body,
    });
  }

  getById(id: number): Observable<IOrganizationTransactionDetail> {
    return this.xhr.call<IOrganizationTransactionDetail>({
      method: HttpMethod.GET,
      url: `OrganizationTransaction/${id}`,
    });
  }

  approve(body: IOrganizationTransactionApproveRequest): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: 'OrganizationTransaction/Approve',
      body,
    });
  }

  disapprove(body: IOrganizationTransactionDisapproveRequest): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: 'OrganizationTransaction/Disapprove',
      body,
    });
  }
}
