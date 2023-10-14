import { Injectable } from '@angular/core';
import { BillRepository } from '../repositories/bill.repository';
import { Bill } from '../types/bill.type';

@Injectable()
export class BillBusiness {
  constructor(private billRepository: BillRepository) {}

  async createBill(bill: Bill) {
    return await this.billRepository.createBillAndUpdatePayment(bill);
  }
}
