import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { GameNavComponent } from './components/game-nav/game-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, GameNavComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'FrontRPGAngular';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to router events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const isLoginPage = event.url === '/login';
      const isRegisterPage = event.url === '/register';
      const isLoggedIn = this.authService.isLoggedIn();

      console.log('Navigation event:', event.url, 'isLoginPage:', isLoginPage, 'isLoggedIn:', isLoggedIn);

      // If not on login/register page and not logged in, redirect to login
      if (!isLoginPage && !isRegisterPage && !isLoggedIn) {
        console.log('Redirecting to login page');
        this.router.navigate(['/login']);
      }
    });
  }
}
