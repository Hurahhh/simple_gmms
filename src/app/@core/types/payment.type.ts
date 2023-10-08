import { Entity } from './entity.type';
import { PAYMENT_STATUS } from '../constants/common.constant';
import { Timestamp } from 'firebase/firestore';

export type Payment = Entity & {
  paymentAt: Timestamp;
  status: PAYMENT_STATUS;
  totalAmount: number;
  aSide: {
    userId: string;
    userName: string;
    amount: number;
    description: string;
  }[];
  bSide: {
    userId: string;
    userName: string;
  }[];
};

export type PaymentForCreate = {
  paymentAt: Date;
  aSide: {
    userId: string;
    amount: number;
    description: string;
  }[];
  bSide: {
    userId: string;
  }[];
};
