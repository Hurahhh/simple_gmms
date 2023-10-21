import {Injectable} from '@angular/core';
import {PAYMENT_STATUS} from '../constants/common.constant';
import {Payment, PaymentForCreate, PaymentForUpdate} from '../types/payment.type';
import {PaymentRepository} from '../repositories/payment.repository';
import {Timestamp, serverTimestamp} from '@angular/fire/firestore';
import {UserRepository} from '../repositories/user.repository';
import {SearchPaymentParams} from '../types/common.type';

@Injectable()
export class PaymentBusiness {
  constructor(
    private paymentRepository: PaymentRepository,
    private userRepository: UserRepository
  ) {}

  async searchPayments(prms: SearchPaymentParams) {
    if (prms.payFromDate.getTime() > prms.payToDate.getTime()) {
      throw new Error('malformed params');
    }

    const payments = await this.paymentRepository.findByPaymentAtRangeAsync(
      Timestamp.fromDate(prms.payFromDate),
      Timestamp.fromDate(prms.payToDate)
    );

    return payments
      .filter((p) => p.isActive)
      .sort((a, b) => {
        return a.paymentAt.toMillis() - b.paymentAt.toMillis();
      });
  }

  async createPayment(dto: PaymentForCreate, creatorId: string) {
    const users = await this.userRepository.getAllAsync();
    const creator = users.find((u) => u.id == creatorId)!;
    const totalAmount = dto.aSide.reduce((total, current) => {
      return total + +current.amount;
    }, 0);
    const aSide = dto.aSide.map((a) => {
      const user = users.find((u) => u.id == a.userId)!;
      return {...a, ...{userName: user.userName}};
    });
    const bSide = dto.bSide.map((b) => {
      const user = users.find((u) => u.id == b.userId)!;
      return {...b, ...{userName: user.userName}};
    });

    const payment = {
      id: null,
      creatorId: creator.id,
      creatorName: creator.userName,
      createdAt: serverTimestamp(),
      updatorId: null,
      updatedAt: null,
      updatorName: null,
      isActive: true,
      paymentAt: Timestamp.fromDate(dto.paymentAt),
      status: PAYMENT_STATUS.CREATED,
      totalAmount: totalAmount,
      aSide: aSide,
      bSide: bSide,
    } as Payment;

    return await this.paymentRepository.addAsync(payment);
  }

  async deletePayment(paymentId: string) {
    const payment = await this.paymentRepository.getAsync(paymentId);
    if (!payment) {
      throw new Error('nullable payment');
    }
    payment.isActive = false;
    await this.paymentRepository.updateAsync(payment);
  }

  async updatePayment(dto: PaymentForUpdate, updatorId: string) {
    const existingPayment = await this.paymentRepository.getAsync(dto.paymentId);
    if (!existingPayment) {
      throw new Error('nullable payment');
    }

    const users = await this.userRepository.getAllAsync();
    const updator = users.find((u) => u.id == updatorId)!;
    const totalAmount = dto.aSide.reduce((total, current) => {
      return total + +current.amount;
    }, 0);
    const aSide = dto.aSide.map((a) => {
      const user = users.find((u) => u.id == a.userId)!;
      return {...a, ...{userName: user.userName}};
    });
    const bSide = dto.bSide.map((b) => {
      const user = users.find((u) => u.id == b.userId)!;
      return {...b, ...{userName: user.userName}};
    });

    const newPayment = {
      id: dto.paymentId,
      creatorId: existingPayment.creatorId,
      creatorName: existingPayment.creatorName,
      createdAt: existingPayment.createdAt,
      updatorId: updatorId,
      updatorName: updator.userName,
      updatedAt: serverTimestamp(),
      isActive: true,
      paymentAt: Timestamp.fromDate(dto.paymentAt),
      status: PAYMENT_STATUS.EDITED,
      totalAmount: totalAmount,
      aSide: aSide,
      bSide: bSide,
    } as Payment;

    await this.paymentRepository.updateAsync(newPayment);
  }
}
