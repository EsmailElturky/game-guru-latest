import { Observable } from 'rxjs';
import { Xhr } from './../../../../core/services/xhr/xhr';
import { inject, Injectable } from '@angular/core';
import {
  ICityCreate,
  ICityList,
  ISportById,
  ISportCreate,
  ISportList,
  ISlideList,
  ISlideById,
  IIntroList,
  IIntroById,
  IFaqList,
  IFaqById,
  IBilingualPolicy,
} from '../../interfaces';
import { HttpMethod } from 'src/app/core/enums';
import { IConfiguration } from '../../interfaces/configuration.interface';
import { ActionType } from 'src/app/features/promo-codes/enums';
import { IPaginationResponse } from 'src/app/shared/interfaces';
import { IPaginationRequestBody } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsService {
  private xhr = inject(Xhr);

  getCities(): Observable<ICityList[]> {
    return this.xhr.call<ICityList[]>({
      method: HttpMethod.GET,
      url: 'City',
    });
  }

  getCitiesPaginated(body: IPaginationRequestBody): Observable<IPaginationResponse<ICityList>> {
    return this.xhr.call<IPaginationResponse<ICityList>>({
      method: HttpMethod.POST,
      body,
      url: 'City/GetAll',
    });
  }

  /** Cities list without auth header (public signup). */
  getCitiesPublic(): Observable<ICityList[]> {
    return this.xhr.call<ICityList[]>({
      method: HttpMethod.GET,
      url: 'City',
      params: { skipAuth: true },
    });
  }

  createCity(body: any) {
    return this.xhr.call<ICityList>({
      method: HttpMethod.POST,
      url: 'City',
      body,
    });
  }

  getCityById(id: string): Observable<ICityList> {
    return this.xhr.call<ICityList>({
      method: HttpMethod.GET,
      url: `City/${id}`,
    });
  }

  updateCity(body: ICityCreate) {
    return this.xhr.call<ICityList>({
      method: HttpMethod.PUT,
      url: `City`,
      body,
    });
  }

  deleteCity(id: string) {
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url: `City/${id}`,
    });
  }

  deactivateCity(id: string) {
    return this.xhr.call<void>({
      method: HttpMethod.PATCH,
      url: `City/${id}/deactivate`,
    });
  }

  getSports(body: IPaginationRequestBody): Observable<IPaginationResponse<ISportList>> {
    return this.xhr.call<IPaginationResponse<ISportList>>({
      method: HttpMethod.POST,
      body,
      url: 'Sport/GetAll',
    });
  }

  createSport(formData: FormData) {
    // send in form data
    return this.xhr.call<ISportList>({
      method: HttpMethod.POST,
      url: 'Sport',
      body: formData,
    });
  }

  getSportById(id: string): Observable<ISportById> {
    return this.xhr.call<ISportById>({
      method: HttpMethod.GET,
      url: `Sport/${id}`,
    });
  }

  updateSport(formData: FormData) {
    return this.xhr.call<ISportList>({
      method: HttpMethod.PUT,
      url: `Sport`,
      body: formData,
    });
  }

  deleteSport(id: string) {
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url: `Sport/${id}`,
    });
  }

  sportAction(id: string, actionType: ActionType) {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: `Sport/ActionType`,
      body: { id: Number(id), actionType: Number(actionType) },
    });
  }

  getConfiguration(): Observable<IConfiguration> {
    return this.xhr.call<IConfiguration>({
      method: HttpMethod.GET,
      url: 'AppSetting',
    });
  }

  updateConfiguration(body: IConfiguration) {
    return this.xhr.call<IConfiguration>({
      method: HttpMethod.PUT,
      url: 'AppSetting',
      body,
    });
  }

  getSlides(): Observable<ISlideList[]> {
    return this.xhr.call<ISlideList[]>({
      method: HttpMethod.GET,
      url: 'Slide/GetAll',
    });
  }

  getSlideById(id: string | number): Observable<ISlideById> {
    return this.xhr.call<ISlideById>({
      method: HttpMethod.GET,
      url: `Slide/${id}`,
    });
  }

  createSlide(formData: FormData) {
    return this.xhr.call<any>({
      method: HttpMethod.POST,
      url: 'Slide/Add',
      body: formData,
    });
  }

  updateSlide(formData: FormData) {
    return this.xhr.call<any>({
      method: HttpMethod.PUT, // Assuming Add/Edit might use same or similar logic if it's POST Slide/Add
      url: 'Slide/Edit', // Usually update is PUT, but I'll follow Add if not specified otherwise or check if there is an Update api.
      body: formData,
    });
  }

  deleteSlide(id: string | number) {
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url: `Slide/${id}`,
    });
  }

  slideAction(id: string | number, actionType: ActionType) {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: 'Slide/ActionType',
      body: { id: Number(id), actionType: Number(actionType) },
    });
  }

  getIntros(): Observable<IIntroList[]> {
    return this.xhr.call<IIntroList[]>({
      method: HttpMethod.GET,
      url: 'Intro/GetAll',
    });
  }

  getIntroById(id: string | number): Observable<IIntroById> {
    return this.xhr.call<IIntroById>({
      method: HttpMethod.GET,
      url: `Intro/${id}`,
    });
  }

  createIntro(formData: FormData) {
    return this.xhr.call<any>({
      method: HttpMethod.POST,
      url: 'Intro/Add',
      body: formData,
    });
  }

  updateIntro(formData: FormData) {
    return this.xhr.call<any>({
      method: HttpMethod.PUT,
      url: 'Intro/Edit',
      body: formData,
    });
  }

  deleteIntro(id: string | number) {
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url: `Intro/${id}`,
    });
  }

  introAction(id: string | number, actionType: ActionType) {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: 'Intro/ActionType',
      body: { id: Number(id), actionType: Number(actionType) },
    });
  }

  getFaqs(): Observable<IFaqList[]> {
    return this.xhr.call<IFaqList[]>({
      method: HttpMethod.GET,
      url: 'Faq/GetAll',
    });
  }

  getFaqById(id: string | number): Observable<IFaqById> {
    return this.xhr.call<IFaqById>({
      method: HttpMethod.GET,
      url: `Faq/${id}`,
    });
  }

  createFaq(formData: FormData) {
    return this.xhr.call<any>({
      method: HttpMethod.POST,
      url: 'Faq/Add',
      body: formData,
    });
  }

  updateFaq(formData: FormData) {
    return this.xhr.call<any>({
      method: HttpMethod.PUT,
      url: 'Faq/Edit',
      body: formData,
    });
  }

  deleteFaq(id: string | number) {
    return this.xhr.call<void>({
      method: HttpMethod.DELETE,
      url: `Faq/${id}`,
    });
  }

  faqAction(id: string | number, actionType: ActionType) {
    return this.xhr.call<void>({
      method: HttpMethod.POST,
      url: 'Faq/ActionType',
      body: { id: Number(id), actionType: Number(actionType) },
    });
  }

  getCancelPolicy(): Observable<IBilingualPolicy> {
    return this.xhr.call<IBilingualPolicy>({
      method: HttpMethod.GET,
      url: 'CancelPolicy/Get',
    });
  }

  editCancelPolicy(body: IBilingualPolicy) {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: 'CancelPolicy/Edit',
      body,
    });
  }

  getPrivacyPolicy(): Observable<IBilingualPolicy> {
    return this.xhr.call<IBilingualPolicy>({
      method: HttpMethod.GET,
      url: 'PrivacyPolicy/Get',
    });
  }

  editPrivacyPolicy(body: IBilingualPolicy) {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: 'PrivacyPolicy/Edit',
      body,
    });
  }

  getUsageAgreement(): Observable<IBilingualPolicy> {
    return this.xhr.call<IBilingualPolicy>({
      method: HttpMethod.GET,
      url: 'UsageAgreement/Get',
    });
  }

  editUsageAgreement(body: IBilingualPolicy) {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: 'UsageAgreement/Edit',
      body,
    });
  }

  getTermsAndConditions(): Observable<IBilingualPolicy> {
    return this.xhr.call<IBilingualPolicy>({
      method: HttpMethod.GET,
      url: 'TermsAndConditions/Get',
    });
  }

  editTermsAndConditions(body: IBilingualPolicy) {
    return this.xhr.call<void>({
      method: HttpMethod.PUT,
      url: 'TermsAndConditions/Edit',
      body,
    });
  }
}
