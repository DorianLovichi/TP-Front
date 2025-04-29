import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddItemRequest, ItemType, InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-add-item-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add Item</h2>
          <button class="close-button" (click)="close()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="itemName">Item Name:</label>
            <input type="text" id="itemName" [(ngModel)]="item.name" placeholder="Enter item name">
          </div>
          <div class="form-group">
            <label for="itemType">Item Type:</label>
            <select id="itemType" [(ngModel)]="item.type_id" class="select-input">
              <option [ngValue]="0" disabled>Select a type</option>
              <option *ngFor="let type of itemTypes" [ngValue]="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="itemQuantity">Quantity:</label>
            <input type="number" id="itemQuantity" [(ngModel)]="item.quantity" placeholder="Enter quantity">
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" (click)="close()">Cancel</button>
          <button class="add-button" (click)="submit()" [disabled]="!item.name || !item.type_id">
            Add Item
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        color: #333;
        font-size: 1.5em;
      }
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5em;
      color: #666;
      cursor: pointer;
      padding: 0;
      line-height: 1;

      &:hover {
        color: #333;
      }
    }

    .modal-body {
      padding: 20px;
    }

    .modal-footer {
      padding: 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .form-group {
      margin-bottom: 15px;

      label {
        display: block;
        margin-bottom: 5px;
        color: #333;
      }

      input, .select-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1em;

        &:focus {
          outline: none;
          border-color: #4a90e2;
        }
      }

      .select-input {
        background-color: white;
        cursor: pointer;

        &:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      }
    }

    .cancel-button {
      padding: 10px 20px;
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.2s;

      &:hover {
        background-color: #e0e0e0;
      }
    }

    .add-button {
      padding: 10px 20px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.2s;

      &:hover:not(:disabled) {
        background-color: #45a049;
      }

      &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    }
  `]
})
export class AddItemModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() characterId = 0;
  @Output() closeModal = new EventEmitter<void>();
  @Output() addItem = new EventEmitter<AddItemRequest>();

  item: AddItemRequest = {
    character_id: 0,
    name: '',
    type_id: 0,
    quantity: 1
  };

  itemTypes: ItemType[] = [];
  loading = false;
  error: string | null = null;

  constructor(private inventoryService: InventoryService) { }

  ngOnInit() {
    this.loadItemTypes();
  }

  private loadItemTypes() {
    this.loading = true;
    this.inventoryService.getItemTypes().subscribe({
      next: (response) => {
        this.itemTypes = response.item_types;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load item types';
        this.loading = false;
        console.error('Error loading item types:', err);
      }
    });
  }

  close() {
    this.closeModal.emit();
  }

  submit() {
    if (!this.item.name || !this.item.type_id) {
      return;
    }
    this.item.character_id = this.characterId;
    this.addItem.emit(this.item);
    this.resetForm();
  }

  private resetForm() {
    this.item = {
      character_id: this.characterId,
      name: '',
      type_id: 0,
      quantity: 1
    };
  }
} 