import { Component, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css'
})
export class ConfirmModal {

  @Input() titulo: string = 'Confirmar acción';
  @Input() mensaje: string = '¿Estás seguro de que deseas continuar?';
  @Input() fondoOscuro: boolean = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
    
  }

  cerrarModal(): void {
    this.cerrar.emit();
    // Lógica para cerrar el modal
  }
  confirmarAccion(): void {
    this.confirmar.emit();
    // Lógica para confirmar la acción
  } 

}
