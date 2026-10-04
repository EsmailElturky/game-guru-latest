export interface IPageAction {
  id?: number;
  actionType: number;
  actionTypeName?: string;
  pageId?: number;
  isSelected?: boolean;
}

export interface IPagePermission {
  pageId: number;
  name?: string;
  pageKey?: string;
  groupRoleId?: number;
  pageActions: IPageAction[];
}

export interface IRole {
  id: number;
  name: string;
  nameAr: string;
  statusName: string;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  userCount: number;
  groupRolePermissions: IPagePermission[] | null;
}

export interface IRolePermission {
  pageId: number;
  pageActions: {
    actionType: number;
  }[];
}

export interface IRoleCreate {
  id?: number;
  organizationId?: number;
  name: string;
  nameAr: string;
  groupRolePermissions: IRolePermission[];
}
