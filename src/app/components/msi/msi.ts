import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../shared/toast/toast';
import { MsiService } from '../../services/msi/msi';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { MsiModel } from '../../models/msi';
import { Subscription } from 'rxjs';
import { MsiModal } from '../msi-modal/msi-modal';



@Component({
  selector: 'app-msi',
  imports: [CommonModule, FormsModule, Toast, MsiModal],
  templateUrl: './msi.html',
  styleUrl: './msi.css'
})
export class Msi {
  constructor() { 

  }

  msiModal: boolean = false;

  abrirMsiModal() {
    this.msiModal = true;
  }
}
