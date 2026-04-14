export interface NavItemModel {
  id: string;
  label: string;
  icon?: string; // SVG path data
  route?: string;
  badge?: string | number;
  badgeVariant?: 'primary' | 'accent';
  children?: NavItemModel[];
  isDisabled?: boolean;
}

export interface NavSectionModel {
  label?: string; // undefined = sin encabezado
  items: NavItemModel[];
}

export interface SidebarConfigModel {
  header: {
    icon: string; // SVG path data
    name: string;
    tagline?: string;
  };
  sections: NavSectionModel[];
}
