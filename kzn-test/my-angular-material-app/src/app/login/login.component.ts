import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  hidePassword = true;
  loginForm: FormGroup;
  protected readonly title = signal('my-angular-material-app');

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Форма валидна', this.loginForm.value);

      this.authService.login(this.loginForm.value.login, this.loginForm.value.password).subscribe((res: any) => {
        console.log('Ответ', res);
        if (res) {
          localStorage.setItem('auth_token', res.auth_token);
          this.router.navigate(['/clients']);
        }
      })
    } else {
      console.log('Форма не валидна');
      this.loginForm.markAllAsTouched();
    }
  }
}
