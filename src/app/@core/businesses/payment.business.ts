import { Injectable } from '@angular/core';
import { PAYMENT_STATUS } from '../constants/common.constant';
import { Payment, PaymentForCreate } from '../types/payment.type';
import { PaymentRepository } from '../repositories/payment.repository';
import { Timestamp, serverTimestamp } from '@angular/fire/firestore';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class PaymentBusiness {
  constructor(
    private paymentRepository: PaymentRepository,
    private userRepository: UserRepository
  ) {}

  async searchPayments(fromDate: Date, toDate: Date) {
    if (fromDate.getTime() > toDate.getTime()) {
      throw new Error('malformed params');
    }

    return await this.paymentRepository.findByPaymentAtRangeAsync(
      Timestamp.fromDate(fromDate),
      Timestamp.fromDate(toDate)
    );
  }

  async createPayment(dto: PaymentForCreate, creatorId: string) {
    const users = await this.userRepository.getAllAsync();
    const creator = users.find((u) => u.id == creatorId)!;
    const totalAmount = dto.aSide.reduce((total, current) => {
      return total + +current.amount;
    }, 0);
    const aSide = dto.aSide.map((a) => {
      const user = users.find((u) => u.id == a.userId)!;
      return { ...a, ...{ userName: user.userName } };
    });
    const bSide = dto.bSide.map((b) => {
      const user = users.find((u) => u.id == b.userId)!;
      return { ...b, ...{ userName: user.userName } };
    });

    const payment = {
      id: null,
      creatorId: creator.id,
      creatorName: creator.userName,
      createdAt: serverTimestamp(),
      isActive: true,
      paymentAt: Timestamp.fromDate(dto.paymentAt),
      status: PAYMENT_STATUS.CREATED,
      totalAmount: totalAmount,
      aSide: aSide,
      bSide: bSide,
    } as Payment;

    return await this.paymentRepository.addAsync(payment);
  }
}
