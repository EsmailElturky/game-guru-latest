import { IPaginationResponse } from 'src/app/shared/interfaces/pagination-request-body.interface';

export interface IOrganizationNotification {
  id: number;
  referenceId: number;
  title: string;
  message: string;
  type: number;
  category: number;
  typeName: string;
  createdDate: string;
  isRead: boolean;
  takeAction: boolean;
  readDate: string | null;
}

export type IOrganizationNotificationListResponse =
  IPaginationResponse<IOrganizationNotification>;
