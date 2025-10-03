import { Pipe, PipeTransform } from '@angular/core';
import { Transaccion } from '../models/transaccion';

@Pipe({
  name: 'filterTipoTransaccion'
})
export class FilterTipoTransaccionPipe implements PipeTransform {

  transform(transaccion : Transaccion[],  tipo : String): Transaccion[] {

    if(tipo === 'General'){
      return transaccion;
    } else {
      return transaccion.filter(t => t.tipo + 's' === tipo);
    } 
  }

}
