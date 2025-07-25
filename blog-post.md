# Building an Extensible Multi-Select Table with Batch Actions in Angular

When building data-heavy applications, one feature request comes up again and again: "Can we select multiple rows and perform bulk actions?" What seems like a simple requirement quickly becomes complex when you need to handle different contexts, maintain state across data refreshes, and make it easy to add new actions without rewriting everything.

I recently built a clean, extensible multi-select solution for Angular that addresses these challenges. Here's how I approached it and the key patterns that make it work.

## The Problem: More Than Just Checkboxes

Our application had several data tables showing different types of records (users, orders, documents), and users needed to perform bulk operations like:

- Sending batch notifications to users
- Processing multiple orders at once
- Resetting passwords in bulk
- Cancelling or refunding groups of orders

The challenge wasn't just adding checkboxes to a table - it was building something that could:

1. **Handle different actions per context** - User tables need different bulk actions than order tables
2. **Maintain selection state** across data updates and component re-renders
3. **Scale easily** - Adding a new bulk action should be straightforward
4. **Provide good UX** - Clear visual feedback, loading states, and smooth transitions

## The Architecture: Three Key Components

### 1. Custom Selection Model

The first challenge was selection persistence. Angular Material's `SelectionModel` uses object reference equality, but when data refreshes from the server, the same logical record might be represented by different object instances.

```typescript
import { SelectionModel } from "@angular/cdk/collections";
import { DataItem } from "../interfaces/data-item.interface";

export class CustomSelectionModel<T extends DataItem> extends SelectionModel<T> {
  constructor(multiple = false, initiallySelectedValues?: T[], emitChanges = true) {
    super(multiple, initiallySelectedValues, emitChanges);
  }

  override isSelected(item: T): boolean {
    return this.selected.some((selectedItem) => selectedItem.id === item.id);
  }
}
```

This simple override changes the comparison from object reference to `id` matching, ensuring selections persist across data operations. It's a small change with big implications for user experience.

### 2. Type-Safe Data Interfaces

The system works with a union type approach that allows strong typing while supporting different data types:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending" | "updated" | "reset";
  createdAt: Date;
  type: "user";
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
  status: "active" | "inactive" | "pending" | "processed" | "canceled" | "refunded";
  createdAt: Date;
  type: "order";
  amount: number;
  orderDate: Date;
  processedAt?: Date;
  canceledAt?: Date;
  refundedAt?: Date;
}

export type DataItem = User | Order;
```

### 3. Generic Multi-Select Actions Component

The core of the solution is a generic component that handles context-aware actions and processing states:

```typescript
export interface Action {
  type: string;
  action: (type: string) => void;
  label: string;
  icon: string;
  processing: boolean;
  width: string;
}

@Component({
  selector: "app-multi-select-actions",
  standalone: true,
  template: `
    <div class="multi-select-container">
      <div class="action-buttons">
        @for (action of actions; track action.type) { @if (!action.processing) {
        <button class="action-button" mat-stroked-button color="primary" (click)="action.action(action.type)" [disabled]="!selectedItems.length" [ngStyle]="{ width: action.width }">
          <span>{{ action.label }}</span>
          <mat-icon iconPositionEnd *ngIf="action.icon">{{ action.icon }}</mat-icon>
        </button>
        } @else {
        <button class="action-button" mat-raised-button color="primary" [disabled]="true" [ngStyle]="{ width: action.width }">
          <mat-spinner diameter="20"></mat-spinner>
        </button>
        } }
      </div>
      <div class="selected-count">
        <p>{{ selectedItems.length }} selected</p>
        <button mat-icon-button type="button" aria-label="Clear selected items" matTooltip="Clear selected items" (click)="clearSelectedItems()">
          <mat-icon>clear_all</mat-icon>
        </button>
      </div>
    </div>
  `,
})
export class MultiSelectActionsComponent<T extends DataItem> implements OnInit {
  @Input() selectedItems: T[] = [];
  @Input() actionContext: "users" | "orders" = "users";
  @Output() clearSelected = new EventEmitter<void>();

  actions: Action[] = [];

  userActions: Action[] = [
    {
      type: "sendNotifications",
      action: (type: string) => this.sendUserNotifications(type),
      label: "Send Notifications",
      icon: "send",
      processing: false,
      width: "175px",
    },
    {
      type: "updateStatus",
      action: (type: string) => this.updateUserStatus(type),
      label: "Update Status",
      icon: "update",
      processing: false,
      width: "150px",
    },
    {
      type: "resetPasswords",
      action: (type: string) => this.resetUserPasswords(type),
      label: "Reset Passwords",
      icon: "lock_reset",
      processing: false,
      width: "160px",
    },
  ];

