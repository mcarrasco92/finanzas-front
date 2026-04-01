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
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis,
  ApexStroke, ApexMarkers, ApexDataLabels, ApexGrid, ApexTooltip
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  markers: ApexMarkers;
  colors: string[];
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-msi',
  imports: [CommonModule, FormsModule, Toast, NgApexchartsModule],
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
  chartOptions: Partial<ChartOptions> = {};
  anioSeleccionado: number = new Date().getFullYear();

  tarejtasSuscription: Subscription | null = null;
  generalSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.tarejtasSuscription = this.tarjetasService.tarjetasList$.subscribe(tarjetas => {
      this.tarejtas = tarjetas;
      this.cdr.detectChanges();
    });

    this.consultaMsis();

    this.generalSubscription = this.generalService.actualizaPantalla$.subscribe(actualiza => {
      actualiza ? this.consultaMsis() : null;
    });
  }

  consultaMsis() {
    this.msiService.getMsi().subscribe(response => {
      if (response.coderr === "0000") {
        this.msis = response.data;
        this.calcularGrafica();
        this.cdr.detectChanges();
      } else {
        this.toast.show("Ocurrio un error al consultar MSI", '', response.message);
      }
    });
  }

  calcularGrafica(): void {
    if (this.msis.length === 0) return;

    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const months = Array.from({ length: 12 }, (_, i) => new Date(this.anioSeleccionado, i, 1));

    const totals = months.map(month => {
      let total = 0;
      for (const msi of this.msis) {
        const [y, m] = msi.fecha.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m - 1 + msi.meses - 1, 1);
        if (month >= start && month <= end) {
          total += msi.importe / msi.meses;
        }
      }
      return Math.round(total * 100) / 100;
    });

    const labels = mesesNombres;

    this.chartOptions = {
      series: [{ name: 'Pago MSI', data: totals }],
      chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
      xaxis: { categories: labels },
      yaxis: {
        labels: {
          formatter: (val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        }
      },
      stroke: { curve: 'smooth', width: 2 },
      markers: { size: 4 },
      colors: ['#6366f1'],
      dataLabels: { enabled: false },
      grid: { borderColor: '#f1f1f1' },
      tooltip: {
        y: {
          formatter: (val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      }
    };
  }

  anteriorAnio(): void {
    this.anioSeleccionado--;
    this.calcularGrafica();
    this.cdr.detectChanges();
  }

  siguienteAnio(): void {
    this.anioSeleccionado++;
    this.calcularGrafica();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.tarejtasSuscription?.unsubscribe();
    this.generalSubscription?.unsubscribe();
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
