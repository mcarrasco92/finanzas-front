import { Component } from '@angular/core';
import { CuentasService } from '../../../../services/cuentas/cuentas';
import { CommonModule } from '@angular/common';
import { Toast } from '../../../../shared/toast/toast';
import { ToastService, TypeToast, typToast } from '../../../../shared/toast/service/toast-service';
import { Loading } from '../../../../shared/loading/loading';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Cuenta } from '../../../../models/cuenta';
import { DragIcon } from '../../../../shared/icons/drag-icon/drag-icon';


@Component({
  selector: 'app-lista-debito',
  imports: [CommonModule, Toast, Loading, FormsModule, DragIcon],
  templateUrl: './lista-debito.html',
  styleUrl: './lista-debito.css'
})
export class ListaDebito {
  constructor(private cuentasService: CuentasService,
     private toast: ToastService,
      private cdr: ChangeDetectorRef,
  private router: Router) { }

  isLoading: boolean = false;
  cuentas: Cuenta[] = [];
  saldoDisponible: number = 0;
  saldoInvertido: number = 0;
  saldoTotal: number = 0;

  porcentajeInvertido: number = 0;
  cuentasDesactivadas: boolean = false;
  

  ngOnInit() {

    this.isLoading = true;

    this.cuentasService.getCuentas().subscribe(response => {

      if(response.coderr !== '0000') {
        this.toast.show('Error al consultar las cuentas', response.message, TypeToast.danger);
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.saldoDisponible = response.data.saldoDisponible;
      this.saldoInvertido = response.data.saldoInvertido;
      this.saldoTotal = response.data.saldoTotal;

      this.porcentajeInvertido = response.data.saldoTotal > 0 ? (response.data.saldoInvertido / response.data.saldoTotal) * 100 : 0;

      this.cuentas = response.data.cuentas;

      this.cuentas.sort((a, b) => a.orden - b.orden);



    }, error => {
      this.toast.show('Error al consultar las cuentas', 'Error: ' + error.status, TypeToast.danger);
      this.isLoading = false;
      this.cdr.detectChanges();
    }, () => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }

    );
  }

  consultaCuenta(id: String) {
    this.cuentasService.setData(id);
    this.router.navigate(['/dashboard/cuentas/debitof']);
  }


  ordenarCuentas() {

    const cuentasOrdenadas: { id: string; orden: number }[] = [];

    this.cuentas.forEach((cuenta, index) => {
      cuentasOrdenadas.push({
        id: cuenta.id, // Asume que cada cuenta tiene un campo `id`
        orden: index + 1 // La posición en el arreglo original (1 basado)
      });

    })

    this.cuentasService.ordenaCuentas(cuentasOrdenadas).subscribe(response => {});

  }


  isDraggable: boolean = false;
  draggedIndex: number | null = null;

  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Permite el evento de soltar
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();

    if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
      // Reordenar el array
      const draggedItem = this.cuentas[this.draggedIndex];
      this.cuentas.splice(this.draggedIndex, 1); // Eliminar el elemento arrastrado
      this.cuentas.splice(targetIndex, 0, draggedItem); // Insertar en la nueva posición
    }

    this.ordenarCuentas();

    this.draggedIndex = null; // Reiniciar el índice arrastrado
  }


  onMouseDown(): void {
    this.isDraggable = true;
  }
  
  onMouseUp(): void {
    this.isDraggable = false;
  }

  ngDestroy() {
    this.isLoading = false;
    this.toast.clear();
  }
  



}
