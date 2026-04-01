import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis,
  ApexStroke, ApexMarkers, ApexDataLabels, ApexGrid, ApexTooltip,
  ApexPlotOptions, ApexLegend
} from 'ng-apexcharts';
import { forkJoin, Subscription } from 'rxjs';
import { TransaccionesRecurrentesService } from '../../services/transacciones-recurrentes/transacciones-recurrentes';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { CuentasService } from '../../services/cuentas/cuentas';
import { MsiService } from '../../services/msi/msi';
import { ResumenService } from '../../services/resumen/resumen';
import { TransaccionRecurrenteModel } from '../../models/transaccion-recurrente';
import { MsiModel } from '../../models/msi';
import { ResumenMensual, ResumenTransaccion } from '../../models/resumen-mensual';
import { Tarjeta } from '../../models/tarjeta';
import { Cuenta } from '../../models/cuenta';

export type MsiChartOptions = {
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

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  colors: string[];
  grid: ApexGrid;
};

export interface AnalisisMes {
  mes: number;
  anio: number;
  ingresos: number;
  egresos: number;
  balance: number;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(
    private recurrentesService: TransaccionesRecurrentesService,
    private tarjetasService: TarjetasService,
    private cuentasService: CuentasService,
    private msiService: MsiService,
    private resumenService: ResumenService,
    private cdr: ChangeDetectorRef
  ) {}

  readonly MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Análisis comparativo
  analisisPrevio: AnalisisMes | null = null;
  analisisAnterior: AnalisisMes | null = null;
  cargandoAnalisis = false;

  // Cargos recurrentes
  transacciones: TransaccionRecurrenteModel[] = [];
  tarjetas: Tarjeta[] = [];
  cuentas: Cuenta[] = [];
  cargando = false;

  // MSI chart
  msis: MsiModel[] = [];
  anioSeleccionado: number = new Date().getFullYear();
  chartOptions: Partial<MsiChartOptions> = {};
  cargandoMsi = false;

  // Bar chart (categorías)
  mesGrafica: number = new Date().getMonth() + 1;
  anioGrafica: number = new Date().getFullYear();
  barChartOptions: Partial<BarChartOptions> = {};
  cargandoBar = false;

  // Annual chart (ingresos vs egresos)
  anioAnual: number = new Date().getFullYear();
  anualChartOptions: Partial<BarChartOptions> = {};
  cargandoAnual = false;

  private tarjetasSub: Subscription | null = null;
  private cuentasSub: Subscription | null = null;

  // ── Getters análisis ─────────────────────────────────────────────────────────

  get nombreMesPrevio(): string {
    return this.analisisPrevio ? this.MESES[this.analisisPrevio.mes - 1] : '';
  }

  get nombreMesAnterior(): string {
    return this.analisisAnterior ? this.MESES[this.analisisAnterior.mes - 1] : '';
  }

  get pctBalance(): number | null {
    if (!this.analisisPrevio || !this.analisisAnterior) return null;
    if (this.analisisAnterior.balance === 0) return null;
    return Math.round(((this.analisisPrevio.balance - this.analisisAnterior.balance)
      / Math.abs(this.analisisAnterior.balance)) * 100);
  }

  get pctIngresos(): number | null {
    if (!this.analisisPrevio || !this.analisisAnterior) return null;
    if (this.analisisAnterior.ingresos === 0) return null;
    return Math.round(((this.analisisPrevio.ingresos - this.analisisAnterior.ingresos)
      / this.analisisAnterior.ingresos) * 100);
  }

  get pctEgresos(): number | null {
    if (!this.analisisPrevio || !this.analisisAnterior) return null;
    if (this.analisisAnterior.egresos === 0) return null;
    return Math.round(((this.analisisPrevio.egresos - this.analisisAnterior.egresos)
      / this.analisisAnterior.egresos) * 100);
  }

  get tasaAhorro(): number {
    if (!this.analisisPrevio || this.analisisPrevio.ingresos === 0) return 0;
    return Math.round((this.analisisPrevio.balance / this.analisisPrevio.ingresos) * 100);
  }

  get insightTendencia(): 'positive' | 'neutral' | 'negative' {
    if (!this.analisisPrevio) return 'neutral';
    if (this.analisisPrevio.balance < 0) return 'negative';
    if (this.analisisPrevio.balance > 0 && (this.pctBalance === null || this.pctBalance >= 0)) return 'positive';
    return 'neutral';
  }

