import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import { IPaginationRequestBody } from 'src/app/shared/interfaces';
import {
  IOrganizationFacilityAction,
  IOrganizationFacilityDetail,
  IOrganizationFacilityListItem,
  IOrganizationFacilityListResponse,
} from '../interfaces/organization-facility.interface';

@Injectable({
  providedIn: 'root',
})
export class OrganizationFacilityService {
  private readonly xhr = inject(Xhr);

  getAll(body: IPaginationRequestBody): Observable<IOrganizationFacilityListResponse> {
    return this.xhr
      .call<IOrganizationFacilityListResponse | IOrganizationFacilityListItem[]>({
        method: HttpMethod.POST,
        url: 'OrganizationFacility/GetAll',
        body,
      })
      .pipe(map((res) => (Array.isArray(res) ? this.wrapListResponse(res, body) : res)));
  }

  private wrapListResponse(
    items: IOrganizationFacilityListItem[],
    body: IPaginationRequestBody,
  ): IOrganizationFacilityListResponse {
    const pageSize = body.pageSize || items.length || 10;
    const totalCount =
      items[0] && 'count' in items[0]
        ? Number((items[0] as { count?: number }).count)
        : items.length;
    return {
      items,
      totalCount: Number.isFinite(totalCount) ? totalCount : items.length,
      pageNo: body.pageNo,
      pageSize,
      currentPage: body.pageNo || 1,
      totalPages: pageSize > 0 ? Math.ceil(items.length / pageSize) : 1,
    };
  }

  getById(id: number): Observable<IOrganizationFacilityDetail> {
    return this.xhr.call<IOrganizationFacilityDetail>({
      method: HttpMethod.GET,
      url: `OrganizationFacility/${id}`,
    });
  }

  add(body: FormData): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: 'OrganizationFacility/Add',
      body,
    });
  }

  edit(body: FormData): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: 'OrganizationFacility/Edit',
      body,
    });
  }

  delete(id: number): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url: `OrganizationFacility/${id}`,
    });
  }

  action(body: IOrganizationFacilityAction): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: `OrganizationFacility/ActionType`,
      body,
    });
  }
}
