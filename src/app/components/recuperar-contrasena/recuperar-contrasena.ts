import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-recuperar-contrasena',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html'
})
export class RecuperarContrasena {

  constructor(private authService: Auth, private cdr: ChangeDetectorRef) {}

  email: string = '';
  valEmail: boolean = false;
  enviado: boolean = false;
  errorMsg: string = '';
  cargando: boolean = false;

  async enviaDatos(): Promise<void> {
    this.valEmail = !this.email || this.email.trim() === '';
    if (this.valEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.valEmail = true;
      return;
    }

    this.cargando = true;
    this.errorMsg = '';
    const response = await this.authService.recuperarContrasena(this.email.trim());
    this.cargando = false;

    if (response.coderr === '0000') {
      this.enviado = true;
    } else {
      this.errorMsg = response.message;
    }
    this.cdr.detectChanges();
  }
}
