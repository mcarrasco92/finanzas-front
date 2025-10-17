import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../shared/toast/toast';
import { MsiService } from '../../services/msi/msi';
import { ToastService, TypeToast } from '../../shared/toast/service/toast-service';
import { MsiModel } from '../../models/msi';
import { Subscription } from 'rxjs';
import { Tarjeta } from '../../models/tarjeta';
import { TarjetasService } from '../../services/tarjetas/tarjetas';
import { GeneralService } from '../../services/general-service';



@Component({
  selector: 'app-msi',
  imports: [CommonModule, FormsModule, Toast],
  templateUrl: './msi.html',
  styleUrl: './msi.css'
})
export class Msi {
  constructor(
    private toast: ToastService,
    private msiService: MsiService,
    private cdr: ChangeDetectorRef,
    private tarjetasService: TarjetasService,
    private generalService: GeneralService
  ) { 

  }
  msis: MsiModel[] = [];
  tarejtas: Tarjeta[] = [];

  tarejtasSuscription: Subscription | null = null;
  generalSubscription: Subscription | null = null;

  ngOnInit(): void {

    this.tarejtasSuscription = this.tarjetasService.tarjetasList$.subscribe(tarjetas => {
      this.tarejtas = tarjetas;
      this.cdr.detectChanges();
    });

    this.consultaMsis();


    this.generalSubscription = this.generalService.actualizaPantalla$.subscribe(actualiza => {
      actualiza ? this.consultaMsis() : null;
    })
  }

  consultaMsis(){
    this.msiService.getMsi().subscribe(response =>{
      if(response.coderr === "0000"){
        this.msis = response.data;
        this.cdr.detectChanges();
      }else{
        this.toast.show("Ocurrio un error al consultar MSI",'', response.message);
      } 
    });
  }

  ngOnDestroy(): void {
    this.tarejtasSuscription?.unsubscribe();
    this.generalSubscription?.unsubscribe();
  }



  abrirMsiModal() {
    this.msiService.setMsi('0'); // Reiniciar el MSI seleccionado
  }

  consultaMsi(msiId: string) {
    this.msiService.setMsi(msiId);
  }

  consultaTarjeta(tarjetaId: string) {
    return this.tarejtas.find(t => t.id === tarjetaId)?.nombre || '';
  }
}
