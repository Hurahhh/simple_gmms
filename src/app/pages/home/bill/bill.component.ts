import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Bill, GenerateBillParams } from '../../../@core/types/bill.type';
import {
  ColumnFilterSorterConfig,
  SearchBillParams,
  SearchPaymentParams,
} from '../../../@core/types/common.type';
import { sub, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { Payment } from 'src/app/@core/types/payment.type';
import { range, fill } from 'lodash';

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

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['isVisibleModalForm'] &&
      changes['isVisibleModalForm'].currentValue
    ) {
      this.initModal();
    }

    if (
      changes['tablePaymentRows'] &&
      changes['tablePaymentRows'].currentValue?.length > 0
    ) {
      this.allChecked = true;
      this.paymentChecks = fill(
        range(changes['tablePaymentRows'].currentValue.length),
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
  @Output() wantSearchPayment = new EventEmitter<SearchPaymentParams>();
  @Input() tablePaymentRows: Payment[] = [];
  paymentChecks: boolean[] = [];
  allChecked = false;
  @Input() isLoadingTablePayment = false;
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
          c.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
  }

  onSearchPayment() {
    // validate form
    if (this.modalForm.invalid) {
      Object.values(this.modalForm.controls).forEach((c) => {
        if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    const _payFromDate = startOfDay(this.modalForm.value.payFromDate);
    const _payToDate = endOfDay(this.modalForm.value.payToDate);
    this.wantSearchPayment.emit({
      payFromDate: _payFromDate,
      payToDate: _payToDate,
    });
  }

  checkAll(allChecked: boolean) {
    this.allChecked = allChecked;
    this.paymentChecks.fill(this.allChecked);
  }

  changeCheck() {
    if (this.paymentChecks.every((checked) => checked)) {
      this.checkAll(true);
    }
  }

  initModal() {
    this.isSavingBill = false;
    this.allChecked = false;
    this.tablePaymentRows = [];
    const nowLastMonth = sub(new Date(), { months: 1 });
    this.modalForm = this.fb.group({
      payFromDate: [startOfMonth(nowLastMonth), [Validators.required]],
      payToDate: [endOfMonth(nowLastMonth), [Validators.required]],
    });
  }

  onGenerateBill() {
    const _payments = this.tablePaymentRows.filter(
      (p, i) => this.paymentChecks[i]
    );
    const _payFromDate = startOfDay(this.modalForm.value.payFromDate);
    const _payToDate = endOfDay(this.modalForm.value.payToDate);
    this.wantGenerateBill.emit({
      payments: _payments,
      payFromDate: _payFromDate,
      payToDate: _payToDate,
    });
  }

  onSaveBill() {}
}
