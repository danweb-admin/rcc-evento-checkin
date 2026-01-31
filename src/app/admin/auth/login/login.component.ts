import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-admin-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  email: string = "";
  senha: string = "";
  loading = false;
  erro = '';
  form!: FormGroup;

  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  login() {
    this.loading = true;

    this.auth.login(this.form.value.email, this.form.value.senha).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/eventos']);
      },
      error: () => {
        this.loading = false;
        this.erro = 'Credenciais inválidas';
      }
    });
  }
}
