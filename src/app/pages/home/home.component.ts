import {AppService} from 'src/app/app.service';
import {Auth} from '@angular/fire/auth';
import {
  ColumnFilterSorterConfig,
  SearchPaymentParams,
} from 'src/app/@core/types/common.type';
import {CommonUtil} from 'src/app/@core/utils/common.util';
import {Component, ViewChild} from '@angular/core';
import {format, startOfMonth, endOfMonth} from 'date-fns';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Payment, PaymentForCreate} from 'src/app/@core/types/payment.type';
import {PaymentBusiness} from 'src/app/@core/businesses/payment.business';
import {Subscription} from 'rxjs';
import {User} from 'src/app/@core/types/user.type';
import {UserBusiness} from 'src/app/@core/businesses/user.business';
import {PdfUtil} from 'src/app/@core/utils/pdf.util';
import {PaymentComponent} from './payment/payment.component';
import {Bill} from "../../@core/types/bill.type";
import {BillComponent} from "./bill/bill.component";

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
  ) {
    this.initPayFromDate = startOfMonth(new Date());
    this.initPayToDate = endOfMonth(new Date());
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;

    this.app_h$_sub = this.appService.h$.subscribe((h) => {
      this.tablePaymentScroll = {
        y: h - 444 + 'px',
      };
      this.tableBillScroll = {
        y: h - 444 + 'px',
      };
    });

    try {
      const pr1 = this.userBusiness.getAllUsers();
      const pr2 = this.paymentBusiness.searchPayments({
        payFromDate: this.initPayFromDate,
        payToDate: this.initPayToDate,
      });
      const initData = await Promise.all([pr1, pr2]);
      this.users = initData[0];
      this.tablePaymentRows = initData[1];

      this.tablePaymentColumnConfigs['creatorName'].filterOptions =
        this.users.map((u) => ({
          text: u.userName,
          value: u.userName,
        }));
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

  @ViewChild(PaymentComponent)
  private appPaymentComponent!: PaymentComponent;

  // - Table
  initPayFromDate!: Date;
  initPayToDate!: Date;
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
      showFilter: false,
      filterMultiple: false,
      filterOptions: [],
      filterFunction: null,
      showSort: false,
      sortPriority: -1,
      sortOrder: null,
      sortFunction: null,
      sortDirections: [],
    },
  };

  searchPayment(prms: SearchPaymentParams) {
    this.isLoadingTablePayment = true;
    this.paymentBusiness
      .searchPayments(prms)
      .then((payments) => {
        this.tablePaymentRows = payments;
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
      })
      .finally(() => {
        this.isLoadingTablePayment = false;
      });
  }

  // - Modal
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
          this.appPaymentComponent.onSearchPayments();
        }
      });
  }

  deletePayment(payment: Payment) {
    this.isLoadingTablePayment = true;
    this.paymentBusiness
      .deletePayment(payment.id!)
      .then(() => {
        this.messageService.success('Xóa phiếu chi thành công');
        this.appPaymentComponent.onSearchPayments();
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
      });
  }

  viewPayment(payment: Payment) {
    this.pdfViewerTitle = `Phiếu chi ${payment.id} - Tạo bởi ${
      payment.creatorName
    } - Tạo lúc ${format(payment.createdAt.toDate(), 'dd/MM/yyyy HH:mm:ss')}`;
    PdfUtil.makePaymentPdf(payment)
      .then((blob) => {
        this.pdfDataObjUrl = window.URL.createObjectURL(blob);
        this.isVisiblePdfViewer = true;
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
      });
  }

  /*
   * PAYMENTS
   */

  @ViewChild(BillComponent)
  private appBillComponent!: BillComponent;

  // - Table
  initCreateFromDate!: Date;
  initCreateToDate!: Date;
  isLoadingTableBill = false;
  tableBillScroll: { x?: string; y?: string } = {};
  tableBillRows: Bill[] = [];
  tableBillColumnConfigs: ColumnFilterSorterConfig<Bill> = {
    creatorName: {
      showFilter: true,
      filterMultiple: true,
      filterOptions: [],
      filterFunction: (list: string[], item: Bill) => {
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
      sortFunction: (a: Bill, b: Bill) => {
        return a.createdAt.toMillis() - b.createdAt.toMillis();
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
      sortFunction: (a: Bill, b: Bill) => {
        return a.totalAmount - b.totalAmount;
      },
      sortDirections: [],
    },
  };


  /*
   * PDF VIEWER
   */

  isVisiblePdfViewer = false;
  pdfViewerTitle = '';
  pdfDataObjUrl = '';
}
