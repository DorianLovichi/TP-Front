import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateCharacterRequest, CharacterService, CharacterOption } from '../../../services/character.service';

@Component({
  selector: 'app-create-character-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Create New Character</h2>
          <button class="close-button" (click)="close()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="characterName">Character Name:</label>
            <input type="text" id="characterName" [(ngModel)]="character.name" placeholder="Enter character name">
          </div>
          
          <div class="form-group">
            <label for="characterRace">Race:</label>
            <select id="characterRace" [(ngModel)]="character.race" class="select-input">
              <option value="" disabled>Select a race</option>
              <option *ngFor="let race of races" [value]="race.value">
                {{ race.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="characterClass">Class:</label>
            <select id="characterClass" [(ngModel)]="character.class" class="select-input">
              <option value="" disabled>Select a class</option>
              <option *ngFor="let class of classes" [value]="class.value">
                {{ class.label }}
              </option>
            </select>
          </div>

          <div class="stats-preview" *ngIf="selectedClass">
            <h3>Starting Stats:</h3>
            <div class="stats-grid">
              <div class="stat">
                <span class="stat-label">Health</span>
                <span class="stat-value">{{ selectedClass.stats?.health }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Attack</span>
                <span class="stat-value">{{ selectedClass.stats?.attack }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Defense</span>
                <span class="stat-value">{{ selectedClass.stats?.defense }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" (click)="close()">Cancel</button>
          <button class="create-button" (click)="submit()" [disabled]="!isFormValid()">
            Create Character
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

    .stats-preview {
      margin-top: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;

      h3 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 1.1em;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
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

    .create-button {
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
export class CreateCharacterModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() createCharacter = new EventEmitter<CreateCharacterRequest>();

  character: CreateCharacterRequest = {
    name: '',
    race: '',
    class: ''
  };

  races: CharacterOption[] = [];
  classes: CharacterOption[] = [];
  loading = false;
  error: string | null = null;

  constructor(private characterService: CharacterService) { }

  ngOnInit() {
    this.loadCharacterOptions();
  }

  private loadCharacterOptions() {
    this.loading = true;
    this.characterService.getCharacterOptions().subscribe({
      next: (options) => {
        this.races = options.races;
        this.classes = options.classes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading character options:', error);
        this.error = 'Failed to load character options. Please try again.';
        this.loading = false;
      }
    });
  }

  get selectedClass(): CharacterOption | undefined {
    return this.classes.find(c => c.value === this.character.class);
  }

  close() {
    this.closeModal.emit();
  }

  submit() {
    if (this.isFormValid()) {
      this.createCharacter.emit(this.character);
      this.resetForm();
    }
  }

  private resetForm() {
    this.character = {
      name: '',
      race: '',
      class: ''
    };
  }

  isFormValid(): boolean {
    return !!this.character.name && !!this.character.race && !!this.character.class;
  }
} 