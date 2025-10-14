import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerticalDots } from '../icons/vertical-dots/vertical-dots';
import { PencilIcon } from '../icons/pencil-icon/pencil-icon';
import { TrashIcon } from '../icons/trash-icon/trash-icon';
import { Checks } from '../icons/checks/checks';


@Component({
  selector: 'app-options-menu',
  imports: [CommonModule, FormsModule, VerticalDots, PencilIcon, TrashIcon, Checks],
  templateUrl: './options-menu.html',
  styleUrl: './options-menu.css'
})
export class OptionsMenu {

  @Output() editar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();
  @Output() activar = new EventEmitter<void>();

  @Input() eliminarEnabled: boolean = true;
  @Input() activarLabel: string = "Activar";

  showMenu: boolean = false;

  tooggleMenu() {
    this.showMenu = !this.showMenu;
  }

  editarClick(){
    this.showMenu = false;
    this.editar.emit();
  }

  eliminarClick(){
    this.showMenu = false;
    this.eliminar.emit();
  }

  activarClick(){
    this.showMenu = false;
    this.activar.emit();
  }

}
