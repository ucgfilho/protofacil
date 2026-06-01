export type ID = string;
export type ISODateTime = string;

export interface User {
  id: ID;
  name: string;
  email: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface AuthenticatedUser {
  id: ID;
  name: string;
  email: string;
}
