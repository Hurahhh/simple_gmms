import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PaymentBusiness } from './businesses/payment.business';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentStatusPipe } from './pipes/payment.pipe';
import { SafePipe } from './pipes/common.pipe';
import { UserBusiness } from './businesses/user.business';
import { UserRepository } from './repositories/user.repository';
import { BillBusiness } from './businesses/bill.business';
import { BillRepository } from './repositories/bill.repository';

@NgModule({
  declarations: [PaymentStatusPipe, SafePipe],
  imports: [CommonModule],
  providers: [
    PaymentRepository,
    UserRepository,
    BillRepository,
    PaymentBusiness,
    UserBusiness,
    BillBusiness,
  ],
  bootstrap: [],
  exports: [PaymentStatusPipe, SafePipe],
})
export class CoreModule {}
