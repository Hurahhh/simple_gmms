import {Entity} from "./entity.type";

export type Bill = Entity & {
  totalAmount: number;
  paymentIds: number[];
  settles: Settle[];
}

export  type  Settle = {
  aUserId: string;
  aUserName: string;
  bUserId: string;
  bUserName: string;
  amount: number
}
