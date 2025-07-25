# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` / `ng serve` - Start development server on http://localhost:4200/
- `npm run build` / `ng build` - Build the project for production
- `npm test` / `ng test` - Run unit tests with Karma and Jasmine
- `npm run watch` / `ng build --watch --configuration development` - Build in watch mode for development

## Project Architecture

This is an Angular 20 application demonstrating multi-select functionality with contextual bulk actions. The app showcases a reusable data table component with multi-select capabilities and type-specific action buttons for Users and Orders.

### Core Architecture

- **Standalone Components**: All components use Angular's standalone component architecture (no NgModules)
- **Angular Material**: UI components built with Angular Material Design
- **TypeScript Signals**: Uses Angular signals for reactive state management
- **RxJS**: Observables for async operations and data streams

### Key Components

#### DataTableComponent (`src/app/components/data-table/`)
- Generic, reusable table component that accepts any `DataItem` type
- Toggleable multi-select mode with custom selection model
- Dynamic column display based on multi-select state
- Integrates with `MultiSelectActionsComponent` for bulk operations

#### MultiSelectActionsComponent (`src/app/components/multi-select-actions/`)
- Context-aware action buttons that change based on data type (users/orders)
- Async action handling with loading states and error management
- Uses RxJS operators (`take`, `tap`, `catchError`) for proper subscription management
- MatSnackBar integration for user feedback

#### CustomSelectionModel (`src/app/models/custom-selection.model.ts`)
- Extends Angular CDK's `SelectionModel` with custom ID-based comparison
- Ensures proper selection behavior across different data types

### Data Layer

#### DataService (`src/app/services/data.service.ts`)
- Simulates backend operations with Observable delays
- Provides mock data for users and orders
- Implements type-specific bulk operations (notifications, status updates, processing, etc.)
- In-memory state management for demo purposes

#### Data Types (`src/app/interfaces/data-item.interface.ts`)
- Union type system: `DataItem = User | Order`
- Common interface properties: `id`, `name`, `email`, `status`, `createdAt`, `type`
- Type-specific properties for business logic differentiation

### State Management Pattern

The application uses a parent-child communication pattern:
1. Parent components manage data fetching and overall state
2. `DataTableComponent` handles selection state internally
3. `MultiSelectActionsComponent` receives selected items and emits completion events
4. Actions clear selections and update parent state through event emission

### Development Notes

- All components are strongly typed with generics (`<T extends DataItem>`)
- Error handling follows a consistent pattern with user-friendly messages
- The app demonstrates proper Angular Material integration with accessibility features
- Uses Angular's new control flow syntax (`@if`, `@for`) instead of structural directives