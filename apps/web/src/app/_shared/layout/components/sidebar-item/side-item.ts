export type SideItem = {
  icon?: string;
  route?: string;
  title: string;

  items?: SideItem[];
  isDisabled?: boolean;
};
