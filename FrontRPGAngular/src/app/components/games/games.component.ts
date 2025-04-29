import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="games-container">
      <h1>Games</h1>
      <p>Games page content will go here</p>
    </div>
  `,
  styles: [`
    .games-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
  `]
})
export class GamesComponent {
  constructor() { }
} 