import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService, Inventory, AddItemRequest } from '../../services/inventory.service';
import { CharacterService, Character } from '../../services/character.service';
import { AddItemModalComponent } from './add-item-modal/add-item-modal.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AddItemModalComponent],
  template: `
    <div class="inventory-container">
      <div *ngIf="!characterId && !activeCharacter" class="no-character-selected">
        <h1>Select a Character</h1>
        <p>Please select a character to view their inventory.</p>
        <button class="back-button" routerLink="/characters">Go to Characters</button>
      </div>

      <div *ngIf="characterId || activeCharacter">
        <div class="inventory-header">
          <h1>Inventory - {{ inventory?.character_name }}</h1>
          <button class="add-item-button" (click)="openAddItemModal()" *ngIf="inventory">
            Add Item
          </button>
        </div>
        
        <div class="inventory-grid" *ngIf="inventory">
          <div class="inventory-item" *ngFor="let item of inventory.items">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-type">Type: {{ item.type }}</div>
            <div class="item-quantity">Quantity: {{ item.quantity }}</div>
          </div>
        </div>

        <div class="loading" *ngIf="loading">Loading inventory...</div>
        <div class="error" *ngIf="error">{{ error }}</div>
      </div>

      <app-add-item-modal
        [isOpen]="isAddItemModalOpen"
        [characterId]="characterId || (activeCharacter?.id || 0)"
        (closeModal)="closeAddItemModal()"
        (addItem)="addItem($event)">
      </app-add-item-modal>
    </div>
  `,
  styles: [`
    .inventory-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .inventory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    h1 {
      color: #333;
      margin: 0;
    }

    .add-item-button {
      padding: 10px 20px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.2s;

      &:hover {
        background-color: #45a049;
      }
    }

    .inventory-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .inventory-item {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .item-name {
      font-weight: bold;
      font-size: 1.1em;
      margin-bottom: 8px;
    }

    .item-type {
      color: #666;
      margin-bottom: 4px;
    }

    .item-quantity {
      color: #444;
    }

    .loading {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }

    .error {
      color: #dc3545;
      text-align: center;
      margin-top: 20px;
    }

    .no-character-selected {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      h1 {
        color: #333;
        margin-bottom: 16px;
      }

      p {
        color: #666;
        margin-bottom: 24px;
      }
    }

    .back-button {
      padding: 10px 20px;
      background-color: #4a90e2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.2s;

      &:hover {
        background-color: #357abd;
      }
    }
  `]
})
export class InventoryComponent implements OnInit {
  inventory: Inventory | null = null;
  loading = false;
  error: string | null = null;
  characterId: number | null = null;
  activeCharacter: Character | null = null;
  isAddItemModalOpen = false;

  constructor(
    private inventoryService: InventoryService,
    private characterService: CharacterService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.characterId = params['id'] ? +params['id'] : null;
      if (this.characterId) {
        this.loadInventory(this.characterId);
      } else {
        this.loadActiveCharacter();
      }
    });
  }

  private loadActiveCharacter() {
    this.loading = true;
    this.characterService.getUserCharacters().subscribe({
      next: (characters) => {
        this.activeCharacter = characters.find(char => char.is_active) || null;
        if (this.activeCharacter) {
          this.loadInventory(this.activeCharacter.id);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load active character. Please try again later.';
        this.loading = false;
        console.error('Error loading active character:', err);
      }
    });
  }

  private loadInventory(characterId: number) {
    this.loading = true;
    this.error = null;
    
    this.inventoryService.getInventory(characterId).subscribe({
      next: (data) => {
        this.inventory = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load inventory. Please try again later.';
        this.loading = false;
        console.error('Error loading inventory:', err);
      }
    });
  }

  openAddItemModal() {
    this.isAddItemModalOpen = true;
  }

  closeAddItemModal() {
    this.isAddItemModalOpen = false;
  }

  addItem(item: AddItemRequest) {
    this.loading = true;
    this.error = null;

    this.inventoryService.addItem(item).subscribe({
      next: () => {
        this.loadInventory(item.character_id);
        this.closeAddItemModal();
      },
      error: (err) => {
        this.error = 'Failed to add item. Please try again later.';
        this.loading = false;
        console.error('Error adding item:', err);
      }
    });
  }
} 