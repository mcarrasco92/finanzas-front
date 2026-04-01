import { Component, ChangeDetectorRef } from '@angular/core';
import { ToastService, TypeToast, typToast } from '../../../../shared/toast/service/toast-service';
import { Loading } from '../../../../shared/loading/loading';
import { Toast } from '../../../../shared/toast/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarjetasService } from '../../../../services/tarjetas/tarjetas';
import { Router } from '@angular/router';
import { Tarjeta } from '../../../../models/tarjeta';
import { Subscription } from 'rxjs';
import { GeneralService } from '../../../../services/general-service';

@Component({
  selector: 'app-lista-tdc',
  imports: [Toast, Loading, CommonModule, FormsModule],
  templateUrl: './lista-tdc.html',
  styleUrl: './lista-tdc.css'
})
export class ListaTDC {

  constructor(private tarjetaService: TarjetasService,
      private toast: ToastService,
      private cdr: ChangeDetectorRef,
      private router: Router,
      private generalService: GeneralService
) { }


  tarjetasDesactivadas: boolean = false;
  desactivadasSubscription: Subscription | null = null;
  tarjetas: Tarjeta[] = [];
  saldoTotal: number = 0;
  saldoMensual: number = 0;
  saldoAPagar: number = 0;

  tarjetasSuscription: Subscription | null = null;

  ngOnInit() {

    this.generalService.setScreen('lista-tdc');

    this.tarjetasSuscription = this.tarjetaService.tarjetasList$.subscribe((tarjetas) => {
      this.tarjetas = tarjetas;
      this.cdr.detectChanges();
    });

    this.tarjetasSuscription = this.tarjetaService.saldoTotal$.subscribe((saldo) => {
      this.saldoTotal = saldo;
      this.cdr.detectChanges();
    });

    this.tarjetasSuscription = this.tarjetaService.saldoMensual$.subscribe((saldo) => {
      this.saldoMensual = saldo;
      this.cdr.detectChanges();
    });

    this.tarjetasSuscription = this.tarjetaService.saldoAPagar$.subscribe((saldo) => {
      this.saldoAPagar = saldo;
      this.cdr.detectChanges();
    });

    this.desactivadasSubscription = this.generalService.mostrarDesactivadas$.subscribe(value => {
      this.tarjetasDesactivadas = value;
      this.cdr.detectChanges();
    });
  }

  toggleDesactivadas(): void {
    this.generalService.setMostrarDesactivadas(this.tarjetasDesactivadas);
  }

  consultaTarjeta(id: String) {
    this.router.navigate(['/dashboard/cuentas/tdcf/' + id]);
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

  getInitials(tarjeta: Tarjeta): string {
    const firstWord = tarjeta.nombre.split(' ')[0];
    return firstWord.length <= 2 ? firstWord.toUpperCase() : firstWord[0].toUpperCase();
  }

  getAvatarClass(tarjeta: Tarjeta): string {
    const classes = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-red-100 text-red-700',
      'bg-green-100 text-green-700',
      'bg-amber-100 text-amber-700',
      'bg-indigo-100 text-indigo-700',
      'bg-pink-100 text-pink-700',
      'bg-teal-100 text-teal-700',
    ];
    const hash = tarjeta.nombre.charCodeAt(0) + (tarjeta.nombre.charCodeAt(1) || 0);
    return classes[hash % classes.length];
  }

  ngOnDestroy() {
    this.tarjetasSuscription?.unsubscribe();
    this.desactivadasSubscription?.unsubscribe();
    this.toast.clear();
  }

}
