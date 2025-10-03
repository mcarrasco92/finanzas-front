import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { CategoriasService } from '../../../services/categorias/categorias';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../../shared/toast/toast';
import { ToastService, TypeToast } from '../../../shared/toast/service/toast-service';
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-categorias-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias-modal.html',
  styleUrl: './categorias-modal.css'
})
export class CategoriasModal {

  @Output() cerrar = new EventEmitter<void>();

  editar: boolean = false;
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
        
        this.categoriasService.getCategoriaById(id).subscribe(response => {
          

          if (response.coderr !== '0000') {
            this.toast.show('Error al consultar la categoria', response.message, TypeToast.danger);
            this.cdr.detectChanges();
            return;
          }

          this.categoria = Object.assign(new Categoria(), response.data);
          this.categoriaOriginal = Object.assign(new Categoria(), response.data);

          this.cdr.detectChanges();
        }, error => {
          
          this.toast.show('Error al consultar la categoria', error.error.message, TypeToast.danger);
          this.cdr.detectChanges();
        });
      } else {
        this.categoria = new Categoria();
        this.editar = true;
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
  
        
  
        this.categoriasService.updateCategoria(this.categoria.id, {
          nombre: this.categoria.nombre,
          tipo: this.categoria.tipo,
  
        }).subscribe(response => {
  
          
  
          if(response.coderr !== "0000"){
            this.toast.show('Error al actualizar la categoria', response.message, TypeToast.danger);
            this.cdr.detectChanges();
            return; 
          }
  
          this.toast.show('Categoria actualizada exitosamente', "", TypeToast.success);
  
          
  
          if (response.data && response.data.id) {
  
            this.categoria = Object.assign(new Categoria(), response.data);
            this.categoriaOriginal = Object.assign(new Categoria(), response.data);
  
            this.cdr.detectChanges();
          }
  
        }, error => {
          
          this.toast.show('Error al actualizar la categoria', error.error.message, TypeToast.danger);
        });
  
      } else {
  
        //Nueva categoria
  
        
  
        this.categoriasService.addCategoria(this.categoria).subscribe(response => {
  
          
  
          if(response.coderr !== "0000"){
            this.toast.show('Error al registrar la categoria', response.message, TypeToast.danger);
            this.cdr.detectChanges();
            return; 
          }
  
          this.toast.show('Categoria creada exitosamente', "", TypeToast.success);
  
          
  
          if (response.data && response.data.id) {
  
            this.categoria = Object.assign(new Categoria(), response.data);
            this.categoriaOriginal = Object.assign(new Categoria(), response.data);
  
            this.cdr.detectChanges();
          }
  
        }, error => {
          
          this.toast.show('Error al crear la categoria', error.error.message, TypeToast.danger);
        });
      }

      this.cerrarModal();
  
    }

    activaDesactivaCategoria(): void {
      if (!this.categoria.id) {
        return;
      }
  
      
  
      this.categoriasService.activaDesactivaCategoria(this.categoria.id, !this.categoria.activa).subscribe(response => {
  
        this.categoria.activa = response.data;
        this.categoriaOriginal.activa = response.data;
  
        this.cdr.detectChanges();
  
        this.toast.show(response.message, "", TypeToast.success);
  
        
      } , error => {
        
        this.toast.show('Error al actualizar la categoria', error.error.message, TypeToast.danger);
      });
    } 

  cerrarModal(): void {
    this.categoriasService.setData(null);
    this.cerrar.emit();
  }

}
