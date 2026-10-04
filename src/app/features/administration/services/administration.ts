import { Observable, map } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Xhr } from '../../../core/services/xhr/xhr';
import { downloadBlob, parseContentDispositionFilename } from 'src/app/shared/functions';
import { HttpMethod } from 'src/app/core/enums';
import {
  IRole,
  IRoleCreate,
  IUser,
  IUserPaginatedRequest,
  ICoach,
  ICoachPaginatedRequest,
} from '../interfaces';
import { IPaginationResponse } from 'src/app/shared/interfaces';
import { ActionType } from '../../promo-codes/enums';
import { Auth } from '../../auth/services/auth';

@Injectable({
  providedIn: 'root',
})
export class AdministrationService {
  private xhr = inject(Xhr);
  private http = inject(HttpClient);
  private auth = inject(Auth);
  isAppAdmin = this.auth.isAdminApp;

  getRoles(): Observable<IRole[]> {
    const url = this.isAppAdmin() ? 'AdminGroupRole' : 'OrganizationGroupRole';
    return this.xhr.call<IRole[]>({
      method: HttpMethod.GET,
      url,
    });
  }

  getPermissions(): Observable<IRole[]> {
    const url = this.isAppAdmin() ? 'AdminPageRoles' : 'OrganizationPageRoles';
    return this.xhr.call<IRole[]>({
      method: HttpMethod.GET,
      url: 'AdminPageRoles',
    });
  }

  deleteRole(id: number) {
    const url = this.isAppAdmin() ? `AdminGroupRole/${id}` : `OrganizationGroupRole/${id}`;
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url,
    });
  }

  roleAction(body: { id: number; actionType: ActionType }): Observable<void> {
    const url = this.isAppAdmin()
      ? 'AdminGroupRole/ActionType'
      : 'OrganizationGroupRole/ActionType';
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url,
      body: { id: Number(body.id), actionType: body.actionType },
    });
  }

  getRoleById(id: number): Observable<IRole> {
    const url = this.isAppAdmin() ? `AdminGroupRole/${id}` : `OrganizationGroupRole/${id}`;
    return this.xhr.call<IRole>({
      method: HttpMethod.GET,
      url,
    });
  }

  createRole(body: IRoleCreate): Observable<IRole> {
    const url = this.isAppAdmin() ? 'AdminGroupRole' : 'OrganizationGroupRole';
    return this.xhr.call<IRole>({
      method: HttpMethod.POST,
      url,
      body,
    });
  }

  updateRole(body: IRoleCreate): Observable<IRole> {
    const url = this.isAppAdmin() ? 'AdminGroupRole' : 'OrganizationGroupRole';
    return this.xhr.call<IRole>({
      method: HttpMethod.PUT,
      url,
      body,
    });
  }

  getUsers(body: IUserPaginatedRequest): Observable<IPaginationResponse<IUser>> {
    const url = this.isAppAdmin() ? 'AdminAuth/GetUser' : 'OrganizationAuth/GetAllUser';
    return this.xhr.call<IPaginationResponse<IUser>>({
      method: HttpMethod.POST,
      url,
      body,
    });
  }

  deleteUser(id: string) {
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url: `AdminAuth/${id}`,
    });
  }

  deactivateUser(id: string) {
    return this.xhr.call<void>({
      method: HttpMethod.PATCH,
      url: `AdminAuth/${id}/deactivate`,
    });
  }

  actionUser(id: string, actionType: ActionType) {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: `AdminAuth/ActionType`,
      body: { id: Number(id), actionType: Number(actionType) },
    });
  }

  addUser(body: FormData): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: 'AdminAuth/Add',
      body,
    });
  }

  getUserById(id: string): Observable<IUser> {
    return this.xhr.call<IUser>({
      method: HttpMethod.GET,
      url: `AdminAuth/GetById/${id}`,
    });
  }

  updateUser(body: FormData): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: 'AdminAuth/Edit',
      body,
    });
  }

  getAllCoaches(body: ICoachPaginatedRequest): Observable<IPaginationResponse<ICoach>> {
    return this.xhr
      .call<ICoach[] | IPaginationResponse<ICoach>>({
        method: HttpMethod.POST,
        url: 'OrganizationAuth/GetAllCoach',
        body,
      })
      .pipe(map((res) => this.normalizeCoachListResponse(res, body)));
  }

  getCoachById(id: number): Observable<ICoach> {
    return this.xhr.call<ICoach>({
      method: HttpMethod.GET,
      url: `OrganizationAuth/GetCoach/${id}`,
    });
  }

  addCoach(body: FormData): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: 'OrganizationAuth/AddCoach',
      body,
    });
  }

  updateCoach(body: FormData): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: 'OrganizationAuth/EditCoach',
      body,
    });
  }

  private normalizeCoachListResponse(
    res: ICoach[] | IPaginationResponse<ICoach>,
    body: ICoachPaginatedRequest,
  ): IPaginationResponse<ICoach> {
    if (Array.isArray(res)) {
      const items = res;
      const pageSize = Math.max(1, body.pageSize);
      return {
        items,
        totalCount: items.length,
        currentPage: body.pageNo,
        pageNo: body.pageNo,
        pageSize: body.pageSize,
        totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
      };
    }
    return res;
  }

  takeAction(id: number, actionType: ActionType): Observable<void> {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: `OrganizationAuth/ActionType`,
      body: { id: Number(id), actionType: Number(actionType) },
    });
  }
}
