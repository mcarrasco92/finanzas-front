import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Toast } from '../../shared/toast/toast';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpaceService } from '../../services/space/space.service';
import { Space } from '../../models/space';


@Component({
  selector: 'app-login',
  imports: [MatCardModule, MatDividerModule, RouterLink, FormsModule, Toast, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  constructor(
    private authService: Auth,
    private toastService: ToastService,
    private router: Router,
    private spaceService: SpaceService
  ) { }

  password: string = ''; // Almacena la contraseña
  email: string = ''; // Almacena el email 
  valEmail: boolean = false;
  valPassword: boolean = false;

  validaFormulario(): boolean {

    if (!this.email || this.email.trim() === '') { this.valEmail = true } else { this.valEmail = false; }
    if (!this.password || this.password.trim() === '') { this.valPassword = true } else { this.valPassword = false; }

    if (this.valEmail || this.valPassword) {
      return false;
    }

    return true;

  }

  loginGoogle(): void {
    this.authService.loginGoogle().subscribe(
      response => {
        if (response.coderr === "0000") {
          this.cargarEspacios();
        } else {
          this.toastService.show("Error al iniciar sesión", response.message, TypeToast.danger);
        }
      },
      () => this.toastService.show("Error al iniciar sesión", "Error desconocido", TypeToast.danger)
    );
  }

  enviaDatos(): void {
    if (!this.validaFormulario()) { return; }

    this.authService.loginUsuario({ email: this.email, password: this.password }).subscribe(
      response => {
        if (response.coderr === "0000") {
          this.cargarEspacios();
        } else {
          this.toastService.show("Error al iniciar sesión", response.message, TypeToast.danger);
        }
      },
      () => this.toastService.show("Error al iniciar sesión", "Error desconocido", TypeToast.danger)
    );
  }

  private cargarEspacios(): void {
    this.spaceService.getSpaces().subscribe(response => {
      if (response.coderr === '0000') {
        const spaces: Space[] = response.data;
        if (spaces.length === 0) {
          this.router.navigate(['/create-space']);
        } else if (spaces.length === 1) {
          this.spaceService.setActiveSpace(spaces[0]);
          this.router.navigate(['/dashboard/home']);
        } else {
          this.router.navigate(['/select-space'], { state: { spaces } });
        }
      } else {
        this.toastService.show('Error', 'No se pudieron cargar los espacios', TypeToast.danger);
      }
    });
  }

  ngDestroy() {
    this.toastService.clear();
  }

}
