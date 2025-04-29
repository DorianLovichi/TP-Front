import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BattleService } from '../../services/battle.service';

@Component({
  selector: 'app-battle-selection',
  templateUrl: './battle-selection.component.html',
  styleUrls: ['./battle-selection.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BattleSelectionComponent implements OnInit {
  characters: any[] = [];
  selectedPlayer1: any = null;
  selectedPlayer2: any = null;
  loading = false;
  error = '';

  constructor(
    private battleService: BattleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.loading = true;
    this.battleService.getAllBattleCharacters().subscribe({
      next: (characters) => {
        this.characters = characters;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load characters';
        this.loading = false;
        console.error('Error loading characters:', error);
      }
    });
  }

  startBattle(): void {
    if (!this.selectedPlayer1 || !this.selectedPlayer2) {
      this.error = 'Please select both characters';
      return;
    }

    this.loading = true;
    this.battleService.startBattle(this.selectedPlayer1.id, this.selectedPlayer2.id).subscribe({
      next: (result) => {
        this.router.navigate(['/battle-result'], { state: { battleResult: result } });
      },
      error: (error) => {
        this.error = 'Failed to start battle';
        this.loading = false;
        console.error('Error starting battle:', error);
      }
    });
  }
} 