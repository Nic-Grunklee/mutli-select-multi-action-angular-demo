import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { DataItem } from '../../interfaces/data-item.interface';
import { CustomSelectionModel } from '../../models/custom-selection.model';
import { MultiSelectActionsComponent } from '../multi-select-actions/multi-select-actions.component';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MultiSelectActionsComponent
  ],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(30px)'
      })),
      transition(':enter', [
        animate('300ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({
          opacity: 0,
          transform: 'translateY(30px)'
        }))
      ])
    ])
  ],
  template: `
    <div class="data-table-page-container">
      <h1 class="data-table-title">{{ title }}</h1>

      <div class="actions-bar-placeholder">
        <app-multi-select-actions
          *ngIf="multiSelect"
          [@fadeInOut]
          [selectedItems]="selection.selected"
          [actionContext]="actionContext"
          (clearSelected)="clearSelection()"
        ></app-multi-select-actions>
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
                <mat-checkbox 
                  [checked]="isAllSelected()"
                  [indeterminate]="isIndeterminate()"
                  (change)="toggleAllOnPage($event.checked)">
                </mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-checkbox 
                  [checked]="selection.isSelected(row)"
                  (change)="checkRow(row)">
                </mat-checkbox>
              </td>
            </ng-container>
          }

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let row">{{ row.name }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let row">{{ row.email }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip 
                [ngClass]="'status-' + row.status"
                class="status-chip">
                {{ row.status | titlecase }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip class="type-chip">
                {{ row.type | titlecase }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let row">{{ row.createdAt | date:'short' }}</td>
          </ng-container>

          <!-- User-specific columns -->
          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let row">{{ row.department }}</td>
          </ng-container>

          <ng-container matColumnDef="lastLogin">
            <th mat-header-cell *matHeaderCellDef>Last Login</th>
            <td mat-cell *matCellDef="let row">{{ row.lastLogin | date:'short' }}</td>
          </ng-container>

          <!-- Order-specific columns -->
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let row">{{ row.amount | currency }}</td>
          </ng-container>

          <ng-container matColumnDef="orderDate">
            <th mat-header-cell *matHeaderCellDef>Order Date</th>
            <td mat-cell *matCellDef="let row">{{ row.orderDate | date:'short' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="currentDisplayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: currentDisplayedColumns;"></tr>
        </table>
      </div>

      @if (!dataSource || dataSource.length === 0) {
        <div class="no-data">
          <mat-icon>inbox</mat-icon>
          <p>No data available</p>
        </div>
      }
    </div>
  `,
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent<T extends DataItem> implements OnInit, OnChanges {
  @Input() dataSource: T[] = [];
  @Input() title = 'Data Table';
  @Input() actionContext: 'users' | 'orders' = 'users';
  @Input() displayedColumns: string[] = ['name', 'email', 'status', 'createdAt'];

  multiSelect = false;
  selection = new CustomSelectionModel<T>(true, []);
  currentDisplayedColumns: string[] = [];

  ngOnInit() {
    this.currentDisplayedColumns = [...this.displayedColumns];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataSource'] && changes['dataSource'].currentValue) {
      // Clear selection when data changes to avoid stale selections
      this.selection.clear();
    }
  }

  toggleMultiSelect() {
    this.multiSelect = !this.multiSelect;
    this.currentDisplayedColumns = this.multiSelect
      ? ['select', ...this.displayedColumns]
      : [...this.displayedColumns];

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

  isIndeterminate(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.length || 0;
    return numSelected > 0 && numSelected < numRows;
  }

  toggleAllOnPage(isChecked: boolean) {
    if (isChecked) {
      this.dataSource?.forEach(row => this.selection.select(row));
    } else {
      this.dataSource?.forEach(row => this.selection.deselect(row));
    }
  }

  clearSelection() {
    this.selection.clear();
  }

}