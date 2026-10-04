import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import { IPaginationRequestBody, IPaginationResponse } from 'src/app/shared/interfaces';
import { IEndUser } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private xhr = inject(Xhr);

  getAll(body: IPaginationRequestBody): Observable<IPaginationResponse<IEndUser>> {
    return this.xhr
      .call<IPaginationResponse<IEndUser> | IEndUser[]>({
        method: HttpMethod.POST,
        url: 'EndUserAuth/GetAll',
        body,
      })
      .pipe(map((res) => (Array.isArray(res) ? this.wrapListResponse(res, body) : res)));
  }

  private wrapListResponse(
    items: IEndUser[],
    body: IPaginationRequestBody,
  ): IPaginationResponse<IEndUser> {
    const totalCount = items[0]?.count ?? items.length;
    const pageSize = body.pageSize || items.length || 10;
    return {
      items,
      totalCount,
      pageNo: body.pageNo,
      pageSize,
      currentPage: body.pageNo || 1,
      totalPages: pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1,
    };
  }
}
