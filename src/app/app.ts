import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Multi-Select Demo</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/orders" routerLinkActive="active">Orders Table Example</button>
      <button mat-button routerLink="/users" routerLinkActive="active">Users Table Example</button>
    </mat-toolbar>
    
    <router-outlet />
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    .active {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class App {
  protected readonly title = signal('multi-select-multi-action');
}
