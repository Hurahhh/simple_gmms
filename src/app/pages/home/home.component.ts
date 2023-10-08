import { AppService } from 'src/app/app.service';
import { ColumnFilterSorterConfig } from 'src/app/@core/types/common.type';
import { Component } from '@angular/core';
import { PAYMENT_STATUS } from 'src/app/@core/constants/common.constant';
import { Payment, PaymentForCreate } from 'src/app/@core/types/payment.type';
import { PaymentBusiness } from 'src/app/@core/businesses/payment.business';
import { Subscription } from 'rxjs';
import { User } from 'src/app/@core/types/user.type';
import { Auth } from '@angular/fire/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserBusiness } from 'src/app/@core/businesses/user.business';
import { CommonUtil } from 'src/app/@core/utils/common.util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  isLoading = false;
  app_h$_sub = new Subscription();

  constructor(
    private auth: Auth,
    private messageService: NzMessageService,
    private appService: AppService,
    private userBusiness: UserBusiness,
    private paymentBusiness: PaymentBusiness
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;

    this.app_h$_sub = this.appService.h$.subscribe((h) => {
      this.tablePaymentScroll = {
        y: h - 428 + 'px',
      };
    });

    try {
      this.users = await this.userBusiness.getAllUsers();
    } catch (error) {
      this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.app_h$_sub.unsubscribe();
  }

  /*
   * PAYMENTS
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
        return a.createdAt.toMillis() - b.createdAt.toMillis();
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
        return a.paymentAt.toMillis() - b.paymentAt.toMillis();
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
  isVisiblePaymentModalForm = false;
  users: User[] = [];
  isCreatingPayment = false;

  createPayment(dto: PaymentForCreate) {
    this.paymentBusiness
      .createPayment(dto, this.auth.currentUser!.uid)
      .then((payment) => {
        if (!!payment) {
          this.isVisiblePaymentModalForm = false;
          this.messageService.success('Tạo phiếu chi thành công');
        }
      });
  }
}