  orderActions: Action[] = [
    {
      type: "processOrders",
      action: (type: string) => this.processOrders(type),
      label: "Process Orders",
      icon: "settings",
      processing: false,
      width: "150px",
    },
    {
      type: "cancelOrders",
      action: (type: string) => this.cancelOrders(type),
      label: "Cancel Orders",
      icon: "cancel",
      processing: false,
      width: "150px",
    },
    {
      type: "refundOrders",
      action: (type: string) => this.refundOrders(type),
      label: "Refund Orders",
      icon: "payments",
      processing: false,
      width: "150px",
    },
  ];

  ngOnInit() {
    this.actions = this.actionContext === "users" ? this.userActions : this.orderActions;
  }

  setProcessing(type: string, value: boolean) {
    const action = this.actions.find((a) => a.type === type);
    if (action) action.processing = value;
  }

  // Action implementations follow consistent pattern
  sendUserNotifications = (type: string) => {
    this.setProcessing(type, true);
    this.showMessage(`Sending notifications to ${this.selectedItems.length} users...`);

    // setTimeout to mock API Call
    setTimeout(() => {
      this.dataService.sendUserNotifications(this.selectedItems as User[]);
      this.showSuccess("Notifications sent successfully.");
      this.clearSelectedItems();
      this.setProcessing(type, false);
    }, 2000);
  };
}
```

The key insight here is separating **what actions are available** (configuration) from **how they're executed** (implementation). Each action follows the same pattern but can have completely different business logic.

### 4. Generic Data Table Integration

The table component handles selection state and integrates the actions component seamlessly:

```typescript
@Component({
  selector: "app-data-table",
  standalone: true,
  template: `
    <div class="data-table-page-container">
      <h1 class="data-table-title">{{ title }}</h1>

      <div class="actions-bar-placeholder">
        <app-multi-select-actions *ngIf="multiSelect" [@fadeInOut] [selectedItems]="selection.selected" [actionContext]="actionContext" (clearSelected)="clearSelection()"></app-multi-select-actions>
      </div>

      <div class="multi-select-toggle-row">
        <ng-container *ngIf="!multiSelect; else activeMultiSelect">
          <button mat-stroked-button color="basic" (click)="toggleMultiSelect()">
            <mat-icon>check</mat-icon>
            Multi select
          </button>
        </ng-container>
        <ng-template #activeMultiSelect>
          <button mat-raised-button color="primary" (click)="toggleMultiSelect()">
            <mat-icon>check</mat-icon>
            Multi select
          </button>
        </ng-template>
      </div>

      <div class="table-wrapper">
        <table mat-table [dataSource]="dataSource || []" class="mat-elevation-2">
          @if (multiSelect) {
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox [checked]="isAllSelected()" [indeterminate]="isIndeterminate()" (change)="toggleAllOnPage($event.checked)"> </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox [checked]="selection.isSelected(row)" (change)="checkRow(row)"> </mat-checkbox>
            </td>
          </ng-container>
          }

          <!-- Dynamic column definitions based on data type -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let row">{{ row.name }}</td>
          </ng-container>

          <!-- Additional columns... -->

          <tr mat-header-row *matHeaderRowDef="currentDisplayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: currentDisplayedColumns"></tr>
        </table>
      </div>
    </div>
  `,
})
export class DataTableComponent<T extends DataItem> implements OnInit, OnChanges {
  @Input() dataSource: T[] = [];
  @Input() title = "Data Table";
  @Input() actionContext: "users" | "orders" = "users";
  @Input() displayedColumns: string[] = ["name", "email", "status", "createdAt"];

  multiSelect = false;
  selection = new CustomSelectionModel<T>(true, []);
  currentDisplayedColumns: string[] = [];

  toggleMultiSelect() {
    this.multiSelect = !this.multiSelect;
    this.currentDisplayedColumns = this.multiSelect ? ["select", ...this.displayedColumns] : [...this.displayedColumns];

    if (!this.multiSelect) {
      this.selection.clear();
    }
  }

  checkRow(row: T) {
    this.selection.toggle(row);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.length || 0;
    return numSelected === numRows && numRows > 0;
  }

  toggleAllOnPage(isChecked: boolean) {
    if (isChecked) {
      this.dataSource?.forEach((row) => this.selection.select(row));
    } else {
      this.dataSource?.forEach((row) => this.selection.deselect(row));
    }
  }
}
```

## State Management with Angular Signals

The data service leverages Angular's new signals API for reactive state management:

```typescript
@Injectable({
  providedIn: "root",
})
export class DataService {
  private _users: WritableSignal<User[] | null> = signal(null);
  private _orders: WritableSignal<Order[] | null> = signal(null);

  readonly users: Signal<User[] | null> = this._users;
  readonly orders: Signal<Order[] | null> = this._orders;

