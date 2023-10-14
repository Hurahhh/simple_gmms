import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  runTransaction,
} from '@angular/fire/firestore';

import { BaseRepository } from './base.repository';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { Bill } from '../types/bill.type';
import { Payment } from '../types/payment.type';
import { PAYMENT_STATUS } from '../constants/common.constant';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class BillRepository implements BaseRepository<Bill> {
  public static readonly COLLECTION_NAME = 'bills';
  private readonly colRef: CollectionReference<DocumentData>;

  constructor(private fs: Firestore) {
    this.colRef = collection(this.fs, BillRepository.COLLECTION_NAME);
  }

  async getAsync(uid: string) {
    const docRef = doc(this.fs, BillRepository.COLLECTION_NAME, uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as Bill;
  }

  async getManyAsync(ids: string[]) {
    const _query = query(this.colRef, where('id', 'in', ids));
    const docsSnap = await getDocs(_query);
    if (docsSnap.empty) {
      return [];
    }

    return docsSnap.docs.map((d) => d.data() as Bill);
  }

  async getAllAsync() {
    const _query = query(this.colRef);
    const docsSnap = await getDocs(_query);
    if (docsSnap.empty) {
      return [];
    }

    return docsSnap.docs.map((d) => d.data() as Bill);
  }

  async addAsync(bill: Bill): Promise<Bill | null> {
    const docRef = await addDoc(this.colRef, bill);

    if (docRef.id) {
      bill.id = docRef.id;
      await this.updateAsync(bill);
      return await this.getAsync(docRef.id);
    }

    return null;
  }

  async updateAsync(bill: Bill): Promise<boolean> {
    throw new Error('not yet implemented');
  }

  async createBillAndUpdatePayment(bill: Bill) {
    await runTransaction(this.fs, async () => {
      // add bill
      const b = writeBatch(this.fs);
      const docRef = await addDoc(this.colRef, bill);
      b.set(docRef, bill);

      // update payment status
      const paymentColRef = collection(
        this.fs,
        PaymentRepository.COLLECTION_NAME
      );
      const _query = query(paymentColRef, where('id', 'in', bill.paymentIds));
      const docsSnap = await getDocs(_query);
      if (docsSnap.empty) {
        throw new Error('Link payments is empty');
      }
      const payments = docsSnap.docs.map((d) => d.data() as Payment);

      payments.forEach((payment) => {
        let status = PAYMENT_STATUS.SETTLED;
        if (payment.status == PAYMENT_STATUS.SETTLED) {
          status = PAYMENT_STATUS.DUPPLICATE_SETTLED;
        }
        b.update(doc(this.fs, PaymentRepository.COLLECTION_NAME, payment.id!), {
          status: status,
        });
      });

      // finish
      await b.commit();
    });
  }
}
