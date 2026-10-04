import { inject, Injectable } from '@angular/core';
import { HttpMethod } from 'src/app/core/enums';
import { Xhr } from 'src/app/core/services';
import { LookupsEnum, CascadeLookupsEnum } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root',
})
export class Lookups {
  private xhr = inject(Xhr);
  getLookup(lookupName: LookupsEnum) {
    return this.xhr.call<any>({
      method: HttpMethod.GET,
      url: `Lookups/${lookupName}`,
    });
  }

  /** Same as {@link getLookup} but unauthenticated (e.g. public signup). */
  getLookupPublic(lookupName: LookupsEnum) {
    return this.xhr.call<any>({
      method: HttpMethod.GET,
      url: `Lookups/${lookupName}`,
      params: { skipAuth: true },
    });
  }

  getCascadeLookups(lookupName: CascadeLookupsEnum, parentId: number) {
    return this.xhr.call<any>({
      method: HttpMethod.GET,
      url: `Lookups/${lookupName}/${parentId}`,
    });
  }
}
