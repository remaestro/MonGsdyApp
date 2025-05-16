import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '/';
  error: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // Initialiser le formulaire
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Récupérer l'URL de retour depuis les paramètres de requête ou utiliser l'accueil par défaut
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Getter pratique pour accéder facilement aux champs de formulaire
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Si le formulaire est invalide, ne rien faire
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.f['username'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: () => {
          // Rediriger vers la page de retour
          this.router.navigate([this.returnUrl]);
        },
        error: error => {
          this.error = 'Nom d\'utilisateur ou mot de passe incorrect';
          this.loading = false;
        }
      });
  }
}
