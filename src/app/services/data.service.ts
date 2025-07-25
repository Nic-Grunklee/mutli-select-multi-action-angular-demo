import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { DataItem, User, Order } from '../interfaces/data-item.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _users: WritableSignal<User[] | null> = signal(null);
  private _orders: WritableSignal<Order[] | null> = signal(null);
  private usersLoaded = false;
  private ordersLoaded = false;

  // Expose as readonly signals
  readonly users: Signal<User[] | null> = this._users;
  readonly orders: Signal<Order[] | null> = this._orders;

  constructor() {
    // Do not load data until first access
  }

  loadUsers() {
    if (!this.usersLoaded) {
      this.usersLoaded = true;
      // Use setTimeout to mock API call
      setTimeout(() => {
        this._users.set([
          {
            id: 'u1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            status: 'active',
            createdAt: new Date('2024-01-15'),
            type: 'user',
            department: 'Engineering',
            lastLogin: new Date('2024-07-10')
          },
          {
            id: 'u2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            status: 'inactive',
            createdAt: new Date('2024-02-20'),
            type: 'user',
            department: 'Marketing',
            lastLogin: new Date('2024-06-15')
          },
          {
            id: 'u3',
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            status: 'pending',
            createdAt: new Date('2024-03-10'),
            type: 'user',
            department: 'Sales',
            lastLogin: new Date('2024-07-08')
          },
          {
            id: 'u4',
            name: 'Alice Wilson',
            email: 'alice.wilson@example.com',
            status: 'active',
            createdAt: new Date('2024-04-05'),
            type: 'user',
            department: 'Engineering',
            lastLogin: new Date('2024-07-11')
          },
          {
            id: 'u5',
            name: 'Charlie Brown',
            email: 'charlie.brown@example.com',
            status: 'active',
            createdAt: new Date('2024-05-12'),
            type: 'user',
            department: 'Design',
            lastLogin: new Date('2024-07-09')
          }
        ]);
      }, 500);
    }
  }

  loadOrders() {
    if (!this.ordersLoaded) {
      this.ordersLoaded = true;
      // Use setTimeout to mock API call
      setTimeout(() => {
        this._orders.set([
          {
            id: 'o1',
            name: 'Order #1001',
            email: 'customer1@example.com',
            status: 'active',
            createdAt: new Date('2024-07-01'),
            type: 'order',
            amount: 299.99,
            orderDate: new Date('2024-07-01')
          },
          {
            id: 'o2',
            name: 'Order #1002',
            email: 'customer2@example.com',
            status: 'pending',
            createdAt: new Date('2024-07-03'),
            type: 'order',
            amount: 149.50,
            orderDate: new Date('2024-07-03')
          },
          {
            id: 'o3',
            name: 'Order #1003',
            email: 'customer3@example.com',
            status: 'inactive',
            createdAt: new Date('2024-07-05'),
            type: 'order',
            amount: 599.99,
            orderDate: new Date('2024-07-05')
          },
          {
            id: 'o4',
            name: 'Order #1004',
            email: 'customer4@example.com',
            status: 'active',
            createdAt: new Date('2024-07-08'),
            type: 'order',
            amount: 89.99,
            orderDate: new Date('2024-07-08')
          }
        ]);
      }, 500);
    }
  }

  // User-specific actions
  sendUserNotifications(users: User[]): void {
    console.log('Sending notifications to users:', users.map(u => u.name));
    const now = new Date();
    const currentUsers = this._users() || [];
    const updatedUsers = currentUsers.map(user =>
      users.some(u => u.id === user.id)
        ? { ...user, lastNotified: now } as User
        : user
    );
    this._users.set(updatedUsers);
  }

  updateUserStatus(users: User[]): void {
    console.log('Updating user status for:', users.map(u => u.name), 'to: updated');
    const now = new Date();
    const currentUsers = this._users() || [];
    const updatedUsers = currentUsers.map(user =>
      users.some(u => u.id === user.id)
        ? { ...user, status: 'updated', statusChangedAt: now } as User
        : user
    );
    this._users.set(updatedUsers);
  }

  resetUserPasswords(users: User[]): void {
    console.log('Resetting passwords for users:', users.map(u => u.name));
    const now = new Date();
    const currentUsers = this._users() || [];
    const updatedUsers = currentUsers.map(user =>
      users.some(u => u.id === user.id)
        ? { ...user, status: 'reset', passwordResetAt: now } as User
        : user
    );
    this._users.set(updatedUsers);
  }

  // Order-specific actions
  processOrders(orders: Order[]): void {
    console.log('Processing orders:', orders.map(o => o.name));
    const now = new Date();
    const currentOrders = this._orders() || [];
    const updatedOrders = currentOrders.map(order =>
      orders.some(o => o.id === order.id)
        ? { ...order, status: 'processed', processedAt: now } as Order
        : order
    );
    this._orders.set(updatedOrders);
  }

  cancelOrders(orders: Order[]): void {
    console.log('Cancelling orders:', orders.map(o => o.name));
    const now = new Date();
    const currentOrders = this._orders() || [];
    const updatedOrders = currentOrders.map(order =>
      orders.some(o => o.id === order.id)
        ? { ...order, status: 'canceled', canceledAt: now } as Order
        : order
    );
    this._orders.set(updatedOrders);
  }

  refundOrders(orders: Order[]): void {
    console.log('Refunding orders:', orders.map(o => o.name));
    const now = new Date();
    const currentOrders = this._orders() || [];
    const updatedOrders = currentOrders.map(order =>
      orders.some(o => o.id === order.id)
        ? { ...order, status: 'refunded', refundedAt: now } as Order
        : order
    );
    this._orders.set(updatedOrders);
  }
}