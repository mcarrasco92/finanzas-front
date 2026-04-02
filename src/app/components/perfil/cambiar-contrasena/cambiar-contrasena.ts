import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../services/auth';
import { ToastService, TypeToast } from '../../../shared/toast/service/toast-service';

@Component({
  selector: 'app-cambiar-contrasena',
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-contrasena.html'
})
export class CambiarContrasena {

  contrasenaActual = '';
  contrasenaNueva = '';
  confirmarContrasena = '';

  valActual = false;
  valNueva = false;
  valConfirmar = false;
  valCoinciden = false;

  guardando = false;

  constructor(
    private authService: Auth,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  guardar(): void {
    this.valActual = !this.contrasenaActual.trim();
    this.valNueva = this.contrasenaNueva.trim().length < 6;
    this.valConfirmar = !this.confirmarContrasena.trim();
    this.valCoinciden = this.contrasenaNueva !== this.confirmarContrasena;

    if (this.valActual || this.valNueva || this.valConfirmar || this.valCoinciden) return;

    this.guardando = true;
    this.cdr.detectChanges();

    this.authService.cambiarContrasena(this.contrasenaActual, this.contrasenaNueva).subscribe({
      next: response => {
        this.guardando = false;
        if (response.coderr === '0000') {
          this.contrasenaActual = '';
          this.contrasenaNueva = '';
          this.confirmarContrasena = '';
          this.toastService.show('Contraseña actualizada', 'Tu contraseña se cambió correctamente', TypeToast.success);
        } else {
          this.toastService.show('Error', response.message, TypeToast.danger);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.toastService.show('Error', 'No se pudo actualizar la contraseña', TypeToast.danger);
        this.cdr.detectChanges();
      }
    });
  }
}
