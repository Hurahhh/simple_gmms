import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';
import { TAG_COLOR } from '../constants/common.constant';

export type ColumnFilterSorterConfig<T> = {
  [key: string]: {
    showFilter: boolean;
    filterMultiple: boolean;
    filterOptions: NzTableFilterList;
    filterFunction: NzTableFilterFn<T> | null;
    showSort: boolean;
    sortPriority: number | boolean;
    sortOrder: NzTableSortOrder | null;
    sortFunction: NzTableSortFn<T> | null;
    sortDirections: NzTableSortOrder[];
  };
};

export type Tag = {
  text: string;
  color: TAG_COLOR;
};

export type SearchPaymentParams = {
  payFromDate: Date;
  payToDate: Date;
};
