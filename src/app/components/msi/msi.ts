import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../shared/toast/toast';
import { MsiService } from '../../services/msi/msi';
import { ToastService } from '../../shared/toast/service/toast-service';
import { MsiModel } from '../../models/msi';
import { Subscription } from 'rxjs';
import { Tarjeta } from '../../models/tarjeta';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { GeneralService } from '../../services/general-service';

@Component({
  selector: 'app-msi',
  imports: [CommonModule, FormsModule, Toast],
  templateUrl: './msi.html',
  styleUrl: './msi.css'
})
export class Msi {
  constructor(
    private toast: ToastService,
    private msiService: MsiService,
    private cdr: ChangeDetectorRef,
    private tarjetasService: TarjetasService,
    private generalService: GeneralService
  ) { }

  msis: MsiModel[] = [];
  tarejtas: Tarjeta[] = [];
  mostrarVencidos = false;
  tarejtasSuscription: Subscription | null = null;
  generalSubscription: Subscription | null = null;
  msiActualizadoSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.tarejtasSuscription = this.tarjetasService.tarjetasList$.subscribe(tarjetas => {
      this.tarejtas = tarjetas;
      this.cdr.detectChanges();
    });

    this.consultaMsis();

    this.generalSubscription = this.generalService.actualizaPantalla$.subscribe(actualiza => {
      actualiza ? this.consultaMsis() : null;
    });

    this.msiActualizadoSubscription = this.msiService.msiActualizado$.subscribe(() => {
      this.consultaMsis();
    });
  }

  consultaMsis() {
    this.msiService.getMsi().subscribe(response => {
      if (response.coderr === "0000") {
        this.msis = response.data;
        this.cdr.detectChanges();
      } else {
        this.toast.show("Ocurrio un error al consultar MSI", '', response.message);
      }
    });
  }

  get pagoMesActual(): number {
    const now = new Date();
    const cy = now.getFullYear(), cm = now.getMonth();
    return Math.round(
      this.msis
        .filter(msi => {
          const [y, m] = msi.fecha.split('-').map(Number);
          const s = y * 12 + (m - 1), e = s + msi.meses - 1, c = cy * 12 + cm;
          return c >= s && c <= e;
        })
        .reduce((acc, msi) => acc + msi.importe / msi.meses, 0)
      * 100) / 100;
  }

  get saldoPorLiquidar(): number {
    const now = new Date();
    const c = now.getFullYear() * 12 + now.getMonth();
    let total = 0;
    for (const msi of this.msis) {
      const [y, m] = msi.fecha.split('-').map(Number);
      const s = y * 12 + (m - 1), e = s + msi.meses - 1;
      if (c <= e) {
        const remaining = e - Math.max(c, s) + 1;
        total += remaining * (msi.importe / msi.meses);
      }
    }
    return Math.round(total * 100) / 100;
  }

  isVencido(msi: MsiModel): boolean {
    const now = new Date();
    const c = now.getFullYear() * 12 + now.getMonth();
    const [y, m] = msi.fecha.split('-').map(Number);
    return c > y * 12 + (m - 1) + msi.meses - 1;
  }

  get msisFiltrados(): MsiModel[] {
    return this.mostrarVencidos ? this.msis : this.msis.filter(msi => !this.isVencido(msi));
  }

  get totalVencidos(): number {
    return this.msis.filter(msi => this.isVencido(msi)).length;
  }

  getMensualidadActual(msi: MsiModel): number | null {
    const now = new Date();
    const c = now.getFullYear() * 12 + now.getMonth();
    const [y, m] = msi.fecha.split('-').map(Number);
    const s = y * 12 + (m - 1);
    const e = s + msi.meses - 1;
    if (c < s || c > e) return null;
    return c - s + 1;
  }

  get comprasActivas(): number {
    const now = new Date();
    const c = now.getFullYear() * 12 + now.getMonth();
    return this.msis.filter(msi => {
      const [y, m] = msi.fecha.split('-').map(Number);
      const s = y * 12 + (m - 1);
      return c >= s && c <= s + msi.meses - 1;
    }).length;
  }

  ngOnDestroy(): void {
    this.tarejtasSuscription?.unsubscribe();
    this.generalSubscription?.unsubscribe();
    this.msiActualizadoSubscription?.unsubscribe();
  }

  abrirMsiModal() {
    this.msiService.setMsi('0');
  }

  consultaMsi(msiId: string) {
    this.msiService.setMsi(msiId);
  }

  consultaTarjeta(tarjetaId: string) {
    return this.tarejtas.find(t => t.id === tarjetaId)?.nombre || '';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-').map(Number);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${day} de ${meses[month - 1]} de ${year}`;
  }

  getInitials(msi: MsiModel): string {
    const firstWord = msi.concepto.split(' ')[0];
    return firstWord.length <= 2 ? firstWord.toUpperCase() : firstWord[0].toUpperCase();
  }

  getAvatarClass(msi: MsiModel): string {
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
    const hash = msi.concepto.charCodeAt(0) + (msi.concepto.charCodeAt(1) || 0);
    return classes[hash % classes.length];
  }
}
