import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { PAYMENT_STATUS } from 'src/app/@core/constants/common.constant';
import { ColumnFilterSorterConfig } from 'src/app/@core/types/common.type';
import { Payment } from 'src/app/@core/types/payment.type';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  isLoading = false;
  app_h$_sub = new Subscription();

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);

    this.app_h$_sub = this.appService.h$.subscribe((h) => {
      this.tablePaymentScroll = {
        y: h - 428 + 'px',
      };
    });
  }

  ngOnDestroy(): void {
    this.app_h$_sub.unsubscribe();
  }

  /*
   *
   * PAYMENTS
   *
   */
  isLoadingTablePayment = false;
  tablePaymentScroll: { x?: string; y?: string } = {};
  tablePaymentRows: Payment[] = [];
  tablePaymentColumnConfigs: ColumnFilterSorterConfig<Payment> = {
    creatorName: {
      showFilter: true,
      filterMultiple: true,
      filterOptions: [],
      filterFunction: (list: string[], item: Payment) => {
        return list.some((name) => item.creatorName.indexOf(name) !== -1);
      },
      showSort: false,
      sortPriority: false,
      sortOrder: null,
      sortFunction: null,
      sortDirections: [],
    },
    createdAt: {
      showFilter: false,
      filterMultiple: false,
      filterOptions: [],
      filterFunction: null,
      showSort: true,
      sortPriority: false,
      sortOrder: null,
      sortFunction: (a: Payment, b: Payment) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      },
      sortDirections: [],
    },
    paymentAt: {
      showFilter: false,
      filterMultiple: false,
      filterOptions: [],
      filterFunction: null,
      showSort: true,
      sortPriority: false,
      sortOrder: null,
      sortFunction: (a: Payment, b: Payment) => {
        return a.paymentAt.getTime() - b.paymentAt.getTime();
      },
      sortDirections: [],
    },
    totalAmount: {
      showFilter: false,
      filterMultiple: false,
      filterOptions: [],
      filterFunction: null,
      showSort: true,
      sortPriority: false,
      sortOrder: null,
      sortFunction: (a: Payment, b: Payment) => {
        return a.totalAmount - b.totalAmount;
      },
      sortDirections: [],
    },
    status: {
      showFilter: true,
      filterMultiple: true,
      filterOptions: [],
      filterFunction: (list: PAYMENT_STATUS[], item: Payment) => {
        return list.some((status) => item.status == status);
      },
      showSort: false,
      sortPriority: -1,
      sortOrder: null,
      sortFunction: null,
      sortDirections: [],
    },
  };
}
