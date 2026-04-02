import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpaceService } from '../../../services/space/space.service';
import { ToastService, TypeToast } from '../../../shared/toast/service/toast-service';
import { Space } from '../../../models/space';
import { ConfirmModal } from '../../../shared/confirm-modal/confirm-modal';
import { Auth } from '../../../services/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-espacios',
  imports: [CommonModule, FormsModule, ConfirmModal],
  templateUrl: './espacios.html'
})
export class Espacios {

  spaces: Space[] = [];
  activeSpaceId: string | null = null;
  cargando = true;

  // Crear espacio
  creando = false;
  nuevoNombre = '';
  valNuevoNombre = false;
  guardandoNuevo = false;

  // Renombrar
  editandoId: string | null = null;
  editNombre = '';
  guardandoEdit = false;

  // Invitaciones por espacio (siempre visibles)
  invitacionesPorEspacio: Record<string, any[]> = {};
  cargandoInvitacionesPorEspacio: Record<string, boolean> = {};

  // Formulario nueva invitación (toggle por tarjeta)
  invitandoId: string | null = null;
  invitEmail = '';
  invitRole = 'admin';
  valInvitEmail = false;
  enviandoInvitacion = false;

  // Clave de invitación
  ingresandoClave = false;
  claveInvitacion = '';
  valClave = false;
  aceptandoClave = false;

  // Miembros
  miembrosPorEspacio: Record<string, any[]> = {};
  cargandoMiembrosPorEspacio: Record<string, boolean> = {};
  mostrarMiembrosPorEspacio: Record<string, boolean> = {};
  miembroAEliminar: { spaceId: string; member: any } | null = null;
  eliminandoMiembro = false;

  // Eliminar espacio
  spaceAEliminar: Space | null = null;
  eliminando = false;

  private subs: Subscription[] = [];

