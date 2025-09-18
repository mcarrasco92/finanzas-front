import { Component ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Loading } from '../../../shared/loading/loading';
import { Toast } from '../../../shared/toast/toast';
import { DragIcon } from '../../../shared/icons/drag-icon/drag-icon';
import { ToastService , TypeToast } from '../../../shared/toast/service/toast-service';
import { Categoria } from '../../../models/categoria';
import { CategoriasService } from '../../../services/categorias/categorias';
import { CategoriasModal } from '../categorias-modal/categorias-modal';

@Component({
  selector: 'app-categorias',
  imports: [Loading, Toast, CommonModule, FormsModule, DragIcon, CategoriasModal],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias {

  isLoading: boolean = false;
  categoriasDesactivadas: boolean = false;
  mostrarCategoriasModal = false;


  constructor(private toast: ToastService, 
  private categoriasService: CategoriasService,
  private cdr: ChangeDetectorRef
  ) { }


  categoriasIngresos : Categoria[] = [];
  categoriasEgresos : Categoria[] = [];

  ngOnInit() {

    this.isLoading = true;

    this.consultaCategorias();

    this.categoriasService.recarga$.subscribe(recarga => {
      if (recarga) {
        this.consultaCategorias();
        this.categoriasService.setRecarga(false);
      }
    });
  }


  consultaCategorias(){

    this.categoriasService.getCategorias().subscribe(response => {

      if(response.coderr !== '0000') {
        this.toast.show('Error al consultar las categorias', response.message, TypeToast.danger);
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.categoriasIngresos = response.data.categoriasIngresos;
      this.categoriasEgresos = response.data.categoriasEgresos;

      this.categoriasIngresos.sort((a, b) => a.orden - b.orden);
      this.categoriasEgresos.sort((a, b) => a.orden - b.orden);



    }, error => {
      this.toast.show('Error al consultar las categorias', 'Error: ' + error.status, TypeToast.danger);
      this.isLoading = false;
      this.cdr.detectChanges();
    }, () => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }

    );
    
  }



  consultaCategoria(id: String) {
    this.categoriasService.setData(id);
    this.mostrarCategoriasModal = true;
    
  }
  
  ordenarCategoriasIngresos() {

    const categoriasOrdenadas: { id: string; orden: number }[] = [];

    this.categoriasIngresos.forEach((categoria, index) => {
      categoriasOrdenadas.push({
        id: categoria.id, // Asume que cada cuenta tiene un campo `id`
        orden: index + 1 // La posición en el arreglo original (1 basado)
      });

    })

    this.categoriasService.ordenaCategorias(categoriasOrdenadas).subscribe(response => {});

  }

  ordenarCategoriasEgresos() {

    const categoriasOrdenadas: { id: string; orden: number }[] = [];

    this.categoriasEgresos.forEach((categoria, index) => {
      categoriasOrdenadas.push({
        id: categoria.id, // Asume que cada cuenta tiene un campo `id`
        orden: index + 1 // La posición en el arreglo original (1 basado)
      });

    })

    this.categoriasService.ordenaCategorias(categoriasOrdenadas).subscribe(response => {});

  }

  abrirCategoriasModal(): void {
    this.mostrarCategoriasModal = true; // Muestra el modal
  }

  cerrarCategoriasModal(): void {
    this.mostrarCategoriasModal = false; // Oculta el modal
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

  onDropIngresos(event: DragEvent, targetIndex: number): void {
    event.preventDefault();

    if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
      // Reordenar el array
      const draggedItem = this.categoriasIngresos[this.draggedIndex];
      this.categoriasIngresos.splice(this.draggedIndex, 1); // Eliminar el elemento arrastrado
      this.categoriasIngresos.splice(targetIndex, 0, draggedItem); // Insertar en la nueva posición
    }

    this.ordenarCategoriasIngresos();

    this.draggedIndex = null; // Reiniciar el índice arrastrado
  }

  onDropEgresos(event: DragEvent, targetIndex: number): void {
    event.preventDefault();

    if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
      // Reordenar el array
      const draggedItem = this.categoriasEgresos[this.draggedIndex];
      this.categoriasEgresos.splice(this.draggedIndex, 1); // Eliminar el elemento arrastrado
      this.categoriasEgresos.splice(targetIndex, 0, draggedItem); // Insertar en la nueva posición
    }

    this.ordenarCategoriasEgresos();

    this.draggedIndex = null; // Reiniciar el índice arrastrado
  }


  onMouseDown(): void {
    this.isDraggable = true;
  }
  
  onMouseUp(): void {
    this.isDraggable = false;
  }

  ngDestroy() {
    this.isLoading = false;
    this.toast.clear();
    
  }

}
