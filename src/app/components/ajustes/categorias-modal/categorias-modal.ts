import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CategoriasService } from '../../../services/categorias/categorias';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../../shared/toast/toast';
import { ToastService, TypeToast } from '../../../shared/toast/service/toast-service';
import { Categoria } from '../../../models/categoria';
import { Loading } from '../../../shared/loading/loading';

@Component({
  selector: 'app-categorias-modal',
  imports: [CommonModule, FormsModule, Loading],
  templateUrl: './categorias-modal.html',
  styleUrl: './categorias-modal.css'
})
export class CategoriasModal {

  @Output() cerrar = new EventEmitter<void>();

  editar: boolean = false;

  isLoading = false;
  valNombre = false;
  valTipo = false;

  categoria: Categoria = new Categoria();
  categoriaOriginal: Categoria = new Categoria();

  constructor(private categoriasService: CategoriasService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef) { }


  ngOnInit() {

    this.categoriasService.data$.subscribe(id => {
      if (id) {
        this.isLoading = true;
        this.categoriasService.getCategoriaById(id).subscribe(response => {
          this.isLoading = false;

          if (response.coderr !== '0000') {
            this.toast.show('Error al consultar la categoria', response.message, TypeToast.danger);
            this.cdr.detectChanges();
            return;
          }

          this.categoria = Object.assign(new Categoria(), response.data);
          this.categoriaOriginal = Object.assign(new Categoria(), response.data);

          this.cdr.detectChanges();
        }, error => {
          this.isLoading = false;
          this.toast.show('Error al consultar la categoria', error.error.message, TypeToast.danger);
          this.cdr.detectChanges();
        });
      } else {
        this.categoria = new Categoria();
        this.cdr.detectChanges();
      }
    });

  }   

  cancelaEdicion(): void {
      this.categoria = Object.assign(new Categoria(), this.categoriaOriginal);
      this.editar = false;
    }
  
  enviaDatos(): void {
  
      this.valNombre = this.categoria.nombre.trim() === '';
      this.valTipo = this.categoria.tipo.trim() === '';
  
      if (this.valNombre || this.valTipo) {
        return;
      }

  
      if (this.categoria.id) {
        //Actualizar categoria
  
        this.isLoading = true;
  
        this.categoriasService.updateCategoria(this.categoria.id, {
          nombre: this.categoria.nombre,
          tipo: this.categoria.tipo,
  
        }).subscribe(response => {
  
          this.isLoading = false;
  
          if(response.coderr !== "0000"){
            this.toast.show('Error al actualizar la categoria', response.message, TypeToast.danger);
            this.cdr.detectChanges();
            return; 
          }

          this.categoriasService.setRecarga(true);
  
          this.toast.show('Categoria actualizada exitosamente', "", TypeToast.success);
  
          
  
          if (response.data && response.data.id) {
  
            this.categoria = Object.assign(new Categoria(), response.data);
            this.categoriaOriginal = Object.assign(new Categoria(), response.data);
  
            this.cdr.detectChanges();
          }
  
        }, error => {
          this.isLoading = false;
          this.toast.show('Error al actualizar la categoria', error.error.message, TypeToast.danger);
        });
  
      } else {
  
        //Nueva categoria
  
        this.isLoading = true;
  
        this.categoriasService.addCategoria(this.categoria).subscribe(response => {
  
          this.isLoading = false;
  
          if(response.coderr !== "0000"){
            this.toast.show('Error al registrar la categoria', response.message, TypeToast.danger);
            this.cdr.detectChanges();
            return; 
          }

          this.categoriasService.setRecarga(true);
  
          this.toast.show('Categoria creada exitosamente', "", TypeToast.success);
  
          
  
          if (response.data && response.data.id) {
  
            this.categoria = Object.assign(new Categoria(), response.data);
            this.categoriaOriginal = Object.assign(new Categoria(), response.data);
  
            this.cdr.detectChanges();
          }
  
        }, error => {
          this.isLoading = false;
          this.toast.show('Error al crear la categoria', error.error.message, TypeToast.danger);
        });
      }
  
    }

    activaDesactivaCategoria(): void {
      if (!this.categoria.id) {
        return;
      }
  
      this.isLoading = true;
  
      this.categoriasService.activaDesactivaCategoria(this.categoria.id, !this.categoria.activa).subscribe(response => {
  
        this.categoria.activa = response.data;
        this.categoriaOriginal.activa = response.data;

        this.categoriasService.setRecarga(true);
  
        this.cdr.detectChanges();
  
        this.toast.show('Categoria activada exitosamente', "", TypeToast.success);
  
        this.isLoading = false;
      } , error => {
        this.isLoading = false;
        this.toast.show('Error al actualizar la categoria', error.error.message, TypeToast.danger);
      });
    } 

  cerrarModal(): void {
    console.log('Cerrando modal');
    this.cerrar.emit();
  }

}
