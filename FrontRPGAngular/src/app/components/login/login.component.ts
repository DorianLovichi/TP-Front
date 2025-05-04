import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // The loginGuard will handle the redirect if user is already logged in
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.message === 'Login successful') {
            console.log('Login successful', response);
            // Wait for the auth state to be updated
            this.authService.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
              if (isLoggedIn) {
                this.router.navigate(['/characters']);
              }
            });
          } else {
            this.errorMessage = response.message || 'Login failed. Please check your credentials.';
          }
        },
        error: (error) => {
          this.errorMessage = 'Login failed. Please check your credentials.';
          console.error('Login error', error);
        }
      });
    }
  }
} 