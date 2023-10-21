import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Payment, PaymentForUpdate} from "../../../../@core/types/payment.type";
import {User} from "../../../../@core/types/user.type";
import {CommonUtil} from "../../../../@core/utils/common.util";
import {differenceInCalendarDays} from "date-fns";

@Component({
  selector: 'edit-payment',
  templateUrl: './edit-payment.component.html',
  styleUrls: ['./update-payment.component.css'],
})
export class EditPaymentComponent {
  visible = false;
  @Input() users!: User[];
  targetPayment!: Payment;

  fb = inject(FormBuilder);
  form!: FormGroup;
  updating = false;
  @Output()
  wantUpdatePayment = new EventEmitter<PaymentForUpdate>;

  ngOnInit() {
    this.init();
  }

  show(targetPayment: Payment) {
    this.updating = false;
    this.targetPayment = targetPayment;
    this.reload();
    this.visible = true;
  }

  hide() {
    this.init();
    this.visible = false;
  }

  init() {
    this.form = this.fb.group({
      date: [new Date(), [Validators.required]],
      time: [null],
      aSide: this.fb.array([], [Validators.required]),
      bSide: this.fb.array([], [Validators.required]),
    });
  }

  reload() {
    this.form = this.fb.group({
      date: [this.targetPayment.paymentAt.toDate(), [Validators.required]],
      time: [this.targetPayment.paymentAt.toDate()],
      aSide: this.fb.array([], [Validators.required]),
      bSide: this.fb.array([], [Validators.required]),
    });

    this.targetPayment.aSide.forEach(a => this.onAddToASide(a.userId, a.amount, a.description));
    this.targetPayment.bSide.forEach(b => this.onAddToBSide(b.userId));
  }

  get aSideFA() {
    return <FormArray>this.form.get('aSide');
  }

  get bSideFA() {
    return <FormArray>this.form.get('bSide');
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

  onUpdatePayment() {
    // validate form
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((c) => {
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
    const _date = this.form.value.date as Date;
    let _time = this.form.value.time as Date;
    if (!_time) {
      _time = new Date(0, 0, 0, 0, 0, 0, 0);
    }

    const _aSide = this.form.value.aSide as {
      userId: string;
      amount: number;
      description: string;
    }[];

    const bSide = this.form.value.bSide as {
      userId: string;
    }[];
    const _bSide = [
      ...new Map(bSide.map((item) => [item.userId, item])).values(),
    ];

    const payment = {
      paymentId: this.targetPayment.id,
      paymentAt: CommonUtil.combineDateTime(_date, _time),
      aSide: _aSide,
      bSide: _bSide,
    } as PaymentForUpdate;

    // emit event
    this.updating = true;
    this.wantUpdatePayment.emit(payment);
  }

  disabledDateAfterToday(current: Date) {
    return differenceInCalendarDays(current, new Date()) > 0;
  }
}
