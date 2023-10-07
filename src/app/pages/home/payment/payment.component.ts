import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Payment } from 'src/app/@core/types/payment.type';
import { ColumnFilterSorterConfig } from 'src/app/@core/types/common.type';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
})
export class PaymentComponent {
  searchForm!: FormGroup;
  @Input() isLoadingTable = false;
  @Input() tableScroll: { x?: string; y?: string } = {};
  @Input() tableRows: Payment[] = [];
  @Input() columnConfigs: ColumnFilterSorterConfig<Payment> = {};

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.searchForm = this.fb.group({
      payFromDate: [fromDate, [Validators.required]],
      payToDate: [toDate, [Validators.required]],
    });
  }
}
