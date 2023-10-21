import {AppService} from 'src/app/app.service';
import {Auth} from '@angular/fire/auth';
import {Bill, GenerateBillParams, Settle} from '../../@core/types/bill.type';
import {BillBusiness} from 'src/app/@core/businesses/bill.business';
import {BillComponent} from './bill/bill.component';
import {ColumnFilterSorterConfig, SearchBillParams, SearchPaymentParams,} from 'src/app/@core/types/common.type';
import {CommonUtil} from 'src/app/@core/utils/common.util';
import {Component, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Payment, PaymentForCreate, PaymentForUpdate} from 'src/app/@core/types/payment.type';
import {PaymentBusiness} from 'src/app/@core/businesses/payment.business';
import {PaymentComponent} from './payment/payment.component';
import {PdfUtil} from 'src/app/@core/utils/pdf.util';
import {Subscription} from 'rxjs';
import {Timestamp} from '@angular/fire/firestore';
import {UserBusiness} from 'src/app/@core/businesses/user.business';
import {User} from 'src/app/@core/types/user.type';
import {endOfMonth, format, startOfMonth, startOfYear} from 'date-fns';
import {fill, flattenDeep, range, round, uniq} from 'lodash';

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
    private paymentBusiness: PaymentBusiness,
    private billBusiness: BillBusiness
  ) {
    const now = new Date();
    this.initPayFromDate = startOfMonth(now);
    this.initPayToDate = endOfMonth(now);
    this.initCreateFromDate = startOfYear(now);
    this.initCreateToDate = endOfMonth(now);
  }

  async ngOnInit(): Promise<void> {
    this.app_h$_sub = this.appService.h$.subscribe((h) => {
      this.tablePaymentScroll = {
        y: h - 474 + 'px',
      };
      this.tableBillScroll = {
        y: h - 474 + 'px',
      };
    });
    this.isLoading = true;
    try {
      const pr1 = this.userBusiness.getAllUsers();
      const pr2 = this.paymentBusiness.searchPayments({
        payFromDate: this.initPayFromDate,
        payToDate: this.initPayToDate,
      });
      const pr3 = this.billBusiness.searchBills({
        createFromDate: this.initCreateFromDate,
        createToDate: this.initCreateToDate,
      });

      const initData = await Promise.all([pr1, pr2, pr3]);
      this.users = initData[0];
      this.tablePaymentRows = initData[1];
      this.tableBillRows = initData[2];

      this.tablePaymentColumnConfigs['creatorName'].filterOptions =
        this.users.map((u) => ({
          text: u.userName,
          value: u.userName,
        }));
      this.tableBillColumnConfigs['creatorName'].filterOptions = this.users.map(
        (u) => ({
          text: u.userName,
          value: u.userName,
        })
      );
    } catch (error) {
      console.log(error);
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

  // PAYMENTS - Table
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
      sortOrder: 'descend',
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

  // PAYMENTS - Modal
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
        } else {
          this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
        }
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
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
    PdfUtil.makePaymentPdf(payment)
      .then((blob) => {
        const title = `Phiếu chi ${payment.id} - Tạo bởi ${payment.creatorName} - Tạo lúc ${format(payment.createdAt.toDate(), 'dd/MM/yyyy HH:mm:ss')}`;
        this.viewPdf(title, window.URL.createObjectURL(blob), {isPreviewBillBeforeSave: false});
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
      });
  }

  updatePayment(dto: PaymentForUpdate) {
    this.paymentBusiness
      .updatePayment(dto, this.auth.currentUser!.uid)
      .then(() => {
        this.appPaymentComponent.triggerHideEditModal();
        this.messageService.success('Cập nhật phiếu chi thành công');
        this.appPaymentComponent.onSearchPayments();
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
      });
  }

  /*
   * BILLS
   */

  @ViewChild(BillComponent)
  private appBillComponent!: BillComponent;

  // BILLS - Table
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
      sortOrder: 'descend',
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

  // BILLS - Modal
  isVisibleBillModalForm = false;
  isLoadingTablePaymentForSettle = false;
  tablePaymentForSettleRows: Payment[] = [];
  tablePaymentForSettleColumnConfigs: ColumnFilterSorterConfig<Payment> = {
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
      sortOrder: 'descend',
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

  searchBill(prms: SearchBillParams) {
    this.isLoadingTableBill = true;
    this.billBusiness
      .searchBills(prms)
      .then((bills) => {
        this.tableBillRows = bills;
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
      })
      .finally(() => {
        this.isLoadingTableBill = false;
      });
  }

  searchPaymentForSettle(prms: SearchPaymentParams) {
    this.isLoadingTablePaymentForSettle = true;
    this.paymentBusiness
      .searchPayments(prms)
      .then((payments) => {
        this.tablePaymentForSettleRows = payments;
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
      })
      .finally(() => {
        this.isLoadingTablePaymentForSettle = false;
      });
  }

  generateBill(prms: GenerateBillParams) {
    const creator = this.users.find((u) => u.id == this.auth.currentUser!.uid)!;
    const settles = this.generateSettles(prms.payments);
    const bill = {
      id: null,
      creatorId: creator.id,
      creatorName: creator.userName,
      createdAt: Timestamp.fromDate(new Date()),
      updatorId: null,
      updatorName: null,
      updatedAt: null,
      isActive: true,
      payFromDate: Timestamp.fromDate(prms.payFromDate),
      payToDate: Timestamp.fromDate(prms.payToDate),
      paymentIds: prms.payments.map((p) => p.id),
      totalAmount: prms.payments.reduce((s, p) => s + p.totalAmount, 0),
      settles: settles,
    } as Bill;
    this.viewBill(bill, true);
  }

  viewBill(bill: Bill, isPreviewBeforeSave: boolean) {
    this.isVisibleBillModalForm = false;
    PdfUtil.makeBillPdf(bill)
      .then((blob) => {
        let title = 'Đơn quyết toán';
        if (isPreviewBeforeSave) {
          this.targetBill = bill;
        } else {
          title = `Đơn quyết toán ${bill.id} - Tạo bởi ${bill.creatorName} - Tạo lúc ${format(bill.createdAt.toDate(), 'dd/MM/yyyy HH:mm:ss')}`;
        }
        this.viewPdf(title, window.URL.createObjectURL(blob), {isPreviewBillBeforeSave: isPreviewBeforeSave});
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
      });
  }

  private generateSettles(payments: Payment[]) {
    // prepare users
    let userIds: any[] = [];
    payments.forEach((p) => {
      userIds.push(p.aSide.map((a) => a.userId));
      userIds.push(p.bSide.map((b) => b.userId));
    });
    userIds = uniq(flattenDeep(userIds));
    const users = this.users.filter((u) => userIds.indexOf(u.id) != -1);

    // prepare matrix
    const matrix = this.computeMatrix(users, payments);

    // compute settles
    const netAmounts: number[] = [];
    for (let i = 0; i < users.length; i++) {
      const totalCredits = matrix.reduce((s, m) => s + m[i], 0);
      const totalDebits = matrix[i].reduce((s, n) => s + n, 0);
      netAmounts.push(totalCredits - totalDebits);
    }
    const settles: Settle[] = [];
    this.billLevelMinCashFlow(netAmounts, users, settles);

    return settles;
  }

  private computeMatrix(users: User[], payments: Payment[]) {
    let matrix: number[][] = [];
    for (let i = 0; i < users.length; i++) {
      const row = [];
      for (let j = 0; j < users.length; j++) {
        row.push(0);
      }
      matrix.push(row);
    }

    payments.forEach((payment) => {
      const netAmounts = fill(range(users.length), 0);
      payment.aSide.forEach((a) => {
        const i = users.findIndex((u) => u.id == a.userId);
        netAmounts[i] += a.amount;
      });
      const amountForEachASide = payment.totalAmount / payment.bSide.length;
      payment.bSide.forEach((b) => {
        const i = users.findIndex((u) => u.id == b.userId);
        netAmounts[i] = netAmounts[i] - amountForEachASide;
      });
      this.paymentLevelMinCashFlow(netAmounts, matrix);
    });

    return matrix;
  }

  private paymentLevelMinCashFlow(netAmounts: number[], matrix: number[][]) {
    const maxCredit = Math.max.apply(null, netAmounts);
    const maxCreditIndex = netAmounts.indexOf(maxCredit);
    const maxDebit = Math.min.apply(null, netAmounts);
    const maxDebitIndex = netAmounts.indexOf(maxDebit);

    if (round(maxCredit, 6) == 0 && round(maxDebit, 6) == 0) {
      return;
    }

    const min = Math.min(maxCredit, -maxDebit);
    matrix[maxDebitIndex][maxCreditIndex] += min;
    netAmounts[maxCreditIndex] -= min;
    netAmounts[maxDebitIndex] += min;

    this.paymentLevelMinCashFlow(netAmounts, matrix);
  }

  private billLevelMinCashFlow(netAmounts: number[], users: User[], settles: Settle[]) {
    const maxCredit = Math.max.apply(null, netAmounts);
    const maxCreditIndex = netAmounts.indexOf(maxCredit);
    const maxDebit = Math.min.apply(null, netAmounts);
    const maxDebitIndex = netAmounts.indexOf(maxDebit);

    if (round(maxCredit, 6) == 0 && round(maxDebit, 6) == 0) {
      return;
    }

    const min = Math.min(maxCredit, -maxDebit);
    settles.push({
      aUserId: users[maxDebitIndex].id!,
      aUserName: users[maxDebitIndex].userName,
      bUserId: users[maxCreditIndex].id!,
      bUserName: users[maxCreditIndex].userName,
      amount: min,
    });
    netAmounts[maxCreditIndex] -= min;
    netAmounts[maxDebitIndex] += min;

    this.billLevelMinCashFlow(netAmounts, users, settles);
  }

  onSaveBill() {
    this.isSavingBill = true;
    this.billBusiness
      .createBill(this.targetBill!)
      .then(() => {
        this.messageService.success('Lưu đơn quyết toán thành công');
        this.appPaymentComponent.onSearchPayments();
        this.appBillComponent.onSearchBills();
      })
      .catch((error) => {
        console.log(error);
        this.messageService.error(CommonUtil.COMMON_ERROR_MESSAGE);
      })
      .finally(() => {
        this.closePdf();
      });
  }

  /*
   * PDF VIEWER
   */

  isVisiblePdfViewer = false;
  pdfViewerTitle = '';
  pdfDataObjUrl = '';

  isPreviewBillBeforeSave = false;
  isSavingBill = false;
  targetBill: Bill | null = null;

  viewPdf(title: string, dataObjUrl: string, config: { isPreviewBillBeforeSave: boolean }) {
    this.pdfViewerTitle = title;
    this.pdfDataObjUrl = dataObjUrl;
    this.isPreviewBillBeforeSave = config.isPreviewBillBeforeSave;
    this.isVisiblePdfViewer = true;
  }

  closePdf() {
    this.pdfViewerTitle = '';
    this.pdfDataObjUrl = '';
    this.isPreviewBillBeforeSave = false;
    this.isSavingBill = false;
    this.isVisiblePdfViewer = false;
  }
}
