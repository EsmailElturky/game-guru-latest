import { IPlace } from './iplace';

export interface IRoute {
  path: IPlace[];
  properties?: {
    color: string;
    weight: number;
    opacity: number;
  };
  title?: string;
  id?: string;
}
