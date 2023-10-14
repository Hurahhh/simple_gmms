import { Entity } from './entity.type';
import { Payment } from './payment.type';
import { Timestamp } from '@angular/fire/firestore';

export type Bill = Entity & {
  totalAmount: number;
  payFromDate: Timestamp;
  payToDate: Timestamp;
  paymentIds: string[];
  settles: Settle[];
};

export type Settle = {
  aUserId: string;
  aUserName: string;
  bUserId: string;
  bUserName: string;
  amount: number;
};

export type GenerateBillParams = {
  payments: Payment[];
  payFromDate: Date;
  payToDate: Date;
};
