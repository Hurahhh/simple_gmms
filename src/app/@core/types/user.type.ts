import { Entity } from './entity.type';

export type User = Entity & {
  userName: string;
  email: string;
};
