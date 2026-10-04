export interface XhrResponse<T> {
  value: T;
  isSuccess: boolean;
  message: string;
  errors: any[];
}
