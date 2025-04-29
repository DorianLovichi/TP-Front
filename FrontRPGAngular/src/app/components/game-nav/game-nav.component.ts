import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-nav',
  templateUrl: './game-nav.component.html',
  styleUrls: ['./game-nav.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class GameNavComponent {
  constructor(private router: Router) {}

  navigateToQuests(): void {
    this.router.navigate(['/quests']);
  }
} 