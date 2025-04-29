import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuestService, QuestBattleResult } from '../../services/quest.service';

@Component({
  selector: 'app-quest-battle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="battle-result" *ngIf="battleResult">
      <div class="battle-header">
        <h2>{{ battleResult.won ? 'Victory!' : 'Defeat' }}</h2>
        <button class="btn back" (click)="goBack()">Back to Quests</button>
      </div>

      <div class="battle-content">
        <div class="battle-log">
          <h3>Battle Log</h3>
          <div class="log-entries">
            <div *ngFor="let entry of battleResult.battle_log" class="log-entry">
              {{ entry }}
            </div>
          </div>
        </div>

        <div class="rewards" *ngIf="battleResult.won">
          <h3>Rewards</h3>
          <div class="reward-item">
            <i class="fas fa-star"></i>
            <span>{{ battleResult.rewards?.experience || 0 }} Experience</span>
          </div>
          <div class="items" *ngIf="battleResult.rewards?.items?.length">
            <h4>Items Found:</h4>
            <div *ngFor="let item of battleResult.rewards?.items || []" class="item">
              <i class="fas fa-box-open"></i>
              <span>{{ item.name }} ({{ item.type }}) x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading battle result...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .battle-result {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .battle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    h2 {
      color: #ffd700;
      margin: 0;
    }

    .battle-content {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #ffd700;
      border-radius: 8px;
      padding: 20px;
    }

    .battle-log {
      margin-bottom: 30px;
    }

    h3 {
      color: #ffd700;
      margin: 0 0 15px 0;
    }

    .log-entries {
      background: rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      padding: 15px;
    }

    .log-entry {
      color: #ccc;
      margin: 5px 0;
      font-family: monospace;
    }

    .rewards {
      background: rgba(255, 215, 0, 0.1);
      padding: 15px;
      border-radius: 4px;
    }

    .reward-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
      color: #ccc;
    }

    .reward-item i {
      color: #ffd700;
    }

    .items {
      margin-top: 15px;
    }

    h4 {
      color: #ffd700;
      margin: 0 0 10px 0;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 5px 0;
      color: #ccc;
    }

    .item i {
      color: #ffd700;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }

    .btn.back {
      background: #666;
      color: white;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .loading {
      text-align: center;
      color: #ffd700;
      padding: 20px;
    }

    .error {
      color: #ff4444;
      text-align: center;
      padding: 20px;
    }
  `]
})
export class QuestBattleComponent implements OnInit {
  battleResult: QuestBattleResult | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questService: QuestService
  ) {}

  ngOnInit(): void {
    const questId = Number(this.route.snapshot.paramMap.get('id'));
    this.startBattle(questId);
  }

  startBattle(questId: number): void {
    this.loading = true;
    this.error = null;
    this.questService.startQuest(questId).subscribe({
      next: (result) => {
        this.battleResult = result;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to start quest battle. Please try again later.';
        this.loading = false;
        console.error('Error starting quest battle:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/quests']);
  }
} 