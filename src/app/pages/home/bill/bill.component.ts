import {Bill, GenerateBillParams} from '../../../@core/types/bill.type';
import {ColumnFilterSorterConfig, SearchBillParams, SearchPaymentParams,} from '../../../@core/types/common.type';
import {Component, EventEmitter, Input, Output, SimpleChanges, ViewChild,} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Payment} from 'src/app/@core/types/payment.type';
import {endOfDay, endOfMonth, startOfDay, startOfMonth, sub} from 'date-fns';
import {fill, range} from 'lodash';
import {NzTableComponent} from "ng-zorro-antd/table";

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
})
export class BillComponent {
  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      createFromDate: [this.initCreateFromDate, [Validators.required]],
      createToDate: [this.initCreateToDate, [Validators.required]],
    });
    this.initModal();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['isVisibleModalForm'] &&
      changes['isVisibleModalForm'].currentValue
    ) {
      this.initModal();
    }

    if (
      changes['tablePaymentForSettleRows'] &&
      changes['tablePaymentForSettleRows'].currentValue?.length > 0
    ) {
      this.isAllPaymentForSettleChecked = true;
      this.paymentForSettleChecks = fill(
        range(changes['tablePaymentForSettleRows'].currentValue.length),
        true
      );
    }
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
  @Output() wantSearchPaymentForSettle = new EventEmitter<SearchPaymentParams>();
  @ViewChild('tablePaymentForSettle') tablePaymentForSettle!: NzTableComponent<Payment>;
  @Input() tablePaymentForSettleRows: Payment[] = [];
  @Input() tablePaymentForSettleColumnConfigs: ColumnFilterSorterConfig<Payment> = {};
  paymentForSettleChecks: boolean[] = [];
  isAllPaymentForSettleChecked = false;
  @Input() isLoadingTablePaymentForSettle = false;
  @Output() wantGenerateBill = new EventEmitter<GenerateBillParams>();
  @Output() wantSearchBill = new EventEmitter<SearchBillParams>();
  @Output() wantViewBill = new EventEmitter<Bill>();
  isSavingBill = false;

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

    const _createFromDate = startOfDay(this.searchForm.value.createFromDate);
    const _createToDate = endOfDay(this.searchForm.value.createToDate);
    this.wantSearchBill.emit({
      createFromDate: _createFromDate,
      createToDate: _createToDate,
    });
  }

  onSearchPayment() {
    // validate form
    if (this.modalForm.invalid) {
      Object.values(this.modalForm.controls).forEach((c) => {
        if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({onlySelf: true});
        }
      });
      return;
    }

    const _payFromDate = startOfDay(this.modalForm.value.payFromDate);
    const _payToDate = endOfDay(this.modalForm.value.payToDate);
    this.wantSearchPaymentForSettle.emit({
      payFromDate: _payFromDate,
      payToDate: _payToDate,
    });
  }

  checkAll(isAllPaymentForSettleChecked: boolean) {
    this.isAllPaymentForSettleChecked = isAllPaymentForSettleChecked;
    this.paymentForSettleChecks.fill(this.isAllPaymentForSettleChecked);
  }

  changeCheck() {
    if (this.paymentForSettleChecks.every((checked) => checked)) {
      this.checkAll(true);
    } else {
      this.isAllPaymentForSettleChecked = false;
    }
  }

  initModal() {
    this.isSavingBill = false;
    this.isAllPaymentForSettleChecked = false;
    this.tablePaymentForSettleRows = [];
    const nowLastMonth = sub(new Date(), {months: 1});
    this.modalForm = this.fb.group({
      payFromDate: [startOfMonth(nowLastMonth), [Validators.required]],
      payToDate: [endOfMonth(nowLastMonth), [Validators.required]],
    });
  }

  onGenerateBill() {
    const _payments = this.tablePaymentForSettle.data.filter(
      (p, i) => this.paymentForSettleChecks[i]
    );
    const _payFromDate = startOfDay(this.modalForm.value.payFromDate);
    const _payToDate = endOfDay(this.modalForm.value.payToDate);
    this.wantGenerateBill.emit({
      payments: _payments,
      payFromDate: _payFromDate,
      payToDate: _payToDate,
    });
  }

  onSaveBill() {
  }
}
