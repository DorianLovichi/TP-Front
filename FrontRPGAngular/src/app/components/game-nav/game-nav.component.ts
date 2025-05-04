import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-game-nav',
  templateUrl: './game-nav.component.html',
  styleUrls: ['./game-nav.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class GameNavComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateToCharacters(): void {
    this.router.navigate(['/characters']);
  }

  navigateToQuests(): void {
    this.router.navigate(['/quests']);
  }

  navigateToInventory(): void {
    this.router.navigate(['/inventory']);
  }

  navigateToPvP(): void {
    this.router.navigate(['/pvp-game']);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      // Wait for the auth state to be updated
      this.authService.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
        }
      });
    });
  }
} 