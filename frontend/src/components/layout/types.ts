export type NavItemType = {
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

export type NavGroupType = {
  title: string;
  items: NavItemType[];
}

export type SidebarProps = {
  className?: string;
  navItems?: NavGroupType[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export type TopNavProps = {
  className?: string;
}

export type HeaderProps = {
  className?: string;
}

export type NavUserProps = {
  className?: string;
}

export type NavGroupProps = {
  className?: string;
  group: NavGroupType;
  collapsed?: boolean;
} 