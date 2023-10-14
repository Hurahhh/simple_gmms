import { Injectable } from '@angular/core';
import { BillRepository } from '../repositories/bill.repository';
import { Bill } from '../types/bill.type';
import { SearchBillParams } from '../types/common.type';
import { Timestamp } from '@angular/fire/firestore';

@Injectable()
export class BillBusiness {
  constructor(private billRepository: BillRepository) {}

  async searchBills(prms: SearchBillParams) {
    if (prms.createFromDate.getTime() > prms.createToDate.getTime()) {
      throw new Error('malformed params');
    }

    const bills = await this.billRepository.findByCreatedAtRangeAsync(
      Timestamp.fromDate(prms.createFromDate),
      Timestamp.fromDate(prms.createToDate)
    );

    return bills
      .filter((p) => p.isActive)
      .sort((a, b) => {
        return a.createdAt.toMillis() - b.createdAt.toMillis();
      });
  }

  async createBill(bill: Bill) {
    return await this.billRepository.createBillAndUpdatePayment(bill);
  }
}
