import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Bill } from '../../../@core/types/bill.type';
import {
  ColumnFilterSorterConfig,
  SearchBillParams,
  SearchPaymentParams,
} from '../../../@core/types/common.type';
import { sub, startOfMonth, endOfMonth } from 'date-fns';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
})
export class BillComponent {
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      createFromDate: [this.initCreateFromDate, [Validators.required]],
      createToDate: [this.initCreateToDate, [Validators.required]],
    });
    this.initModal();
  }

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

  /*
   * MODAL
   */

  modalForm!: FormGroup;
  @Input() isVisibleModalForm = false;
  @Output() isVisibleModalFormChange = new EventEmitter<boolean>();
  @Output() wantSearchBill = new EventEmitter<SearchBillParams>();
  @Output() wantGenerateBill = new EventEmitter<SearchPaymentParams>();
  @Output() wantViewBill = new EventEmitter<Bill>();
  isSavingBill = false;

  onSearchBills() {
    // validate form
    if (this.searchForm.invalid) {
      Object.values(this.searchForm.controls).forEach((c) => {
        if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
  }

  initModal() {
    this.isSavingBill = false;
    const nowLastMonth = sub(new Date(), { months: 1 });
    this.modalForm = this.fb.group({
      payFromDate: [startOfMonth(nowLastMonth), [Validators.required]],
      payToDate: [endOfMonth(nowLastMonth), [Validators.required]],
    });
  }

  onGenerateBill() {}

  onSaveBill() {}
}
