import {Entity} from "./entity.type";

export type Bill = Entity & {
  totalAmount: number;
  paymentIds: number[];
  settles: {
    aUserId: string;
    aUserName: string;
    bUserId: string;
    bUserName: string;
    amount: number
  }[];
}
