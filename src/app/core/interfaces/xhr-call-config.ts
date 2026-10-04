import { XhrParameters } from './xhr-parameters';

export interface XhrCallConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
  params?: XhrParameters;
  skipIsSuccessCheck?: boolean;
}
