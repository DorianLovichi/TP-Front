import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CharacterService, Character, CreateCharacterRequest } from '../../services/character.service';
import { CreateCharacterModalComponent } from './create-character-modal/create-character-modal.component';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CommonModule, RouterModule, CreateCharacterModalComponent],
  template: `
    <div class="characters-container">
      <div class="characters-header">
        <h1>My Characters</h1>
        <button class="create-character-button" (click)="openCreateCharacterModal()">
          Create New Character
        </button>
      </div>
      
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="characters-grid" *ngIf="characters.length > 0">
        <div class="character-card" *ngFor="let character of characters">
          <div class="character-header">
            <h3>{{ character.name }}</h3>
            <span class="status-badge" [class.active]="character.is_active">
              {{ character.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="character-info">
            <div class="info-row">
              <span class="label">Class:</span>
              <span class="value">{{ character.class }}</span>
            </div>
            <div class="info-row">
              <span class="label">Race:</span>
              <span class="value">{{ character.race }}</span>
            </div>
            <div class="info-row">
              <span class="label">Level:</span>
              <span class="value">{{ character.level }}</span>
            </div>
            <div class="stats-grid">
              <div class="stat">
                <span class="stat-label">Health</span>
                <span class="stat-value">{{ character.health }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Attack</span>
                <span class="stat-value">{{ character.attack }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Defense</span>
                <span class="stat-value">{{ character.defense }}</span>
              </div>
            </div>
          </div>
          <div class="character-actions">
            <button 
              class="select-button" 
              *ngIf="!character.is_active"
              (click)="selectCharacter(character)">
              Select
            </button>
            <button 
              class="inventory-button"
              *ngIf="character.is_active"
              [routerLink]="['/inventory', character.id]">
              View Inventory
            </button>
            <div class="game-modes" *ngIf="character.is_active">
              <button 
                class="game-mode-button plateau"
                [routerLink]="['/plateau-game']">
                Plateau
              </button>
              <button 
                class="game-mode-button pvp"
                [routerLink]="['/pvp-game']">
                1v1
              </button>
              <button 
                class="game-mode-button quest"
                [routerLink]="['/quests']">
                Quest
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="no-characters" *ngIf="characters.length === 0 && !error">
        <p>You don't have any characters yet.</p>
      </div>

      <app-create-character-modal
        [isOpen]="isCreateModalOpen"
        (closeModal)="closeCreateCharacterModal()"
        (createCharacter)="createCharacter($event)">
      </app-create-character-modal>
    </div>
  `,
  styles: [`
    .characters-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .characters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    h1 {
      color: #333;
      margin: 0;
    }

    .create-character-button {
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

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .characters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .character-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-2px);
      }
    }

    .character-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h3 {
        margin: 0;
        color: #333;
        font-size: 1.2em;
      }
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      background-color: #e0e0e0;
      color: #666;

      &.active {
        background-color: #4caf50;
        color: white;
      }
    }

    .character-info {
      flex: 1;
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .label {
          color: #666;
        }
        
        .value {
          font-weight: 500;
          color: #333;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .stat {
      text-align: center;
      
      .stat-label {
        display: block;
        font-size: 0.8em;
        color: #666;
        margin-bottom: 4px;
      }
      
      .stat-value {
        display: block;
        font-size: 1.2em;
        font-weight: 500;
        color: #333;
      }
    }

    .character-actions {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #eee;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .select-button, .inventory-button, .game-mode-button {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 4px;
      font-size: 1em;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .select-button {
      background-color: #4a90e2;
      color: white;

      &:hover:not(:disabled) {
        background-color: #357abd;
      }

      &:disabled {
        background-color: #4caf50;
        cursor: default;
      }

      &.selected {
        background-color: #4caf50;
      }
    }

    .inventory-button {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;

      &:hover {
        background-color: #e0e0e0;
      }
    }

    .game-modes {
      display: flex;
      flex-direction: row;
      gap: 8px;
      margin-top: 8px;
    }

    .game-mode-button {
      flex: 1;
      background-color: #4caf50;
      color: white;
      border: none;
      font-weight: 500;
      padding: 8px;
      font-size: 0.9em;

      &:hover {
        background-color: #388e3c;
      }
    }

    .no-characters {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      p {
        color: #666;
        font-size: 1.1em;
      }
    }
  `]
})
export class CharactersComponent implements OnInit {
  characters: Character[] = [];
  error: string | null = null;
  isCreateModalOpen = false;

  constructor(private characterService: CharacterService) { }

  ngOnInit() {
    console.log('CharactersComponent initialized');
    this.loadCharacters();
  }

  private loadCharacters() {
    console.log('Loading characters...');
    this.characterService.getUserCharacters().subscribe({
      next: (characters) => {
        console.log('Characters received in component:', characters);
        this.characters = characters;
        this.error = null;
      },
      error: (error) => {
        console.error('Error in component:', error);
        this.error = 'Failed to load characters. Please try again later.';
        this.characters = [];
      }
    });
  }

  selectCharacter(character: Character) {
    if (character.is_active) return;
    
    this.characterService.selectCharacter(character.id).subscribe({
      next: () => {
        // Update the local state to reflect the selection
        this.characters = this.characters.map(c => ({
          ...c,
          is_active: c.id === character.id
        }));
      },
      error: (error) => {
        console.error('Error selecting character:', error);
        this.error = 'Failed to select character. Please try again.';
      }
    });
  }

  openCreateCharacterModal() {
    this.isCreateModalOpen = true;
  }

  closeCreateCharacterModal() {
    this.isCreateModalOpen = false;
  }

  createCharacter(request: CreateCharacterRequest) {
    this.characterService.createCharacter(request).subscribe({
      next: (character) => {
        this.characters = [...this.characters, character];
        this.closeCreateCharacterModal();
      },
      error: (error) => {
        console.error('Error creating character:', error);
        this.error = 'Failed to create character. Please try again.';
      }
    });
  }
} 