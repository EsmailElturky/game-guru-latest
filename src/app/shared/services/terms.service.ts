import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';

export interface ITerm {
  id: number;
  title: string;
  description: string;
  statusName: string;
}

@Injectable({
  providedIn: 'root',
})
export class TermsService {
  private xhr = inject(Xhr);

  getAll(): Observable<ITerm[]> {
    return this.xhr.call<ITerm[]>({
      method: HttpMethod.GET,
      url: 'TermsAndConditions/GetAll',
    });
  }
}
