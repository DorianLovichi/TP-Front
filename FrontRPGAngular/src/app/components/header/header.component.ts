import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-left">
        <h1 class="app-title">RPG Game</h1>
      </div>
      <div class="header-right">
        <nav class="nav-links">
          <a routerLink="/characters" routerLinkActive="active">Characters</a>
          <a routerLink="/inventory" routerLinkActive="active">Inventory</a>
        </nav>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      height: 60px;
      background-color: #3f51b5;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header-left {
      display: flex;
      align-items: center;
    }
    
    .app-title {
      font-size: 1.5rem;
      margin: 0;
      font-weight: 500;
    }
    
    .header-right {
      display: flex;
      align-items: center;
    }
    
    .nav-links {
      display: flex;
      margin-right: 20px;
    }
    
    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 0 15px;
      font-size: 1rem;
      transition: color 0.3s;
    }
    
    .nav-links a:hover {
      color: #ffd740;
    }
    
    .nav-links a.active {
      color: #ffd740;
      font-weight: 500;
    }
    
    .logout-btn {
      background-color: transparent;
      border: 1px solid white;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s;
    }
    
    .logout-btn:hover {
      background-color: white;
      color: #3f51b5;
    }
  `]
})
export class HeaderComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }
  
  logout() {
    // Call the auth service to handle logout
    this.authService.logout();
    
    // Navigate to the login page
    this.router.navigate(['/login']);
  }
} 