import { Component, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { combineLatest, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, take } from 'rxjs/operators';
import { Auth } from '../../services/auth';
import { ItemMenu } from '../../shared/item-menu/item-menu';
import { Transacciones } from '../transacciones/transacciones';
import { CategoriasService } from '../../services/categorias/categorias';
import { CuentasService } from '../../services/cuentas/cuentas';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { TransaccionesService } from '../../services/transacciones/transacciones';
import { CategoriasModal } from '../categorias-modal/categorias-modal';
import { GeneralService } from '../../services/general-service';
import { ToastService } from '../../shared/toast/service/toast-service';
import { PerfilService } from '../../services/perfil/perfil-service';
import { Perfil } from '../../models/perfil';
import { Transferencias } from '../transferencias/transferencias';
import { TransferenciasService } from '../../services/transferencias/transferencias';
import { PagoTarjeta } from '../pago-tarjeta/pago-tarjeta';
import { ArrowLeft } from '../../shared/icons/arrow-left/arrow-left';
import { ArrowRight } from '../../shared/icons/arrow-right/arrow-right';
import { ArrowLeftRight } from '../../shared/icons/arrow-left-right/arrow-left-right';
import { Tag } from '../../shared/icons/tag/tag';
import { MsiModal } from '../msi-modal/msi-modal';
import { MsiService } from '../../services/msi/msi';
import { SearchResults, SearchGroup, SearchResultItem } from '../../shared/search-results/search-results';
import { SpaceService } from '../../services/space/space.service';
import { Space } from '../../models/space';
import { Transaccion } from '../../models/transaccion';
import { ResumenService } from '../../services/resumen/resumen';

const SEARCH_LIMIT = 5;

const EMPTY_SEARCH: SearchGroup = {
  cuentas: [], tarjetas: [], transacciones: [], categorias: [],
  totalCuentas: 0, totalTarjetas: 0, totalTransacciones: 0, totalCategorias: 0
};

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterOutlet, CommonModule, ItemMenu, Transacciones, FormsModule, ReactiveFormsModule,
    CategoriasModal, Transferencias, PagoTarjeta, ArrowLeft, ArrowRight, ArrowLeftRight,
    Tag, MsiModal, SearchResults
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  constructor(
    public authService: Auth,
    private router: Router,
    private categoriasService: CategoriasService,
    private cuentasServices: CuentasService,
    private tarjetasService: TarjetasService,
    private transaccionService: TransaccionesService,
    private generalService: GeneralService,
    private perfilService: PerfilService,
    private transferenciaService: TransferenciasService,
    private msiService: MsiService,
    private toastService: ToastService,
    private spaceService: SpaceService,
    private resumenService: ResumenService,
    private cdr: ChangeDetectorRef
  ) {}

  @ViewChild('searchWrapper') searchWrapper!: ElementRef;
  @ViewChild('perfilWrapper') perfilWrapper!: ElementRef;
  @ViewChild('menuWrapper') menuWrapper!: ElementRef;
  @ViewChild('spaceWrapper') spaceWrapper!: ElementRef;

  perfil: Perfil = new Perfil();

  openPerfil = false;
  mostrarTransaccionesModal: boolean = false;
  mostrarCategoriasModal: boolean = false;
  mostrarTransferenciasModal: boolean = false;
  mostrarPagoTarjetaModal: boolean = false;
  mostrarMsiModal: boolean = false;

  searchControl = new FormControl('');
  showSearch = false;
  searchResults: SearchGroup = { ...EMPTY_SEARCH };

  cuentasSuscription: Subscription | null = null;
  tarjetasSuscription: Subscription | null = null;
  categoriasSuscription: Subscription | null = null;
  cargaTransaccionSuscription: Subscription | null = null;
  cargaTransferenciaSuscription: Subscription | null = null;
  categoriasModalSuscription: Subscription | null = null;
  msiModalSuscription: Subscription | null = null;
  searchSubscription: Subscription | null = null;
  transaccionesSearchSub: Subscription | null = null;

  tipoTransaccion: string = '';
  tabActivo: string = 'Dashboard';
  rutaActual: string = '';
  menuAbierto: boolean = false;

  activeSpace: Space | null = null;
  spaces: Space[] = [];
  spaceSwitcherAbierto: boolean = false;
  private spaceSub: Subscription | null = null;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showSearch) {
      this.showSearch = false;
      this.searchControl.setValue('');
      this.cdr.detectChanges();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.searchWrapper && !this.searchWrapper.nativeElement.contains(event.target as Node)) {
      if (this.showSearch) {
        this.showSearch = false;
        this.cdr.detectChanges();
      }
    }
    if (this.perfilWrapper && !this.perfilWrapper.nativeElement.contains(event.target as Node)) {
      if (this.openPerfil) {
        this.openPerfil = false;
        this.cdr.detectChanges();
      }
    }
    if (this.menuWrapper && !this.menuWrapper.nativeElement.contains(event.target as Node)) {
      if (this.menuAbierto) {
        this.menuAbierto = false;
        this.cdr.detectChanges();
      }
    }
    if (this.spaceWrapper && !this.spaceWrapper.nativeElement.contains(event.target as Node)) {
      if (this.spaceSwitcherAbierto) {
        this.spaceSwitcherAbierto = false;
        this.cdr.detectChanges();
      }
    }
  }

  ngOnInit() {
    this.categoriasSuscription = this.categoriasService.getCategorias().subscribe();
    this.cuentasSuscription = this.cuentasServices.getCuentas().subscribe();
    this.tarjetasSuscription = this.tarjetasService.getTarjetas().subscribe();

    this.spaceService.getSpaces().subscribe(response => {
      if (response.coderr === '0000') {
        this.spaces = response.data;
        this.cdr.detectChanges();
      }
    });
    this.spaceSub = this.spaceService.activeSpace$.subscribe(space => {
      this.activeSpace = space;
      this.cdr.detectChanges();
    });

    this.perfilService.getInfoPerfil().subscribe(response => {
      if (response.coderr === '0000') {
        this.perfil = response.data;
        this.cdr.detectChanges();
      }
    });

    // Pre-cargar transacciones del último año para búsqueda
    this.transaccionesSearchSub = this.transaccionService
      .getTransaccionesParaBusqueda()
      .subscribe(response => {
        if (response.coderr === '0000') {
          this.transaccionService.setTransaccionesList(response.data ?? []);
        }
      });

    // Lógica de búsqueda reactiva
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        const q = (query ?? '').trim().toLowerCase();
        if (!q) return of(null);
        return combineLatest([
          this.cuentasServices.cuentasList$,
          this.tarjetasService.tarjetasList$,
          this.categoriasService.categoriasIngresos$,
          this.categoriasService.categoriasEgresos$,
          this.transaccionService.transaccionesList$
        ]).pipe(take(1));
      })
    ).subscribe(data => {
      if (!data) {
        this.showSearch = false;
        this.searchResults = { ...EMPTY_SEARCH };
        this.cdr.detectChanges();
        return;
      }

      const q = (this.searchControl.value ?? '').trim().toLowerCase();
      const [cuentas, tarjetas, ingresos, egresos, transacciones] = data;

      const matchCuentas = cuentas.filter(c =>
        [c.nombre, c.descripcion, c.institucion].some(f => f.toLowerCase().includes(q))
      );
      const matchTarjetas = tarjetas.filter(t =>
        [t.nombre, t.descripcion, t.institucion].some(f => f.toLowerCase().includes(q))
      );
      const matchCategorias = [...ingresos, ...egresos].filter(cat =>
        cat.nombre.toLowerCase().includes(q)
      );
      const matchTransacciones = transacciones.filter(t =>
        [t.concepto, t.descripcion].some(f => f.toLowerCase().includes(q)) ||
        t.importe.toString().includes(q)
      );

      this.searchResults = {
        cuentas: matchCuentas.slice(0, SEARCH_LIMIT).map(c => ({
          id: c.id, label: c.nombre, sublabel: c.institucion, type: 'cuenta' as const
        })),
        tarjetas: matchTarjetas.slice(0, SEARCH_LIMIT).map(t => ({
          id: t.id, label: t.nombre, sublabel: t.institucion, type: 'tarjeta' as const
        })),
        categorias: matchCategorias.slice(0, SEARCH_LIMIT).map(cat => ({
          id: cat.id, label: cat.nombre, sublabel: cat.tipo, type: 'categoria' as const
        })),
        transacciones: matchTransacciones.slice(0, SEARCH_LIMIT).map(t => ({
          id: t.id,
          label: t.concepto || t.descripcion || 'Movimiento',
          sublabel: `$${t.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })} · ${t.fecha}`,
          type: 'transaccion' as const
        })),
        totalCuentas: matchCuentas.length,
        totalTarjetas: matchTarjetas.length,
        totalCategorias: matchCategorias.length,
        totalTransacciones: matchTransacciones.length
      };

      this.showSearch = true;
      this.cdr.detectChanges();
    });

    this.cargaTransaccionSuscription = this.transaccionService.transaccion$.subscribe(transaccion => {
      if (transaccion && transaccion.id) {
        this.tipoTransaccion = transaccion.tipo;
        this.mostrarTransaccionesModal = true;
        this.menuAbierto = false;
        this.cdr.detectChanges();
      }
    });

    this.cargaTransferenciaSuscription = this.transferenciaService.transferenciaId$.subscribe(transferencia => {
      if (transferencia && transferencia !== '') {
        this.mostrarTransferenciasModal = true;
        this.menuAbierto = false;
        this.cdr.detectChanges();
      }
    });

    this.cargaTransferenciaSuscription = this.transferenciaService.transferencia$.subscribe(transferencia => {
      if (transferencia.tipoCuentaDestino == 'Tarjeta') {
        this.mostrarPagoTarjetaModal = true;
        this.menuAbierto = false;
        this.cdr.detectChanges();
      }
    });

    this.categoriasModalSuscription = this.categoriasService.abrirCategoriasModal$.subscribe(abrir => {
      if (abrir) {
        this.mostrarCategoriasModal = true;
      }
    });

    this.msiModalSuscription = this.msiService.msi$.subscribe(msiId => {
      if (msiId && msiId !== '') {
        this.mostrarMsiModal = true;
      }
    });

    this.tabActivo = this.resolveTab(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.tabActivo = this.resolveTab(event.urlAfterRedirects);
        this.toastService.clear();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.cuentasSuscription?.unsubscribe();
    this.tarjetasSuscription?.unsubscribe();
    this.categoriasSuscription?.unsubscribe();
    this.cargaTransaccionSuscription?.unsubscribe();
    this.categoriasModalSuscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
    this.transaccionesSearchSub?.unsubscribe();
    this.spaceSub?.unsubscribe();
  }

  onSearchFocus(): void {
    if (this.searchControl.value?.trim()) {
      this.showSearch = true;
      this.cdr.detectChanges();
    }
  }

  onSearchResultSelected(item: SearchResultItem): void {
    this.showSearch = false;
    this.searchControl.setValue('');
    switch (item.type) {
      case 'cuenta':
        this.router.navigate(['/dashboard/cuentas/debitof', item.id]);
        break;
      case 'tarjeta':
        this.router.navigate(['/dashboard/cuentas/tdcf', item.id]);
        break;
      case 'categoria':
        this.router.navigate(['/dashboard/categorias']);
        break;
      case 'transaccion':
        this.transaccionService.getTransaccionById(item.id).subscribe(response => {
          if (response.coderr !== '0000') return;
          const trans = Object.assign(new Transaccion(), response.data);
          this.transaccionService.setTransaccion(trans);
        });
        break;
    }
  }

  onVerTodos(type: string): void {
    this.showSearch = false;
    this.searchControl.setValue('');
    switch (type) {
      case 'cuentas':
        this.router.navigate(['/dashboard/cuentas/debito']);
        break;
      case 'tarjetas':
        this.router.navigate(['/dashboard/cuentas/tdc']);
        break;
      case 'categorias':
        this.router.navigate(['/dashboard/categorias']);
        break;
      case 'transacciones':
        this.router.navigate(['/dashboard/home']);
        break;
    }
  }

  resolveTab(url: string): string {
    if (url.includes('categorias')) return 'Categorías';
    if (url.includes('perfil')) return 'Perfil';
    if (url.includes('cuentas')) return 'Cuentas';
    if (url.includes('msi')) return 'Meses sin intereses';
    if (url.includes('transacciones-recurrentes')) return 'Mov. recurrentes';
    if (url.includes('movimientos')) return 'Movimientos';
    if (url.includes('home')) return 'Home';
    return '';
  }

  togglePerfil() {
    this.openPerfil = !this.openPerfil;
  }

  cerrarSesion() {
    this.openPerfil = false;
    this.authService.cerrarSesion();
    this.spaceService.clearActiveSpace();
    this.router.navigate(['/']);
  }

  toggleSpaceSwitcher(): void {
    this.spaceSwitcherAbierto = !this.spaceSwitcherAbierto;
  }

  cambiarEspacio(space: Space): void {
    this.spaceService.setActiveSpace(space);
    this.spaceSwitcherAbierto = false;
    this.resumenService.clearCache();
    // Recarga datos del espacio seleccionado
    this.categoriasService.getCategorias().subscribe();
    this.cuentasServices.getCuentas().subscribe();
    this.tarjetasService.getTarjetas().subscribe();
    this.router.navigate(['/dashboard/home']);
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  nuevoIngreso(): void {
    this.tipoTransaccion = 'Ingreso';
    this.mostrarTransaccionesModal = true;
    this.menuAbierto = false;
  }

  nuevoEgreso(): void {
    this.tipoTransaccion = 'Egreso';
    this.mostrarTransaccionesModal = true;
    this.menuAbierto = false;
  }

  nuevaCategoria(): void {
    this.categoriasService.setAbrirCategoriasModal(true);
    this.menuAbierto = false;
  }

  nuevaTransferencia(): void {
    this.mostrarTransferenciasModal = true;
    this.menuAbierto = false;
  }

  cerrarTransaccionesModal() {
    this.mostrarTransaccionesModal = false;
  }

  cerrarTransferenciasModal() {
    this.mostrarTransferenciasModal = false;
  }

  cerrarCategoriasModal() {
    this.mostrarCategoriasModal = false;
  }

  cerrarPagoTarjetaModal() {
    this.mostrarPagoTarjetaModal = false;
  }

  cerrarMsiModal() {
    this.mostrarMsiModal = false;
  }
}
