import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PaymentStatusPipe } from './pipes/payment.pipe';

@NgModule({
  declarations: [PaymentStatusPipe],
  imports: [CommonModule],
  providers: [],
  bootstrap: [],
  exports: [PaymentStatusPipe],
})
export class CoreModule {}
