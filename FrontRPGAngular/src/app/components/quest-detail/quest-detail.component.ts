import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestService, Quest } from '../../services/quest.service';

@Component({
  selector: 'app-quest-detail',
  template: `
    <div class="quest-detail" *ngIf="quest">
      <div class="quest-header">
        <h2>{{ quest.title }}</h2>
        <div class="quest-status">
          <span *ngIf="quest.completed" class="status completed">Completed</span>
          <span *ngIf="quest.accepted && !quest.completed" class="status in-progress">In Progress</span>
          <span *ngIf="!quest.accepted && !quest.completed" class="status available">Available</span>
        </div>
      </div>

      <div class="quest-content">
        <div class="quest-info">
          <div class="requirements">
            <h3>Requirements</h3>
            <p>Level {{ quest.level }}</p>
          </div>

          <div class="rewards">
            <h3>Rewards</h3>
            <div class="reward-item">
              <i class="fas fa-star"></i>
              <span>{{ quest.experience }} Experience</span>
            </div>
            <div class="reward-item">
              <i class="fas fa-coins"></i>
              <span>{{ quest.gold }} Gold</span>
            </div>
          </div>
        </div>

        <div class="description">
          <h3>Description</h3>
          <p>{{ quest.description }}</p>
        </div>

        <div class="actions">
          <button *ngIf="!quest.accepted && !quest.completed"
                  (click)="acceptQuest()"
                  [disabled]="loading"
                  class="btn accept">
            Accept Quest
          </button>
          <button *ngIf="quest.accepted && !quest.completed"
                  (click)="completeQuest()"
                  [disabled]="loading"
                  class="btn complete">
            Complete Quest
          </button>
          <button (click)="goBack()" class="btn back">
            Back to Quests
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .quest-detail {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .quest-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    h2 {
      color: #ffd700;
      margin: 0;
    }

    .quest-content {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #ffd700;
      border-radius: 8px;
      padding: 20px;
    }

    .quest-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    h3 {
      color: #ffd700;
      margin: 0 0 10px 0;
    }

    .requirements, .rewards {
      background: rgba(255, 215, 0, 0.1);
      padding: 15px;
      border-radius: 4px;
    }

    .reward-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 5px 0;
      color: #ccc;
    }

    .reward-item i {
      color: #ffd700;
    }

    .description {
      margin-bottom: 30px;
    }

    .description p {
      color: #ccc;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn.accept {
      background: #4CAF50;
      color: white;
    }

    .btn.complete {
      background: #9C27B0;
      color: white;
    }

    .btn.back {
      background: #666;
      color: white;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .status {
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.9em;
      color: white;
    }

    .status.available {
      background: #4CAF50;
    }

    .status.in-progress {
      background: #2196F3;
    }

    .status.completed {
      background: #9C27B0;
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
export class QuestDetailComponent implements OnInit {
  quest: Quest | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questService: QuestService
  ) {}

  ngOnInit(): void {
    const questId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadQuest(questId);
  }

  loadQuest(id: number): void {
    this.loading = true;
    this.error = null;
    this.questService.getQuest(id).subscribe({
      next: (quest) => {
        this.quest = quest;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load quest. Please try again later.';
        this.loading = false;
        console.error('Error loading quest:', err);
      }
    });
  }

  acceptQuest(): void {
    if (!this.quest) return;
    
    this.loading = true;
    this.error = null;
    this.questService.acceptQuest(this.quest.id).subscribe({
      next: (updatedQuest) => {
        this.quest = updatedQuest;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to accept quest. Please try again later.';
        this.loading = false;
        console.error('Error accepting quest:', err);
      }
    });
  }

  completeQuest(): void {
    if (!this.quest) return;
    
    this.loading = true;
    this.error = null;
    this.questService.completeQuest(this.quest.id).subscribe({
      next: (updatedQuest) => {
        this.quest = updatedQuest;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to complete quest. Please try again later.';
        this.loading = false;
        console.error('Error completing quest:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/quests']);
  }
} 