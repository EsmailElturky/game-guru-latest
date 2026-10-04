import { ITableDropdown } from '@EsmailElturky/ui-kit';
import { PagePermissions } from './inject-page-permissions';

export interface CrudDropdownHandlers<T extends { id?: string | number; isActive?: boolean }> {
  onView: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onActivate?: (row: T) => void;
  onDeactivate?: (row: T) => void;
  onApprove?: (row: T) => void;
  onReject?: (row: T) => void;
}

export function buildCrudDropdownItems<T extends { id?: string | number; isActive?: boolean }>(
  translate: (key: string) => string,
  perms: PagePermissions,
  handlers: CrudDropdownHandlers<T>,
  options?: { showView?: boolean },
): ITableDropdown[] {
  const items: ITableDropdown[] = [];
  const showView = options?.showView !== false;

  if (showView && perms.canView()) {
    items.push({
      label: translate('common.view'),
      icon: 'pi pi-eye text-(--primary-500)!',
      command: (event: { rowData: T }) => handlers.onView(event.rowData),
    });
  }

  if (handlers.onEdit && perms.canEdit()) {
    items.push({
      label: translate('common.edit'),
      icon: 'pi pi-pencil text-(--primary-500)!',
      command: (event: { rowData: T }) => handlers.onEdit!(event.rowData),
    });
  }

  if (handlers.onDelete && perms.canDelete()) {
    items.push({
      label: translate('common.delete'),
      icon: 'pi pi-trash text-(--primary-500)!',
      command: (event: { rowData: T }) => handlers.onDelete!(event.rowData),
    });
  }

  if (handlers.onDeactivate && perms.canDeactivate()) {
    items.push({
      label: translate('common.deactivate'),
      icon: 'pi pi-ban text-(--primary-500)!',
      command: (event: { rowData: T }) => handlers.onDeactivate!(event.rowData),
      condition: (rowData: T) => !!rowData.isActive,
    });
  }

  if (handlers.onActivate && perms.canActivate()) {
    items.push({
      label: translate('common.activate'),
      icon: 'pi pi-check-circle text-(--primary-500)!',
      command: (event: { rowData: T }) => handlers.onActivate!(event.rowData),
      condition: (rowData: T) => !rowData.isActive,
    });
  }

  if (handlers.onApprove && perms.canApprove()) {
    items.push({
      label: translate('table.approve'),
      icon: 'pi pi-check text-(--primary-500)!',
      command: (event: { rowData: T }) => handlers.onApprove!(event.rowData),
    });
  }

  if (handlers.onReject && perms.canReject()) {
    items.push({
      label: translate('table.reject'),
      icon: 'pi pi-times text-(--primary-500)!',
      command: (event: { rowData: T }) => handlers.onReject!(event.rowData),
    });
  }

  return items;
}
