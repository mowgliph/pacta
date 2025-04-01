export interface NavItemType {
  id: string;
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  submenu?: boolean;
  subMenuItems?: NavItemType[];
  disabled?: boolean;
  external?: boolean;
  roles?: string[];
}

export interface NavGroupType {
  title: string;
  items: NavItemType[];
}

export interface SidebarProps {
  className?: string;
  navItems?: NavGroupType[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface TopNavProps {
  className?: string;
}

export interface HeaderProps {
  className?: string;
}

export interface NavUserProps {
  className?: string;
}

export interface NavGroupProps {
  className?: string;
  group: NavGroupType;
  collapsed?: boolean;
} 