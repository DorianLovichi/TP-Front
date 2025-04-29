import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PlateauService, PlateauGameResult, PlateauTurn, PlateauEvent } from '../../services/plateau.service';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-plateau-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="plateau-game-container">
      <h1>Plateau Game Mode</h1>
      
      <div *ngIf="loading" class="loading">
        <p>Loading game data...</p>
      </div>
      
      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <button (click)="goBack()">Go Back</button>
      </div>
      
      <div *ngIf="gameResult && !loading && !error" class="game-content">
        <div class="character-info">
          <h2>{{ gameResult.character.name }}</h2>
          <div class="stats">
            <div class="stat">
              <span class="label">Level:</span>
              <span class="value">{{ gameResult.character.level }}</span>
            </div>
            <div class="stat">
              <span class="label">Health:</span>
              <span class="value">{{ gameResult.character.health }}</span>
            </div>
            <div class="stat">
              <span class="label">Attack:</span>
              <span class="value">{{ gameResult.character.attack }}</span>
            </div>
            <div class="stat">
              <span class="label">Defense:</span>
              <span class="value">{{ gameResult.character.defense }}</span>
            </div>
          </div>
        </div>
        
        <div class="game-status">
          <p>Final Position: {{ gameResult.final_position }}</p>
          <p>Game Status: {{ gameResult.completed ? 'Completed' : 'In Progress' }}</p>
          <p *ngIf="gameResult.game_over" class="game-over">Game Over</p>
        </div>
        
        <div class="turns-container">
          <h3>Game Turns</h3>
          <div class="turns">
            <div *ngFor="let turn of gameResult.turns; let i = index" class="turn">
              <div class="turn-header">
                <span class="turn-number">Turn {{ i + 1 }}</span>
                <span class="dice-roll">Dice: {{ turn.dice_roll }}</span>
                <span class="position">Position: {{ turn.position }}</span>
              </div>
              <div class="events">
                <div *ngFor="let event of turn.events; let j = index" class="event" [ngClass]="event.type">
                  <ng-container [ngSwitch]="event.type">
                    <div *ngSwitchCase="'item'" class="event-content">
                      <span class="event-icon">🎁</span>
                      <span class="event-text">Found item: {{ event.item }}</span>
                    </div>
                    <div *ngSwitchCase="'enemy'" class="event-content">
                      <span class="event-icon">⚔️</span>
                      <span class="event-text">Encountered enemy: {{ event.enemy }}</span>
                    </div>
                    <div *ngSwitchCase="'empty'" class="event-content">
                      <span class="event-icon">🌲</span>
                      <span class="event-text">Empty space</span>
                    </div>
                    <div *ngSwitchCase="'victory'" class="event-content">
                      <span class="event-icon">🏆</span>
                      <span class="event-text">{{ event.message }}</span>
                    </div>
                  </ng-container>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="actions">
          <button (click)="goBack()">Back to Characters</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plateau-game-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }

    .loading, .error {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .error {
      color: #d32f2f;
    }

    .game-content {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .character-info {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .character-info h2 {
      margin-top: 0;
      color: #333;
    }

    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-top: 10px;
    }

    .stat {
      background: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    }

    .stat .label {
      font-size: 0.8em;
      color: #666;
    }

    .stat .value {
      font-size: 1.2em;
      font-weight: 500;
      color: #333;
    }

    .game-status {
      margin-bottom: 20px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .game-over {
      color: #d32f2f;
      font-weight: 500;
    }

    .turns-container {
      margin-bottom: 20px;
    }

    .turns-container h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }

    .turns {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .turn {
      border: 1px solid #eee;
      border-radius: 4px;
      overflow: hidden;
    }

    .turn-header {
      display: flex;
      justify-content: space-between;
      background: #f5f5f5;
      padding: 10px 15px;
      font-weight: 500;
    }

    .events {
      padding: 10px 15px;
    }

    .event {
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 4px;
    }

    .event:last-child {
      margin-bottom: 0;
    }

    .event.item {
      background: #e8f5e9;
    }

    .event.enemy {
      background: #ffebee;
    }

    .event.empty {
      background: #f5f5f5;
    }

    .event.victory {
      background: #fff8e1;
    }

    .event-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .event-icon {
      font-size: 1.2em;
    }

    .actions {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    button {
      background: #4caf50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.2s;
    }

    button:hover {
      background: #388e3c;
    }
  `]
})
export class PlateauGameComponent implements OnInit {
  gameResult: PlateauGameResult | null = null;
  loading = true;
  error: string | null = null;
  activeCharacterId: number | null = null;

  constructor(
    private plateauService: PlateauService,
    private characterService: CharacterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadActiveCharacter();
  }

  private loadActiveCharacter(): void {
    this.characterService.getUserCharacters().subscribe({
      next: (characters) => {
        const activeCharacter = characters.find(char => char.is_active);
        if (activeCharacter) {
          this.activeCharacterId = activeCharacter.id;
          this.loadPlateauGame();
        } else {
          this.error = 'No active character found. Please select a character first.';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading characters:', error);
        this.error = 'Failed to load character data. Please try again.';
        this.loading = false;
      }
    });
  }

  private loadPlateauGame(): void {
    if (!this.activeCharacterId) {
      this.error = 'No active character found. Please select a character first.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;
    
    this.plateauService.playGame(this.activeCharacterId).subscribe({
      next: (result) => {
        this.gameResult = result;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plateau game:', error);
        this.error = 'Failed to load plateau game data. Please try again.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/characters']);
  }
} 