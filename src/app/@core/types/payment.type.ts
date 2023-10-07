import { PAYMENT_STATUS } from '../constants/common.constant';

export type Payment = {
  paymentId: string;
  creatorId: string;
  creatorName: string;
  createdAt: Date;
  paymentAt: Date;
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
