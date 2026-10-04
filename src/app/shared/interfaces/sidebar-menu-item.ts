export interface SidebarMenuItem {
  label: string;
  icon?: string;
  route?: string;
  expanded?: boolean;
  items?: SidebarMenuItem[];
  visible?: boolean;
  badge?: string;
}
