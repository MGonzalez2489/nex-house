export interface TableColumn<T> {
  field: keyof T & string;
  header: string;
  sortable?: boolean;
  width?: string;
}
