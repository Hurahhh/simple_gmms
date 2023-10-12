import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {FormGroup} from "@angular/forms";
import {endOfDay, startOfDay} from "date-fns";
import {Bill} from "../../../@core/types/bill.type";
import {ColumnFilterSorterConfig, SearchBillParams} from "../../../@core/types/common.type";

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
})
export class BillComponent {
  /*
   * TABLE
   */

  searchForm!: FormGroup;
  @Input() initCreateFromDate = new Date();
  @Input() initCreateToDate = new Date();
  @Input() isLoadingTable = false;
  @Input() tableScroll: { x?: string; y?: string } = {};
  @Input() tableRows: Bill[] = [];
  @Input() columnConfigs: ColumnFilterSorterConfig<Bill> = {};
  @Output() wantSearchBill = new EventEmitter<SearchBillParams>();
  @Output() wantViewBill = new EventEmitter<Bill>();

  onSearchBills() {
    // validate form
    if (this.searchForm.invalid) {
      Object.values(this.searchForm.controls).forEach((c) => {
        if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({onlySelf: true});
        }
      });
      return;
    }
  }

}
