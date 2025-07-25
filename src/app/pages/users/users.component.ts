import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../components/data-table/data-table.component';
import { DataService } from '../../services/data.service';
import { User } from '../../interfaces/data-item.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="page-container">
      <app-data-table
        [dataSource]="users() || []"
        [displayedColumns]="displayedColumns"
        [actionContext]="'users'"
        title="Users Management">
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
export class UsersComponent {
  private dataService = inject(DataService);
  users = this.dataService.users;
  displayedColumns = ['name', 'email', 'department', 'status', 'lastLogin', 'createdAt'];

  constructor() {
    this.dataService.loadUsers();
  }
}