import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpaceService } from '../../services/space/space.service';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Toast } from '../../shared/toast/toast';

@Component({
  selector: 'app-create-space',
  imports: [CommonModule, FormsModule, Toast],
  templateUrl: './create-space.html'
})
export class CreateSpace {

  // Crear espacio
  nombre: string = '';
  guardando: boolean = false;
  valNombre: boolean = false;

  // Clave de invitación
  clave: string = '';
  aceptando: boolean = false;
  valClave: boolean = false;

  constructor(
    private spaceService: SpaceService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ── CREAR ──────────────────────────────────────────────
  crear(): void {
    this.valNombre = !this.nombre || this.nombre.trim() === '';
    if (this.valNombre) return;
    this.guardando = true;
    this.cdr.detectChanges();

    this.spaceService.createSpace(this.nombre.trim(), 'personal').subscribe({
      next: response => {
        if (response.coderr === '0000') {
          this.navegarAlPrimerEspacio();
        } else {
          this.guardando = false;
          this.toastService.show('Error', response.message, TypeToast.danger);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.guardando = false;
        this.toastService.show('Error', 'No se pudo crear el espacio', TypeToast.danger);
        this.cdr.detectChanges();
      }
    });
  }

  // ── CLAVE ──────────────────────────────────────────────
  aceptarInvitacion(): void {
    this.valClave = this.clave.trim().length !== 5;
    if (this.valClave) return;
    this.aceptando = true;
    this.cdr.detectChanges();

    this.spaceService.aceptarInvitacion(this.clave.trim()).subscribe({
      next: response => {
        if (response.coderr === '0000') {
          this.navegarAlPrimerEspacio();
        } else {
          this.aceptando = false;
          this.toastService.show('Error', response.message, TypeToast.danger);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.aceptando = false;
        this.toastService.show('Error', 'No se pudo aceptar la invitación', TypeToast.danger);
        this.cdr.detectChanges();
      }
    });
  }

  // ── COMÚN ──────────────────────────────────────────────
  private navegarAlPrimerEspacio(): void {
    this.spaceService.getSpaces().subscribe(spacesResponse => {
      this.guardando = false;
      this.aceptando = false;
      if (spacesResponse.coderr === '0000' && spacesResponse.data.length > 0) {
        this.spaceService.setActiveSpace(spacesResponse.data[0]);
        this.router.navigate(['/dashboard/home']);
      } else {
        this.toastService.show('Error', 'No se pudieron cargar los espacios', TypeToast.danger);
      }
      this.cdr.detectChanges();
    });
  }
}
