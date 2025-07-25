export interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending' | 'updated' | 'reset';
  createdAt: Date;
  type: 'user';
  department: string;
  lastLogin: Date;
  lastNotified?: Date;
  statusChangedAt?: Date;
  passwordResetAt?: Date;
}

export interface Order {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending' | 'processed' | 'canceled' | 'refunded';
  createdAt: Date;
  type: 'order';
  amount: number;
  orderDate: Date;
  processedAt?: Date;
  canceledAt?: Date;
  refundedAt?: Date;
}

export type DataItem = User | Order;