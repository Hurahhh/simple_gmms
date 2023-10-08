import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PaymentBusiness } from './businesses/payment.business';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentStatusPipe } from './pipes/payment.pipe';
import { UserBusiness } from './businesses/user.business';
import { UserRepository } from './repositories/user.repository';

@NgModule({
  declarations: [PaymentStatusPipe],
  imports: [CommonModule],
  providers: [PaymentRepository, UserRepository, PaymentBusiness, UserBusiness],
  bootstrap: [],
  exports: [PaymentStatusPipe],
})
export class CoreModule {}
