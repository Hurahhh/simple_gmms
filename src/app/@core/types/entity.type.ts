import { Timestamp } from 'firebase/firestore';

export type Entity = {
  id: string | null;
  creatorId: string;
  creatorName: string;
  createdAt: Timestamp;
  isActive: boolean;
};
