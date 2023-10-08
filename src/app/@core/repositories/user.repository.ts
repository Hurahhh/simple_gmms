import { Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';

import { BaseRepository } from './base.repository';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { User } from '../types/user.type';

@Injectable()
export class UserRepository implements BaseRepository<User> {
  public static readonly COLLECTION_NAME = 'users';
  private readonly colRef: CollectionReference<DocumentData>;

  constructor(private fs: Firestore) {
    this.colRef = collection(this.fs, UserRepository.COLLECTION_NAME);
  }

  async getAsync(uid: string) {
    const docRef = doc(this.fs, UserRepository.COLLECTION_NAME, uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as User;
  }

  async getManyAsync(ids: string[]) {
    const _query = query(this.colRef, where('id', 'in', ids));
    const docsSnap = await getDocs(_query);
    if (docsSnap.empty) {
      return [];
    }

    return docsSnap.docs.map((d) => d.data() as User);
  }

  async getAllAsync() {
    const _query = query(this.colRef);
    const docsSnap = await getDocs(_query);
    if (docsSnap.empty) {
      return [];
    }

    return docsSnap.docs.map((d) => d.data() as User);
  }

  async addAsync(user: User): Promise<User | null> {
    throw new Error('not yet implemented');
  }

  async updateAsync(user: User): Promise<boolean> {
    throw new Error('not yet implemented');
  }
}
