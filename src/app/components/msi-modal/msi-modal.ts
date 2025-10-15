import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../shared/toast/toast';
import { MsiService } from '../../services/msi/msi';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { Subscription } from 'rxjs';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';
import { Categoria } from '../../models/categoria';
import { Tarjeta } from '../../models/tarjeta';
import { CategoriasService } from '../../services/categorias/categorias';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { MsiModel } from '../../models/msi';
import { GeneralService } from '../../services/general-service';

@Component({
  selector: 'app-msi-modal',
  imports: [CommonModule, FormsModule, Toast, ConfirmModal],
  templateUrl: './msi-modal.html',
  styleUrl: './msi-modal.css'
})
export class MsiModal {

  @Output() cerrar = new EventEmitter<void>();

  constructor(
    private categoriasService: CategoriasService,
    private tarjetasService: TarjetasService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private generalService: GeneralService
  ) {}

  editar: boolean = true;
  confirmModal: boolean = false;

  catEgresosSuscription: Subscription | null = null;
  TarejtasSuscription: Subscription | null = null;

  catEgresos: Categoria[] = [];
  tarjetas: Tarjeta[] = [];

  importe: string = '';

  valFecha: boolean = false;
  valImporte: boolean = false;
  valCatEgreso: boolean = false;
  valTarjeta: boolean = false;
  valDescripcion: boolean = false;
  valConcepto: boolean = false;
  valNecesario: boolean = false;
  valMeses: boolean = false;

  msi: MsiModel = new MsiModel();
  msiOriginal: MsiModel = new MsiModel();

  enviaDatos(){}

  eliminaMsi() {

  }

  cerrarModal() {
    this.cerrar.emit();
  }


  cancelaEdicion(): void {
    this.msi = this.msiOriginal;
    this.importe = this.msi.getImporte();
    this.editar = false;
    this.cdr.detectChanges(); 
  }



  formatearSaldo(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    // Obtén la posición actual del cursor
    const cursorPos = input.selectionStart || 0;

    // Elimina caracteres no numéricos y permite solo un punto decimal
    valor = valor.replace(/[^0-9.]/g, ''); // Elimina letras y caracteres no permitidos
    valor = valor.replace(/(\..*)\./g, '$1'); // Permite solo un punto decimal

    // Convierte el valor a número y lo formatea como moneda
    const partes = valor.split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Agrega comas como separadores de miles
    const decimal = partes.length > 1 ? '.' + partes[1].slice(0, 2) : ''; // Limita los decimales a 2 dígitos

    // Actualiza el valor formateado
    this.importe = entero + decimal;

    const numeroDeComas = (this.importe.match(/,/g) || []).length;

    // Calcula el nuevo cursor basado en el formato
    const diff = this.importe.length - valor.length; // Diferencia en longitud después del formato
    const newCursorPos = cursorPos + diff - (this.esBorrado ? numeroDeComas : 0); // Ajusta la posición del cursor considerando las comas y si se borró

    // Actualiza el valor del campo de entrada
    input.value = this.importe;

    // Restaura la posición del cursor
    setTimeout(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  esBorrado: boolean = false;
  detectarTecla(event: KeyboardEvent): void {
    this.esBorrado = event.key === 'Backspace' || event.key === 'Delete';
  }

  actualizaSaldo(): void {
    this.msi.setImporte(this.importe);
  }

}
