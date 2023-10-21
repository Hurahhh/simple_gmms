import {Timestamp} from 'firebase/firestore';

export type Entity = {
  id: string | null;
  creatorId: string;
  creatorName: string;
  createdAt: Timestamp;
  updatorId: string | null;
  updatorName: string | null;
  updatedAt: Timestamp | null;
  isActive: boolean;
};
