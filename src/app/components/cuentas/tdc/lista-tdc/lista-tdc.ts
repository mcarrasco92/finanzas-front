import { Component, ChangeDetectorRef } from '@angular/core';
import { ToastService, TypeToast, typToast } from '../../../../shared/toast/service/toast-service';
import { Loading } from '../../../../shared/loading/loading';
import { Toast } from '../../../../shared/toast/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarjetasService } from '../../../../services/tarjetas/tarjetas';
import { Router } from '@angular/router';
import { Tarjeta } from '../../../../models/tarjeta';
import { DragIcon } from '../../../../shared/icons/drag-icon/drag-icon';

@Component({
  selector: 'app-lista-tdc',
  imports: [Toast, Loading, CommonModule, FormsModule, DragIcon],
  templateUrl: './lista-tdc.html',
  styleUrl: './lista-tdc.css'
})
export class ListaTDC {

  constructor(private tarjetaService: TarjetasService,
    private toast: ToastService,
     private cdr: ChangeDetectorRef,
 private router: Router) { }


  tarjetasDesactivadas: boolean = false;
  isLoading: boolean = false;
  tarjetas: Tarjeta[] = [];

  ngOnInit() {

    this.isLoading = true;

    this.tarjetaService.getTarjetas().subscribe(response => {

      if(response.coderr !== '0000') {
        this.toast.show('Error al consultar las tarjetas de crédito', response.message, TypeToast.danger);
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.tarjetas = response.data.tarjetas;

      this.tarjetas.sort((a, b) => a.orden - b.orden);

    }, error => {
      this.toast.show('Error al consultar las tarjetas de crédito', 'Error: ' + error.status, TypeToast.danger);
      this.isLoading = false;
      this.cdr.detectChanges();
    }, () => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }

    );
  }

  consultaTarjeta(id: String) {
    this.tarjetaService.setData(id);
    this.router.navigate(['/dashboard/cuentas/tdcf']);
  }

  ordenarTarjetas() {

    const tarjetasOrdenadas: { id: string; orden: number }[] = [];

    this.tarjetas.forEach((tarjeta, index) => {
      tarjetasOrdenadas.push({
        id: tarjeta.id, 
        orden: index + 1 
      });

    })

    this.tarjetaService.ordenaTarjetas(tarjetasOrdenadas).subscribe(response => {});

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
      const draggedItem = this.tarjetas[this.draggedIndex];
      this.tarjetas.splice(this.draggedIndex, 1); // Eliminar el elemento arrastrado
      this.tarjetas.splice(targetIndex, 0, draggedItem); // Insertar en la nueva posición
    }

    this.ordenarTarjetas();

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
