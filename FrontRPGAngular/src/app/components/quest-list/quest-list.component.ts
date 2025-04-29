import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuestService, Quest } from '../../services/quest.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quest-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quest-list">
      <h2>Available Quests</h2>
      <div *ngIf="loading" class="loading">Loading quests...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div class="quest-grid">
        <div *ngFor="let quest of quests" 
             class="quest-card" 
             [class.accepted]="quest.accepted"
             [class.completed]="quest.completed"
             (click)="viewQuest(quest.id)">
          <h3>{{ quest.title }}</h3>
          <p class="description">{{ quest.description }}</p>
          <div class="quest-details">
            <span class="level">Level {{ quest.level }}</span>
            <span class="rewards">
              <i class="fas fa-star"></i> {{ quest.experience }} XP
              <i class="fas fa-coins"></i> {{ quest.gold }} Gold
            </span>
          </div>
          <div class="quest-status">
            <span *ngIf="quest.completed" class="status completed">Completed</span>
            <span *ngIf="quest.accepted && !quest.completed" class="status in-progress">In Progress</span>
            <span *ngIf="!quest.accepted && !quest.completed" class="status available">Join</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quest-list {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      color: #ffd700;
      margin-bottom: 20px;
      text-align: center;
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

    .quest-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .quest-card {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #ffd700;
      border-radius: 8px;
      padding: 15px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .quest-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
    }

    .quest-card h3 {
      color: #ffd700;
      margin: 0 0 10px 0;
    }

    .description {
      color: #ccc;
      margin: 0 0 15px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .quest-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      color: #aaa;
    }

    .rewards i {
      margin: 0 5px;
      color: #ffd700;
    }

    .quest-status {
      text-align: right;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .status.available {
      background: #4CAF50;
      color: white;
    }

    .status.in-progress {
      background: #2196F3;
      color: white;
    }

    .status.completed {
      background: #9C27B0;
      color: white;
    }

    .quest-card.accepted {
      border-color: #2196F3;
    }

    .quest-card.completed {
      border-color: #9C27B0;
    }
  `]
})
export class QuestListComponent implements OnInit {
  quests: Quest[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private questService: QuestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuests();
  }

  loadQuests(): void {
    this.loading = true;
    this.error = null;
    this.questService.getQuests().subscribe({
      next: (response: any) => {
        // Ensure we're working with an array
        this.quests = Array.isArray(response) ? response : response.quests || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load quests. Please try again later.';
        this.loading = false;
        console.error('Error loading quests:', err);
      }
    });
  }

  viewQuest(id: number): void {
    this.router.navigate(['/quests', id, 'battle']);
  }
} 