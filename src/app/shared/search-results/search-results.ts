import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface SearchResultItem {
  id: string;
  label: string;
  sublabel: string;
  type: 'cuenta' | 'tarjeta' | 'transaccion' | 'categoria';
}

export interface SearchGroup {
  cuentas: SearchResultItem[];
  tarjetas: SearchResultItem[];
  transacciones: SearchResultItem[];
  categorias: SearchResultItem[];
  totalCuentas: number;
  totalTarjetas: number;
  totalTransacciones: number;
  totalCategorias: number;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css'
})
export class SearchResults {
  @Input() results!: SearchGroup;
  @Input() query: string = '';
  @Output() resultSelected = new EventEmitter<SearchResultItem>();
  @Output() verTodos = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  get hasResults(): boolean {
    return (
      this.results.cuentas.length > 0 ||
      this.results.tarjetas.length > 0 ||
      this.results.transacciones.length > 0 ||
      this.results.categorias.length > 0
    );
  }

  select(item: SearchResultItem): void {
    this.resultSelected.emit(item);
    this.closed.emit();
  }

  seeAll(type: string): void {
    this.verTodos.emit(type);
    this.closed.emit();
  }
}
