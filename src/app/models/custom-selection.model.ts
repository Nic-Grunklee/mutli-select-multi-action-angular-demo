import { SelectionModel } from '@angular/cdk/collections';
import { DataItem } from '../interfaces/data-item.interface';

export class CustomSelectionModel<T extends DataItem> extends SelectionModel<T> {
  constructor(multiple = false, initiallySelectedValues?: T[], emitChanges = true) {
    super(multiple, initiallySelectedValues, emitChanges);
  }

  override isSelected(item: T): boolean {
    return this.selected.some(selectedItem => selectedItem.id === item.id);
  }
}