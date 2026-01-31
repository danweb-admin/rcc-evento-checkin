import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  email: string = "";
  senha: string = "";
  loading = false;
  erro = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;

    this.auth.login(this.email, this.senha).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.loading = false;
        this.erro = 'Credenciais inválidas';
      }
    });
  }
}
