import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";

export type Primitive = string | number | boolean;
type ParamValue = Primitive | ReadonlyArray<Primitive>;

export interface XhrParameters {
  params?: HttpParams | Record<string, ParamValue>;
  headers?: HttpHeaders | Record<string, string | string[]>;
  skipAuth?: boolean;
  skipLoading?: boolean;
  context?: HttpContext;
}
