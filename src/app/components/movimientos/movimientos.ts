import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ResumenService } from '../../services/resumen/resumen';
import { ResumenMensual, ResumenTransaccion } from '../../models/resumen-mensual';
import { TransaccionesService } from '../../services/transacciones/transacciones';
import { TransferenciasService } from '../../services/transferencias/transferencias';
import { CuentasService } from '../../services/cuentas/cuentas';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { Transaccion } from '../../models/transaccion';
import { Transferencia } from '../../models/transferencia';
import { MsiService } from '../../services/msi/msi';
import { GeneralService } from '../../services/general-service';

export interface MovimientoRow {
  transaccion: ResumenTransaccion;
  cuenta: string;
  esTarjeta: boolean;
}

@Component({
  selector: 'app-movimientos',
  imports: [CommonModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css'
})
export class Movimientos {
  constructor(
    private resumenService: ResumenService,
    private transaccionesService: TransaccionesService,
    private transferenciaService: TransferenciasService,
    private cuentasService: CuentasService,
    private tarjetasService: TarjetasService,
    private msiService: MsiService,
    private generalService: GeneralService,
    private cdr: ChangeDetectorRef
  ) {}

  readonly MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  mes: number = new Date().getMonth() + 1;
  anio: number = new Date().getFullYear();
  cargando = false;
  agrupadosPorFecha: { [fecha: string]: MovimientoRow[] } = {};

  private cuentasSub: Subscription | null = null;
  private tarjetasSub: Subscription | null = null;
  private actualizaSub: Subscription | null = null;

  get mesNombre(): string { return this.MESES[this.mes - 1]; }

  getFechas(): string[] {
    return Object.keys(this.agrupadosPorFecha).sort((a, b) => b.localeCompare(a));
  }

  get totalMovimientos(): number {
    return Object.values(this.agrupadosPorFecha).reduce((acc, rows) => acc + rows.length, 0);
  }

  get totalIngresos(): number {
    return Math.round(
      Object.values(this.agrupadosPorFecha).flat()
        .filter(r => r.transaccion.tipo === 'Ingreso')
        .reduce((acc, r) => acc + r.transaccion.importe, 0)
      * 100) / 100;
  }

  get totalEgresos(): number {
    return Math.round(
      Object.values(this.agrupadosPorFecha).flat()
        .filter(r => r.transaccion.tipo === 'Egreso')
        .reduce((acc, r) => acc + r.transaccion.importe, 0)
      * 100) / 100;
  }

  get balance(): number {
    return Math.round((this.totalIngresos - this.totalEgresos) * 100) / 100;
  }

  ngOnInit(): void {
    this.cuentasSub = this.cuentasService.cuentasList$.subscribe();
    this.tarjetasSub = this.tarjetasService.tarjetasList$.subscribe();
    this.actualizaSub = this.generalService.actualizaPantalla$.subscribe(actualiza => {
      if (actualiza) this.cargar();
    });
    this.cargar();
  }

  ngOnDestroy(): void {
    this.cuentasSub?.unsubscribe();
    this.tarjetasSub?.unsubscribe();
    this.actualizaSub?.unsubscribe();
  }

  cargar(): void {
    this.cargando = true;
    this.agrupadosPorFecha = {};
    this.resumenService.getResumenMensual(this.mes, this.anio).subscribe(response => {
      this.cargando = false;
      if (response.coderr === '0000') {
        this.construirAgrupado(response.data);
        this.cdr.detectChanges();
      }
    });
  }

  private construirAgrupado(data: ResumenMensual): void {
    const agrupado: { [fecha: string]: MovimientoRow[] } = {};
    for (const cuenta of data.cuentas) {
      for (const t of cuenta.transacciones) {
        if (!agrupado[t.fecha]) agrupado[t.fecha] = [];
        agrupado[t.fecha].push({ transaccion: t, cuenta: cuenta.nombre, esTarjeta: false });
      }
    }
    for (const tarjeta of data.tarjetas) {
      for (const t of tarjeta.transacciones) {
        if (!agrupado[t.fecha]) agrupado[t.fecha] = [];
        agrupado[t.fecha].push({ transaccion: t, cuenta: tarjeta.nombre, esTarjeta: true });
      }
    }
    this.agrupadosPorFecha = agrupado;
  }

  anteriorMes(): void {
    if (this.mes === 1) { this.mes = 12; this.anio--; } else this.mes--;
    this.cargar();
  }

  siguienteMes(): void {
    if (this.mes === 12) { this.mes = 1; this.anio++; } else this.mes++;
    this.cargar();
  }

  abrirDetalle(row: MovimientoRow): void {
    if (!row.transaccion.categoria) {
      const pago = new Transferencia();
      pago.id = row.transaccion.id;
      pago.tipoCuentaDestino = 'Tarjeta';
      this.transferenciaService.setTransferencia(pago);
      return;
    }
    if (row.transaccion.msiId) {
      this.msiService.setMsi(row.transaccion.msiId);
      return;
    }
    this.transaccionesService.getTransaccionById(row.transaccion.id).subscribe(response => {
      if (response.coderr !== '0000') return;
      const trans: Transaccion = Object.assign(new Transaccion(), response.data);
      this.transaccionesService.setTransaccion(trans);
    });
  }

  formatFechaHeader(fecha: string): string {
    const [, m, d] = fecha.split('-').map(Number);
    return `${d.toString().padStart(2, '0')} ${this.MESES[m - 1].toUpperCase()}`;
  }
}
