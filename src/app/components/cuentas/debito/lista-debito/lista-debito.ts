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
import { Subscription } from 'rxjs';
import { GeneralService } from '../../../../services/general-service';


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
    private router: Router,
    private generalService: GeneralService
  ) { }

  cuentas: Cuenta[] = [];
  saldoDisponible: number = 0;
  saldoInvertido: number = 0;
  saldoTotal: number = 0;

  porcentajeInvertido: number = 0;
  cuentasDesactivadas: boolean = false;

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
      this.cdr.detectChanges();
    });
    
  }

  consultarCuentas(){


    this.cuentasService.getCuentas().subscribe(response => {

      if(response.coderr !== '0000') {
        this.toast.show('Error al consultar las cuentas', response.message, TypeToast.danger);
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
      this.cdr.detectChanges();
    }, () => {
      this.cdr.detectChanges();
    }

    );
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


  ngOnDestroy() {
    this.cuentasSubscription?.unsubscribe();
    this.saldoDisponibleSubscription?.unsubscribe();
    this.saldoInvertidoSubscription?.unsubscribe();
    this.saldoTotalSubscription?.unsubscribe();
    this.toast.clear();
  }
  



}
