import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../components/data-table/data-table.component';
import { DataService } from '../../services/data.service';
import { Order } from '../../interfaces/data-item.interface';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="page-container">
      <app-data-table
        [dataSource]="orders() || []"
        [displayedColumns]="displayedColumns"
        [actionContext]="'orders'"
        title="Orders Management">
      </app-data-table>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }
    }
  `]
})
export class OrdersComponent {
  private dataService = inject(DataService);
  orders = this.dataService.orders;
  displayedColumns = ['name', 'email', 'amount', 'status', 'orderDate', 'createdAt'];

  constructor() {
    this.dataService.loadOrders();
  }
}