  get insightTexto(): string {
    if (!this.analisisPrevio) return '';
    const prev = this.analisisPrevio;
    const pctBal = this.pctBalance;
    const mesPrev = this.nombreMesPrevio;
    const mesAnt = this.nombreMesAnterior;
    const tasa = this.tasaAhorro;
    const fmt = (n: number) => `$${Math.abs(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let texto = '';

    if (prev.balance > 0) {
      if (pctBal !== null && pctBal > 0) {
        texto = `En ${mesPrev} aumentaste tu ahorro un ${pctBal}% respecto a ${mesAnt}.`;
      } else if (pctBal !== null && pctBal < 0) {
        texto = `En ${mesPrev} tu ahorro disminuyó un ${Math.abs(pctBal)}% respecto a ${mesAnt}.`;
      } else {
        texto = `En ${mesPrev} tus ingresos superaron tus gastos por ${fmt(prev.balance)}.`;
      }
      if (tasa >= 20) texto += ` Excelente tasa de ahorro del ${tasa}%.`;
      else if (tasa >= 10) texto += ` Buena tasa de ahorro del ${tasa}%.`;
      else if (tasa > 0) texto += ` Tasa de ahorro del ${tasa}%, hay margen de mejora.`;
    } else if (prev.balance < 0) {
      if (pctBal !== null && pctBal > 0) {
        texto = `En ${mesPrev} redujiste el déficit un ${pctBal}% vs ${mesAnt}, pero tus gastos aún superaron tus ingresos por ${fmt(prev.balance)}.`;
      } else {
        texto = `En ${mesPrev} tus gastos superaron tus ingresos por ${fmt(prev.balance)}. Considera revisar tus egresos.`;
      }
    } else {
      texto = `En ${mesPrev} tus ingresos y gastos se equilibraron exactamente.`;
    }

    return texto;
  }

  // ── Getters cargos ──────────────────────────────────────────────────────────

  get cargos(): TransaccionRecurrenteModel[] {
    return this.transacciones.filter(t => t.tipo === 'Egreso');
  }

  get totalCargos(): number {
    return this.cargos.reduce((acc, t) => acc + t.importe, 0);
  }

  get mesGraficaNombre(): string {
    return this.MESES[this.mesGrafica - 1];
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.tarjetasSub = this.tarjetasService.tarjetasList$.subscribe(t => { this.tarjetas = t; });
    this.cuentasSub = this.cuentasService.cuentasList$.subscribe(c => { this.cuentas = c; });
    this.cargarAnalisis();
    this.cargarDatos();
    this.cargarMsi();
    this.cargarResumen();
    this.cargarResumenAnual();
  }

  ngOnDestroy(): void {
    this.tarjetasSub?.unsubscribe();
    this.cuentasSub?.unsubscribe();
  }

  // ── Análisis comparativo ─────────────────────────────────────────────────────

  cargarAnalisis(): void {
    const hoy = new Date();
    // getMonth() (0-indexed) coincide con el número de mes anterior en 1-indexed
    // Ej: abril → getMonth()=3 → mes previo completo = marzo = 3
    let mesPrevio = hoy.getMonth();
    let anioPrevio = hoy.getFullYear();
    if (mesPrevio === 0) { mesPrevio = 12; anioPrevio--; }

    let mesAnterior = mesPrevio - 1;
    let anioAnterior = anioPrevio;
    if (mesAnterior === 0) { mesAnterior = 12; anioAnterior--; }

    this.cargandoAnalisis = true;
    forkJoin([
      this.resumenService.getResumenMensual(mesPrevio, anioPrevio),
      this.resumenService.getResumenMensual(mesAnterior, anioAnterior)
    ]).subscribe(([resPrevio, resAnterior]) => {
      this.cargandoAnalisis = false;
      if (resPrevio.coderr === '0000') this.analisisPrevio = this.calcularAnalisis(resPrevio.data);
      if (resAnterior.coderr === '0000') this.analisisAnterior = this.calcularAnalisis(resAnterior.data);
      this.cdr.detectChanges();
    });
  }

  private calcularAnalisis(data: ResumenMensual): AnalisisMes {
    const all = [
      ...data.cuentas.flatMap(c => c.transacciones),
      ...data.tarjetas.flatMap(t => t.transacciones)
    ];
    const ingresos = all.filter(t => t.tipo === 'Ingreso').reduce((acc, t) => acc + t.importe, 0);
    const egresos = all.filter(t => t.tipo === 'Egreso').reduce((acc, t) => acc + t.importe, 0);
    return {
      mes: data.mes,
      anio: data.anio,
      ingresos: Math.round(ingresos * 100) / 100,
      egresos: Math.round(egresos * 100) / 100,
      balance: Math.round((ingresos - egresos) * 100) / 100
    };
  }

  // ── Cargos recurrentes ───────────────────────────────────────────────────────

  cargarDatos(): void {
    this.cargando = true;
    this.recurrentesService.getTransaccionesRecurrentes().subscribe(response => {
      this.cargando = false;
      if (response.coderr === '0000') {
        this.transacciones = response.data;
        this.cdr.detectChanges();
      }
    });
  }

  // ── MSI ──────────────────────────────────────────────────────────────────────

  cargarMsi(): void {
    this.cargandoMsi = true;
    this.msiService.getMsi().subscribe(response => {
      this.cargandoMsi = false;
      if (response.coderr === '0000') {
        this.msis = response.data;
        this.calcularGraficaMsi();
        this.cdr.detectChanges();
      }
    });
  }

  calcularGraficaMsi(): void {
    if (this.msis.length === 0) return;
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const months = Array.from({ length: 12 }, (_, i) => new Date(this.anioSeleccionado, i, 1));
    const totals = months.map(month => {
      let total = 0;
      for (const msi of this.msis) {
        const [y, m] = msi.fecha.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m - 1 + msi.meses - 1, 1);
        if (month >= start && month <= end) total += msi.importe / msi.meses;
      }
      return Math.round(total * 100) / 100;
    });
    this.chartOptions = {
      series: [{ name: 'Pago MSI', data: totals }],
      chart: { type: 'line', height: 250, toolbar: { show: false }, zoom: { enabled: false } },
      xaxis: { categories: mesesNombres },
      yaxis: { labels: { formatter: (v: number) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` } },
      stroke: { curve: 'smooth', width: 2 },
      markers: { size: 4 },
      colors: ['#6366f1'],
      dataLabels: { enabled: false },
      grid: { borderColor: '#f1f1f1' },
      tooltip: { y: { formatter: (v: number) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` } }
    };
  }

  anteriorAnio(): void { this.anioSeleccionado--; this.calcularGraficaMsi(); this.cdr.detectChanges(); }
  siguienteAnio(): void { this.anioSeleccionado++; this.calcularGraficaMsi(); this.cdr.detectChanges(); }

  // ── Bar chart ────────────────────────────────────────────────────────────────

  cargarResumen(): void {
    this.cargandoBar = true;
    this.barChartOptions = {};
    this.resumenService.getResumenMensual(this.mesGrafica, this.anioGrafica).subscribe(response => {
      this.cargandoBar = false;
      if (response.coderr === '0000') {
        this.calcularGraficaCategorias(response.data);
        this.cdr.detectChanges();
      }
    });
  }

  calcularGraficaCategorias(data: ResumenMensual): void {
    const egresos = this.getEgresos(data);
    if (egresos.length === 0) { this.barChartOptions = {}; return; }

    const map = new Map<string, { necesario: number; noNecesario: number }>();
    for (const t of egresos) {
      if (!t.categoria) continue;
      const nombre = t.categoria.nombre;
      if (!map.has(nombre)) map.set(nombre, { necesario: 0, noNecesario: 0 });
      const entry = map.get(nombre)!;
      const esNecesario = t.necesario === true || t.necesario === 'Sí' || t.necesario === 'Si';
      if (esNecesario) entry.necesario += t.importe;
      else entry.noNecesario += t.importe;
    }

    const sorted = [...map.entries()]
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => (b.necesario + b.noNecesario) - (a.necesario + a.noNecesario));

    this.barChartOptions = {
      series: [
        { name: 'Necesario', data: sorted.map(c => Math.round(c.necesario * 100) / 100) },
        { name: 'No necesario', data: sorted.map(c => Math.round(c.noNecesario * 100) / 100) }
      ],
      chart: { type: 'bar', height: Math.max(220, sorted.length * 48 + 70), stacked: true, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 3 } },
      xaxis: {
        categories: sorted.map(c => c.nombre),
        labels: { formatter: (v: string) => `$${Number(v).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` }
      },
      yaxis: { labels: { style: { fontSize: '12px', colors: ['#6b7280'] } } },
      colors: ['#60a5fa', '#94a3b8'],
      dataLabels: { enabled: false },
      legend: { position: 'top', horizontalAlign: 'left', fontSize: '12px', offsetY: 4 },
      tooltip: { y: { formatter: (v: number) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` } },
      grid: { borderColor: '#f1f1f1', xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } }
    };
  }

  anteriorMesGrafica(): void {
    if (this.mesGrafica === 1) { this.mesGrafica = 12; this.anioGrafica--; } else this.mesGrafica--;
    this.cargarResumen();
  }

  siguienteMesGrafica(): void {
    if (this.mesGrafica === 12) { this.mesGrafica = 1; this.anioGrafica++; } else this.mesGrafica++;
    this.cargarResumen();
  }

  // ── Annual chart ─────────────────────────────────────────────────────────────

  cargarResumenAnual(): void {
    this.cargandoAnual = true;
    this.anualChartOptions = {};
    const requests = Array.from({ length: 12 }, (_, i) =>
      this.resumenService.getResumenMensual(i + 1, this.anioAnual)
    );
    forkJoin(requests).subscribe(results => {
      this.cargandoAnual = false;
      const ingresos: number[] = [];
      const egresos: number[] = [];
      for (const res of results) {
        if (res.coderr === '0000') {
          const a = this.calcularAnalisis(res.data);
          ingresos.push(a.ingresos);
          egresos.push(a.egresos);
        } else {
          ingresos.push(0);
          egresos.push(0);
        }
      }
      const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      this.anualChartOptions = {
        series: [
          { name: 'Ingresos', data: ingresos },
          { name: 'Egresos', data: egresos }
        ],
        chart: { type: 'bar', height: 280, toolbar: { show: false }, zoom: { enabled: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 3 } },
        xaxis: { categories: mesesNombres, labels: { style: { fontSize: '11px' } } },
        yaxis: { labels: { formatter: (v: number) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` } },
        colors: ['#3b82f6', '#cbd5e1'],
        dataLabels: { enabled: false },
        legend: { position: 'top', horizontalAlign: 'left', fontSize: '12px', offsetY: 4 },
        tooltip: { y: { formatter: (v: number) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` } },
        grid: { borderColor: '#f1f1f1' }
      };
      this.cdr.detectChanges();
    });
  }

  anteriorAnioAnual(): void { this.anioAnual--; this.cargarResumenAnual(); }
  siguienteAnioAnual(): void { this.anioAnual++; this.cargarResumenAnual(); }

  // ── MSI mes actual ───────────────────────────────────────────────────────────

  get msisMesActual(): Array<{ msi: MsiModel; mensualidad: number; tarjeta: string; pago: number }> {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.msis
      .filter(msi => {
        const [y, m] = msi.fecha.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m - 1 + msi.meses - 1, 1);
        return currentMonth >= start && currentMonth <= end;
      })
      .map(msi => {
        const [y, m] = msi.fecha.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const diff = (currentMonth.getFullYear() - start.getFullYear()) * 12 + (currentMonth.getMonth() - start.getMonth());
        return {
          msi, mensualidad: diff + 1,
          tarjeta: this.tarjetas.find(t => t.id === msi.tarjetaId)?.nombre ?? '—',
          pago: Math.round((msi.importe / msi.meses) * 100) / 100
        };
      });
  }

  // ── Shared helpers ───────────────────────────────────────────────────────────

  private getEgresos(data: ResumenMensual): ResumenTransaccion[] {
    return [
      ...data.cuentas.flatMap(c => c.transacciones),
      ...data.tarjetas.flatMap(t => t.transacciones)
    ].filter(t => t.tipo === 'Egreso');
  }

  getNombreCuentaOTarjeta(t: TransaccionRecurrenteModel): string {
    if (t.cuentaId) return this.cuentas.find(c => c.id === t.cuentaId)?.nombre ?? '—';
    if (t.tarjetaId) return this.tarjetas.find(c => c.id === t.tarjetaId)?.nombre ?? '—';
    return '—';
  }

  getInitials(t: TransaccionRecurrenteModel): string {
    const word = t.concepto.split(' ')[0];
    return word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase();
  }

  getAvatarClass(t: TransaccionRecurrenteModel): string {
    const classes = [
      'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
      'bg-red-100 text-red-700', 'bg-green-100 text-green-700',
      'bg-amber-100 text-amber-700', 'bg-indigo-100 text-indigo-700',
      'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700',
    ];
    const hash = t.concepto.charCodeAt(0) + (t.concepto.charCodeAt(1) || 0);
    return classes[hash % classes.length];
  }
}
