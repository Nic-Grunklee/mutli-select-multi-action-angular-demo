import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataItem, User, Order } from '../../interfaces/data-item.interface';
import { DataService } from '../../services/data.service';

export interface Action {
  type: string;
  action: (type: string) => void;
  label: string;
  icon: string;
  processing: boolean;
  width: string;
}

@Component({
  selector: 'app-multi-select-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="multi-select-container">
      <div class="action-buttons">
        @for (action of actions; track action.type) {
          @if (!action.processing) {
            <button class="action-button" mat-stroked-button color="primary" (click)="action.action(action.type)" [disabled]="!selectedItems.length" [ngStyle]="{'width': action.width}">
              <span>{{ action.label }}</span>
              <mat-icon iconPositionEnd *ngIf="action.icon">{{ action.icon }}</mat-icon>
            </button>
          } 
          @else {
            <button class="action-button" mat-raised-button color="primary" [disabled]="true" [ngStyle]="{'width': action.width}">
              <mat-spinner diameter="20"></mat-spinner>
            </button>
          }
        }
      </div>
      <div class="selected-count">
        <p>{{ selectedItems.length }} selected</p>
        <button mat-icon-button type="button" aria-label="Clear selected items" matTooltip="Clear selected items" (click)="clearSelectedItems()"><mat-icon>clear_all</mat-icon></button>
      </div>
    </div>
  `,
  styleUrls: ['./multi-select-actions.component.scss']
})
export class MultiSelectActionsComponent<T extends DataItem> implements OnInit {
  @Input() selectedItems: T[] = [];
  @Input() actionContext: 'users' | 'orders' = 'users';
  @Output() clearSelected = new EventEmitter<void>();

  actions: Action[] = [];

  userActions: Action[] = [
    {
      type: 'sendNotifications',
      action: (type: string) => this.sendUserNotifications(type),
      label: 'Send Notifications',
      icon: 'send',
      processing: false,
      width: '175px'
    },
    {
      type: 'updateStatus',
      action: (type: string) => this.updateUserStatus(type),
      label: 'Update Status',
      icon: 'update',
      processing: false,
      width: '150px'
    },
    {
      type: 'resetPasswords',
      action: (type: string) => this.resetUserPasswords(type),
      label: 'Reset Passwords',
      icon: 'lock_reset',
      processing: false,
      width: '160px'
    }
  ];

  orderActions: Action[] = [
    {
      type: 'processOrders',
      action: (type: string) => this.processOrders(type),
      label: 'Process Orders',
      icon: 'settings',
      processing: false,
      width: '150px'
    },
    {
      type: 'cancelOrders',
      action: (type: string) => this.cancelOrders(type),
      label: 'Cancel Orders',
      icon: 'cancel',
      processing: false,
      width: '150px'
    },
    {
      type: 'refundOrders',
      action: (type: string) => this.refundOrders(type),
      label: 'Refund Orders',
      icon: 'payments',
      processing: false,
      width: '150px'
    }
  ];

  constructor(
    private snackBar: MatSnackBar,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.actions = this.actionContext === 'users' ? this.userActions : this.orderActions;
  }

  clearSelectedItems() {
    this.clearSelected.emit();
  }

  setProcessing(type: string, value: boolean) {
    const action = this.actions.find(a => a.type === type);
    if (action) action.processing = value;
  }

  private showMessage(message: string, action = 'Close') {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  sendUserNotifications = (type: string) => {
    this.setProcessing(type, true);
    this.showMessage(`Sending notifications to ${this.selectedItems.length} users...`);
    setTimeout(() => {
      this.dataService.sendUserNotifications(this.selectedItems as User[]);
      this.showSuccess('Notifications sent successfully.');
      this.clearSelectedItems();
      this.setProcessing(type, false);
    }, 2000);
  };

  updateUserStatus = (type: string) => {
    this.setProcessing(type, true);
    this.showMessage(`Updating status for ${this.selectedItems.length} users...`);
    setTimeout(() => {
      this.dataService.updateUserStatus(this.selectedItems as User[]);
      this.showSuccess('User status updated successfully.');
      this.clearSelectedItems();
      this.setProcessing(type, false);
    }, 1500);
  };

  resetUserPasswords = (type: string) => {
    this.setProcessing(type, true);
    this.showMessage(`Resetting passwords for ${this.selectedItems.length} users...`);
    setTimeout(() => {
      this.dataService.resetUserPasswords(this.selectedItems as User[]);
      this.showSuccess('Passwords reset successfully.');
      this.clearSelectedItems();
      this.setProcessing(type, false);
    }, 2500);
  };

  processOrders = (type: string) => {
    this.setProcessing(type, true);
    this.showMessage(`Processing ${this.selectedItems.length} orders...`);
    setTimeout(() => {
      this.dataService.processOrders(this.selectedItems as Order[]);
      this.showSuccess('Orders processed successfully.');
      this.clearSelectedItems();
      this.setProcessing(type, false);
    }, 3000);
  };

  cancelOrders = (type: string) => {
    this.setProcessing(type, true);
    this.showMessage(`Cancelling ${this.selectedItems.length} orders...`);
    setTimeout(() => {
      this.dataService.cancelOrders(this.selectedItems as Order[]);
      this.showSuccess('Orders cancelled successfully.');
      this.clearSelectedItems();
      this.setProcessing(type, false);
    }, 1500);
  };

  refundOrders = (type: string) => {
    this.setProcessing(type, true);
    this.showMessage(`Refunding ${this.selectedItems.length} orders...`);
    setTimeout(() => {
      this.dataService.refundOrders(this.selectedItems as Order[]);
      this.showSuccess('Orders refunded successfully.');
      this.clearSelectedItems();
      this.setProcessing(type, false);
    }, 2000);
  };
}