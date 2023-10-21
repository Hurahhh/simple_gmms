import {ColumnFilterSorterConfig, SearchPaymentParams} from 'src/app/@core/types/common.type';
import {CommonUtil} from 'src/app/@core/utils/common.util';
import {Component, EventEmitter, Input, Output, SimpleChanges, ViewChild} from '@angular/core';
import {EditPaymentComponent} from "./edit-payment/edit-payment.component";
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PAYMENT_STATUS} from 'src/app/@core/constants/common.constant';
import {Payment, PaymentForCreate, PaymentForUpdate} from 'src/app/@core/types/payment.type';
import {User} from 'src/app/@core/types/user.type';
import {differenceInCalendarDays, endOfDay, startOfDay} from 'date-fns';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent {
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      payFromDate: [this.initPayFromDate, [Validators.required]],
      payToDate: [this.initPayToDate, [Validators.required]],
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
  }

  /*
   * TABLE
   */

  searchForm!: FormGroup;
  @Input() initPayFromDate = new Date();
  @Input() initPayToDate = new Date();
  @Input() isLoadingTable = false;
  @Input() tableScroll: { x?: string; y?: string } = {};
  @Input() tableRows: Payment[] = [];
  @Input() columnConfigs: ColumnFilterSorterConfig<Payment> = {};
  @Output() wantSearchPayment = new EventEmitter<SearchPaymentParams>();
  @Output() wantDeletePayment = new EventEmitter<Payment>();
  @Output() wantViewPayment = new EventEmitter<Payment>();

  canDeletePayment(payment: Payment) {
    return payment.status == PAYMENT_STATUS.CREATED || payment.status == PAYMENT_STATUS.EDITED;
  }

  onSearchPayments() {
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

    const _payFromDate = startOfDay(this.searchForm.value.payFromDate);
    const _payToDate = endOfDay(this.searchForm.value.payToDate);
    this.wantSearchPayment.emit({
      payFromDate: _payFromDate,
      payToDate: _payToDate,
    });
  }

  /*
   * MODAL
   */

  @Input() isVisibleModalForm = false;
  @Output() isVisibleModalFormChange = new EventEmitter<boolean>();
  modalForm!: FormGroup;
  @Input() users: User[] = [];
  @Output() wantCreatePayment = new EventEmitter<PaymentForCreate>();
  isCreatingPayment = false;

  initModal() {
    this.isCreatingPayment = false;
    this.modalForm = this.fb.group({
      date: [new Date(), [Validators.required]],
      time: [null],
      aSide: this.fb.array([], [Validators.required]),
      bSide: this.fb.array([], [Validators.required]),
    });
  }

  get aSideFA() {
    return <FormArray>this.modalForm.get('aSide');
  }

  get bSideFA() {
    return <FormArray>this.modalForm.get('bSide');
  }

  onAddToASide(
    userId: string | null = null,
    amount: number | null = null,
    description: string | null = null
  ) {
    this.aSideFA.push(
      this.fb.group({
        userId: [userId, [Validators.required]],
        amount: [
          amount,
          [Validators.required, Validators.min(1), Validators.max(99999)],
        ],
        description: [description, [Validators.required]],
      })
    );
  }

  onAddToBSide(userId: string | null = null) {
    this.bSideFA.push(
      this.fb.group({
        userId: [userId, [Validators.required]],
      })
    );
  }

  removeFromASide(index: number) {
    this.aSideFA.removeAt(index);
  }

  removeFromBSide(index: number) {
    this.bSideFA.removeAt(index);
  }

  autoLoadASide() {
    this.aSideFA.clear();
    this.users.forEach((u) => this.onAddToASide(u.id, null, null));
  }

  autoLoadBSide() {
    this.bSideFA.clear();
    this.users.forEach((u) => this.onAddToBSide(u.id));
  }

  onCreatePayment() {
    // validate form
    if (this.modalForm.invalid) {
      Object.values(this.modalForm.controls).forEach((c) => {
        if (c instanceof FormArray) {
          c.markAsTouched();
          Object.values(c.controls).forEach((_c) => {
            if (_c instanceof FormGroup) {
              Object.values(_c.controls).forEach((__c) => {
                if (__c.invalid) {
                  __c.markAsDirty();
                  __c.updateValueAndValidity({onlySelf: true});
                }
              });
            }
          });
        } else if (c.invalid) {
          c.markAsDirty();
          c.updateValueAndValidity({onlySelf: true});
        }
      });
      return;
    }

    // get form data
    const _date = this.modalForm.value.date as Date;
    let _time = this.modalForm.value.time as Date;
    if (!_time) {
      _time = new Date(0, 0, 0, 0, 0, 0, 0);
    }

    const _aSide = this.modalForm.value.aSide as {
      userId: string;
      amount: number;
      description: string;
    }[];

    const bSide = this.modalForm.value.bSide as {
      userId: string;
    }[];
    const _bSide = [
      ...new Map(bSide.map((item) => [item.userId, item])).values(),
    ];

    const payment = {
      paymentAt: CommonUtil.combineDateTime(_date, _time),
      aSide: _aSide,
      bSide: _bSide,
    } as PaymentForCreate;

    // emit event
    this.isCreatingPayment = true;
    this.wantCreatePayment.emit(payment);
  }

  disabledDateAfterToday(current: Date) {
    return differenceInCalendarDays(current, new Date()) > 0;
  }

  /*
   * EDIT MODAL
   */
  @ViewChild('editPaymentComponent') editPaymentComponent!: EditPaymentComponent;
  @Output() wantUpdatePayment = new EventEmitter<PaymentForUpdate>();

  onUpdatePayment(payment: PaymentForUpdate) {
    this.wantUpdatePayment.emit(payment);
  }

  triggerHideEditModal() {
    this.editPaymentComponent.hide();
  }
}