  // User-specific actions
  sendUserNotifications(users: User[]): void {
    console.log(
      "Sending notifications to users:",
      users.map((u) => u.name)
    );
    const now = new Date();
    const currentUsers = this._users() || [];
    const updatedUsers = currentUsers.map((user) => (users.some((u) => u.id === user.id) ? ({ ...user, lastNotified: now } as User) : user));
    this._users.set(updatedUsers);
  }

  // Order-specific actions
  processOrders(orders: Order[]): void {
    console.log(
      "Processing orders:",
      orders.map((o) => o.name)
    );
    const now = new Date();
    const currentOrders = this._orders() || [];
    const updatedOrders = currentOrders.map((order) => (orders.some((o) => o.id === order.id) ? ({ ...order, status: "processed", processedAt: now } as Order) : order));
    this._orders.set(updatedOrders);
  }
}
```

## Adding New Actions: The 2-Step Process

One of the best parts of this architecture is how simple it is to add new bulk actions. Here's the complete process:

**Step 1: Implement the action method**

```typescript
bulkArchiveUsers = (type: string) => {
  this.setProcessing(type, true);
  this.showMessage(`Archiving ${this.selectedItems.length} users...`);

  // setTimeout to mock API Call
  setTimeout(() => {
    this.dataService.archiveUsers(this.selectedItems as User[]);
    this.showSuccess("Users archived successfully.");
    this.clearSelectedItems();
    this.setProcessing(type, false);
  }, 1500);
};
```

**Step 2: Add it to the appropriate action array**

```typescript
userActions: Action[] = [
  // existing actions...
  {
    type: 'bulkArchive',
    action: (type: string) => this.bulkArchiveUsers(type),
    label: 'Archive Users',
    icon: 'archive',
    processing: false,
    width: '150px'
  }
];
```

That's it. No template changes, no complex routing logic, no new components. The framework handles the rest.

## Key Design Decisions

### Context-Aware Actions

Rather than trying to build one universal action set, I made actions context-specific through the `actionContext` input. User tables show user-specific actions (notifications, password resets), while order tables show order-specific actions (processing, cancellation, refunds). This keeps the UI focused and prevents dangerous actions from appearing in the wrong context.

### Processing State Management

Each action manages its own loading state through the `setProcessing` method. This allows multiple actions to be triggered without interfering with each other, and provides clear visual feedback about what's happening. The spinner replaces the button content during processing.

### Consistent Action Patterns

Every action follows the same flow:

1. Set processing state to true and show progress message
2. Perform the operation (with simulated delay for demo)
3. Show success/error message via MatSnackBar
4. Clear selections and reset processing state

This consistency makes the feature predictable for users and maintainable for developers.

### Modern Angular Features

The implementation leverages Angular's latest features:

- **Standalone Components** - No NgModules required
- **New Control Flow** - `@if` and `@for` instead of structural directives
- **Angular Signals** - Reactive state management
- **Angular Material** - Consistent UI components and animations

## The Results

This architecture has served us well across multiple table implementations. Adding new bulk actions is now a 5-minute task instead of a multi-hour refactoring session. The consistent UX patterns mean users know what to expect, and the separation of concerns makes the code easy to test and maintain.

The generic typing (`<T extends DataItem>`) means the same components work with any data type that implements the base interface. Here's how the same table handles different contexts:

```typescript
// Users page
<app-data-table
  [dataSource]="users() || []"
  [displayedColumns]="['name', 'email', 'status', 'department', 'lastLogin']"
  [actionContext]="'users'"
  title="User Management">
</app-data-table>

// Orders page
<app-data-table
  [dataSource]="orders() || []"
  [displayedColumns]="['name', 'email', 'status', 'amount', 'orderDate']"
  [actionContext]="'orders'"
  title="Order Management">
</app-data-table>
```

The same multi-select system handles both scenarios seamlessly, with the custom selection model ensuring robust state management across all the complex interactions users expect from modern data tables.

## Key Takeaways

1. **Solve the right problem** - Object reference vs. value equality in selection models is crucial
2. **Separate configuration from implementation** - Action arrays make extensibility trivial
3. **Consistent patterns win** - Standardized action signatures and UX flows reduce cognitive load
4. **Context matters** - Different pages need different actions, embrace that instead of fighting it
5. **State management is critical** - Processing states and selection persistence make or break the UX
6. **Leverage modern Angular** - Signals, standalone components, and new control flow syntax improve the developer experience

Sometimes the best solutions aren't the most clever ones - they're the ones that make the next feature request easy to implement. This multi-select system proves that good architecture is measured not just by what it does today, but by how easily it adapts to tomorrow's requirements.

## Live Demo

You can see this implementation in action by running:

```bash
npm install
ng serve
```

The demo includes both user and order management pages, showcasing how the same components adapt to different data types and business requirements while maintaining a consistent user experience.
