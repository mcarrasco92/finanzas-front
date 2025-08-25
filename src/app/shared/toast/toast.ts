import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { ToastService , typToast} from './service/toast-service';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-toast',
  imports: [NgbToast, CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {

  toasts: typToast[] = [];

  constructor(public toastService: ToastService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    this.toastService.toasts$.subscribe(toasts => {
      this.ngZone.run(() => {
        this.toasts = toasts;
      });
      this.cdr.markForCheck(); // Marca el componente para la detección de cambios
      
      //this.cdr.detectChanges(); // Fuerza la detección de cambios
    });
  }

}
