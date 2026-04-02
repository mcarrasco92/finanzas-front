import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransaccionesRecurrentesService } from '../../services/transacciones-recurrentes/transacciones-recurrentes';
import { TransaccionRecurrenteModel } from '../../models/transaccion-recurrente';
import { TransaccionesRecurrentesModal } from '../transacciones-recurrentes-modal/transacciones-recurrentes-modal';
import { Toast } from '../../shared/toast/toast';
import { Subscription } from 'rxjs';
import { Tarjeta } from '../../models/tarjeta';
import { Cuenta } from '../../models/cuenta';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { CuentasService } from '../../services/cuentas/cuentas';

@Component({
  selector: 'app-transacciones-recurrentes',
  imports: [CommonModule, FormsModule, TransaccionesRecurrentesModal, Toast],
  templateUrl: './transacciones-recurrentes.html',
  styleUrl: './transacciones-recurrentes.css'
})
export class TransaccionesRecurrentes {
  transacciones: TransaccionRecurrenteModel[] = [];
  modalAbierto: boolean = false;

  tarejtas: Tarjeta[] = [];
  cuentas: Cuenta[] = [];

  tarejtasSuscription: Subscription | null = null;
  cuentasSuscription: Subscription | null = null;

  tipoMovimiento: string = 'Egreso';

  constructor(
    private transaccionesService: TransaccionesRecurrentesService,
    private cdr: ChangeDetectorRef,
    private tarjetasService: TarjetasService,
    private cuentasService: CuentasService
  ) {}

  ngOnInit(): void {
    this.consultaTransacciones();

    this.tarejtasSuscription = this.tarjetasService.tarjetasList$.subscribe(tarjetas => {
        this.tarejtas = tarjetas;
        this.cdr.detectChanges();
      });

    this.cuentasSuscription = this.cuentasService.cuentasList$.subscribe(cuentas => {
        this.cuentas = cuentas;
        this.cdr.detectChanges();
      });
  }

  consultaTransacciones() {
    this.transaccionesService.getTransaccionesRecurrentes().subscribe(response => {
      if (response.coderr === "0000") {
        this.transacciones = response.data;
        this.cdr.detectChanges();
      }
    });
  }

  consultaCuentaTarjeta(trans: TransaccionRecurrenteModel){
    if(trans.cuentaId){
      const cuenta = this.cuentas.find(c => c.id === trans.cuentaId);
      return cuenta ? cuenta.nombre : 'Cuenta no encontrada';
    } else if (trans.tarjetaId){
      const tarjeta = this.tarejtas.find(t => t.id === trans.tarjetaId);
      return tarjeta ? tarjeta.nombre : 'Tarjeta no encontrada';
    }else{
        return '';  
    }   
  }

  abrirModal() {
    this.modalAbierto = true;
    this.transaccionesService.setTransaccionRecurrente(new TransaccionRecurrenteModel());
  }

  consultaTransaccion(trans: any) {
    console.log('Consulta transaccion recurrente:', trans);
    this.modalAbierto = true;
    this.transaccionesService.setTransaccionRecurrente(trans);
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.consultaTransacciones();
  }

  get sinTransaccionesDelTipo(): boolean {
    return !this.transacciones.some(t => t.tipo === this.tipoMovimiento);
  }

  getInitials(trans: TransaccionRecurrenteModel): string {
    const firstWord = trans.concepto.split(' ')[0];
    return firstWord.length <= 2 ? firstWord.toUpperCase() : firstWord[0].toUpperCase();
  }

  getAvatarClass(trans: TransaccionRecurrenteModel): string {
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
    const hash = trans.concepto.charCodeAt(0) + (trans.concepto.charCodeAt(1) || 0);
    return classes[hash % classes.length];
  }
}
