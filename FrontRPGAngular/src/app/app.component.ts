import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  template: `
    <app-header *ngIf="showHeader"></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      padding-top: 20px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'FrontRPGAngular';
  showHeader = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('App component initialized');
    
    // Check if user is logged in
    this.showHeader = this.authService.isLoggedIn();
    console.log('Initial login state:', this.showHeader);
    
    // Subscribe to login state changes
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoggedIn => {
        console.log('Login state changed:', isLoggedIn);
        this.showHeader = isLoggedIn;
      });
    
    // Check current route and redirect to login if needed
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      const isLoginPage = event.url === '/login';
      const isLoggedIn = this.authService.isLoggedIn();
      
      console.log('Navigation event:', event.url, 'isLoginPage:', isLoginPage, 'isLoggedIn:', isLoggedIn);
      
      if (!isLoggedIn && !isLoginPage) {
        // Redirect to login if not logged in and not already on login page
        console.log('Redirecting to login page');
        this.router.navigate(['/login']);
      }
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