  constructor(
    private spaceService: SpaceService,
    private toastService: ToastService,
    private authService: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.activeSpaceId = this.spaceService.activeSpaceId();
    this.subs.push(
      this.spaceService.activeSpace$.subscribe(s => {
        this.activeSpaceId = s?.spaceId ?? null;
        this.cdr.detectChanges();
      })
    );
    this.cargar();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  cargar(): void {
    this.cargando = true;
    this.spaceService.getSpaces().subscribe(response => {
      this.cargando = false;
      if (response.coderr === '0000') {
        this.spaces = response.data;
        this.spaces
          .filter(s => this.isOwner(s))
          .forEach(s => this.cargarInvitaciones(s.spaceId));
      }
      this.cdr.detectChanges();
    });
  }

  cargarInvitaciones(spaceId: string): void {
    this.cargandoInvitacionesPorEspacio[spaceId] = true;
    this.cdr.detectChanges();
    this.spaceService.getInvitations(spaceId).subscribe({
      next: response => {
        this.cargandoInvitacionesPorEspacio[spaceId] = false;
        if (response.coderr === '0000') {
          this.invitacionesPorEspacio[spaceId] = response.data ?? [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoInvitacionesPorEspacio[spaceId] = false;
        this.cdr.detectChanges();
      }
    });
  }

  isOwner(space: Space): boolean {
    return space.role?.toLowerCase() === 'owner';
  }

  isActive(space: Space): boolean {
    return space.spaceId === this.activeSpaceId;
  }

  getInvitaciones(spaceId: string): any[] {
    return this.invitacionesPorEspacio[spaceId] ?? [];
  }

  getMiembros(spaceId: string): any[] {
    const currentUid = this.authService.auth.currentUser?.uid;
    return (this.miembrosPorEspacio[spaceId] ?? [])
      .filter(m => m.userId !== currentUid);
  }

  // ── CREAR ──────────────────────────────────────────────
  abrirCrear(): void {
    this.creando = true;
    this.nuevoNombre = '';
    this.valNuevoNombre = false;
    this.cancelarEdit();
    this.cancelarInvitar();
    this.cancelarClave();
  }

  cancelarCrear(): void {
    this.creando = false;
    this.nuevoNombre = '';
    this.valNuevoNombre = false;
  }

  guardarNuevo(): void {
    this.valNuevoNombre = !this.nuevoNombre.trim();
    if (this.valNuevoNombre) return;
    this.guardandoNuevo = true;
    this.cdr.detectChanges();

    this.spaceService.createSpace(this.nuevoNombre.trim(), 'personal').subscribe({
      next: response => {
        this.guardandoNuevo = false;
        if (response.coderr === '0000') {
          this.cancelarCrear();
          this.cargar();
          this.toastService.show('Espacio creado', 'El espacio se creó correctamente', TypeToast.success);
        } else {
          this.toastService.show('Error', response.message, TypeToast.danger);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardandoNuevo = false;
        this.toastService.show('Error', 'No se pudo crear el espacio', TypeToast.danger);
        this.cdr.detectChanges();
      }
    });
  }

  // ── RENOMBRAR ──────────────────────────────────────────
  abrirEdit(space: Space): void {
    this.editandoId = space.spaceId;
    this.editNombre = space.name;
    this.cancelarCrear();
    this.cancelarInvitar();
    this.cancelarClave();
  }

  cancelarEdit(): void {
    this.editandoId = null;
    this.editNombre = '';
  }

  guardarEdit(space: Space): void {
    if (!this.editNombre.trim()) return;
    this.guardandoEdit = true;
    this.cdr.detectChanges();

    this.spaceService.updateSpace(space.spaceId, this.editNombre.trim()).subscribe({
      next: response => {
        this.guardandoEdit = false;
        if (response.coderr === '0000') {
          this.cancelarEdit();
          this.cargar();
          this.toastService.show('Nombre actualizado', '', TypeToast.success);
        } else if (response.coderr === '1006') {
          this.toastService.show('Sin permisos', 'Solo el propietario puede renombrar el espacio', TypeToast.danger);
        } else {
          this.toastService.show('Error', response.message, TypeToast.danger);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardandoEdit = false;
        this.toastService.show('Error', 'No se pudo actualizar el nombre', TypeToast.danger);
        this.cdr.detectChanges();
      }
    });
  }

  // ── INVITAR ────────────────────────────────────────────
  abrirInvitar(space: Space): void {
    this.invitandoId = space.spaceId;
    this.invitEmail = '';
    this.invitRole = 'admin';
    this.valInvitEmail = false;
    this.cancelarCrear();
    this.cancelarEdit();
    this.cancelarClave();
  }

  cancelarInvitar(): void {
    this.invitandoId = null;
    this.invitEmail = '';
    this.invitRole = 'admin';
    this.valInvitEmail = false;
  }

  enviarInvitacion(space: Space): void {
    this.valInvitEmail = !this.invitEmail.trim() || !this.invitEmail.includes('@');
    if (this.valInvitEmail) return;
    const email = this.invitEmail.trim();
    this.enviandoInvitacion = true;
    this.cdr.detectChanges();

    this.spaceService.invitarUsuario(space.spaceId, email, this.invitRole).subscribe({
      next: response => {
        this.enviandoInvitacion = false;
        if (response.coderr === '0000') {
          this.invitandoId = null;
          this.invitEmail = '';
          this.invitRole = 'admin';
          this.valInvitEmail = false;
          this.cargarInvitaciones(space.spaceId);
          this.toastService.show('Invitación creada', 'Comparte el código con el usuario', TypeToast.success);
        } else {
          this.toastService.show('Error', response.message, TypeToast.danger);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.enviandoInvitacion = false;
        this.toastService.show('Error', 'No se pudo crear la invitación', TypeToast.danger);
        this.cdr.detectChanges();
      }
    });
  }

  // ── CLAVE DE INVITACIÓN ────────────────────────────────
  abrirIngresarClave(): void {
    this.ingresandoClave = true;
    this.claveInvitacion = '';
    this.valClave = false;
    this.cancelarCrear();
    this.cancelarEdit();
    this.cancelarInvitar();
  }

  cancelarClave(): void {
    this.ingresandoClave = false;
    this.claveInvitacion = '';
    this.valClave = false;
  }

  aceptarClave(): void {
    this.valClave = this.claveInvitacion.trim().length !== 5;
    if (this.valClave) return;
    this.aceptandoClave = true;
    this.cdr.detectChanges();

    this.spaceService.aceptarInvitacion(this.claveInvitacion.trim()).subscribe({
      next: response => {
        this.aceptandoClave = false;
        if (response.coderr === '0000') {
          this.cancelarClave();
          this.cargar();
          this.toastService.show('Invitación aceptada', 'Ahora eres miembro del espacio', TypeToast.success);
        } else {
          this.toastService.show('Error', response.message, TypeToast.danger);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.aceptandoClave = false;
        this.toastService.show('Error', 'No se pudo aceptar la invitación', TypeToast.danger);
        this.cdr.detectChanges();
      }
    });
  }

  // ── MIEMBROS ───────────────────────────────────────────
  toggleMiembros(space: Space): void {
    const id = space.spaceId;
    this.mostrarMiembrosPorEspacio[id] = !this.mostrarMiembrosPorEspacio[id];
    if (this.mostrarMiembrosPorEspacio[id] && !this.miembrosPorEspacio[id]) {
      this.cargarMiembros(id);
    }
    this.cdr.detectChanges();
  }

  cargarMiembros(spaceId: string): void {
    this.cargandoMiembrosPorEspacio[spaceId] = true;
    this.cdr.detectChanges();
    this.spaceService.getMembers(spaceId).subscribe({
      next: response => {
        this.cargandoMiembrosPorEspacio[spaceId] = false;
        if (response.coderr === '0000') {
          this.miembrosPorEspacio[spaceId] = response.data ?? [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoMiembrosPorEspacio[spaceId] = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarEliminarMiembro(spaceId: string, member: any): void {
    this.miembroAEliminar = { spaceId, member };
  }

  cancelarEliminarMiembro(): void {
    this.miembroAEliminar = null;
  }

  eliminarMiembro(): void {
    if (!this.miembroAEliminar) return;
    const { spaceId, member } = this.miembroAEliminar;
    this.eliminandoMiembro = true;
    this.cdr.detectChanges();

    this.spaceService.deleteMember(spaceId, member.userId).subscribe({
      next: response => {
        this.eliminandoMiembro = false;
        this.miembroAEliminar = null;
        if (response.coderr === '0000') {
          this.cargarMiembros(spaceId);
          this.toastService.show('Miembro eliminado', '', TypeToast.success);
        } else {
          this.toastService.show('Error', response.message, TypeToast.danger);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.eliminandoMiembro = false;
        this.miembroAEliminar = null;
        this.toastService.show('Error', 'No se pudo eliminar el miembro', TypeToast.danger);
        this.cdr.detectChanges();
      }
    });
  }

  // ── ELIMINAR ESPACIO ───────────────────────────────────
  confirmarEliminar(space: Space): void {
    this.spaceAEliminar = space;
  }

  cancelarEliminar(): void {
    this.spaceAEliminar = null;
  }

  eliminar(): void {
    if (!this.spaceAEliminar) return;
    const deleted = this.spaceAEliminar;
    this.eliminando = true;
    this.cdr.detectChanges();

    this.spaceService.deleteSpace(deleted.spaceId).subscribe({
      next: response => {
        this.eliminando = false;
        this.spaceAEliminar = null;
        if (response.coderr === '0000') {
          if (deleted.spaceId === this.activeSpaceId) {
            this.spaceService.clearActiveSpace();
          }
          this.cargar();
          this.toastService.show('Espacio eliminado', '', TypeToast.success);
        } else if (response.coderr === '1006') {
          this.toastService.show('Sin permisos', 'Solo el propietario puede eliminar el espacio', TypeToast.danger);
        } else if (response.coderr === '1007') {
          this.toastService.show('No permitido', 'Los espacios personales no pueden eliminarse', TypeToast.danger);
        } else {
          this.toastService.show('Error', response.message, TypeToast.danger);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.eliminando = false;
        this.spaceAEliminar = null;
        this.toastService.show('Error', 'No se pudo eliminar el espacio', TypeToast.danger);
        this.cdr.detectChanges();
      }
    });
  }
}
