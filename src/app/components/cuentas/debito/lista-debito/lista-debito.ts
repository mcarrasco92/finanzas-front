import { Component } from '@angular/core';
import { CuentasService } from '../../../../services/cuentas/cuentas';
import { CommonModule } from '@angular/common';
import { Toast } from '../../../../shared/toast/toast';
import { ToastService, TypeToast, typToast } from '../../../../shared/toast/service/toast-service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Cuenta } from '../../../../models/cuenta';
import { Subscription } from 'rxjs';
import { GeneralService } from '../../../../services/general-service';


@Component({
  selector: 'app-lista-debito',
  imports: [CommonModule, Toast, FormsModule],
  templateUrl: './lista-debito.html',
  styleUrl: './lista-debito.css'
})
export class ListaDebito {
  constructor(private cuentasService: CuentasService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private generalService: GeneralService
  ) { }

  cuentas: Cuenta[] = [];
  saldoDisponible: number = 0;
  saldoInvertido: number = 0;
  saldoTotal: number = 0;

  porcentajeInvertido: number = 0;
  cuentasDesactivadas: boolean = false;
  desactivadasSubscription: Subscription | null = null;

  cuentasSubscription: Subscription | null = null;
  saldoDisponibleSubscription: Subscription | null = null;
  saldoInvertidoSubscription: Subscription | null = null;
  saldoTotalSubscription: Subscription | null = null;

  colorPrincipal = "green-500";
  colorSecundario = "blue-100";

  ngOnInit() {

    this.generalService.setScreen('lista-debito');

    this.cuentasSubscription = this.cuentasService.cuentasList$.subscribe((cuentas) => {
      this.cuentas = cuentas;
      this.cdr.detectChanges();
    });

    this.saldoDisponibleSubscription = this.cuentasService.saldoDisponible$.subscribe((saldo) => {
      this.saldoDisponible = saldo;
      this.cdr.detectChanges();
    });

    this.saldoInvertidoSubscription = this.cuentasService.saldoInvertido$.subscribe((saldo) => {
      this.saldoInvertido = saldo;
      this.cdr.detectChanges();
    });

    this.saldoTotalSubscription = this.cuentasService.saldoTotal$.subscribe((saldo) => {
      this.saldoTotal = saldo;
      this.porcentajeInvertido = this.saldoTotal > 0 ? (this.saldoInvertido / this.saldoTotal) * 100 : 0;
      this.cdr.detectChanges();
    });

    this.desactivadasSubscription = this.generalService.mostrarDesactivadas$.subscribe(value => {
      this.cuentasDesactivadas = value;
      this.cdr.detectChanges();
    });
  }

  toggleDesactivadas(): void {
    this.generalService.setMostrarDesactivadas(this.cuentasDesactivadas);
  }

  consultaCuenta(id: String) {
    this.router.navigate(['/dashboard/cuentas/debitof/' + id]);
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

  get sinCuentas(): boolean {
    return this.cuentas.length === 0 || (!this.cuentasDesactivadas && this.cuentas.every(c => !c.activa));
  }

  getInitials(cuenta: Cuenta): string {
    const firstWord = cuenta.nombre.split(' ')[0];
    return firstWord.length <= 2 ? firstWord.toUpperCase() : firstWord[0].toUpperCase();
  }

  getAvatarClass(cuenta: Cuenta): string {
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
    const hash = cuenta.nombre.charCodeAt(0) + (cuenta.nombre.charCodeAt(1) || 0);
    return classes[hash % classes.length];
  }


  ngOnDestroy() {
    this.cuentasSubscription?.unsubscribe();
    this.saldoDisponibleSubscription?.unsubscribe();
    this.saldoInvertidoSubscription?.unsubscribe();
    this.saldoTotalSubscription?.unsubscribe();
    this.desactivadasSubscription?.unsubscribe();
    this.toast.clear();
  }
  



}
