import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mesEs'
})
export class MesEsPipe implements PipeTransform {

  transform(fecha: any): String | undefined {
    let fechaStr = fecha.toString().toLowerCase();
    let fechaEsp = '';

    if(fechaStr.includes('january')){
      fechaEsp = fechaStr.replace('january', 'Enero');
    }else if(fechaStr.includes('february')){
      fechaEsp = fechaStr.replace('february', 'Febrero');
    }else if(fechaStr.includes('march')){
      fechaEsp = fechaStr.replace('march', 'Marzo');
    }else if(fechaStr.includes('april')){
      fechaEsp = fechaStr.replace('april', 'Abril');
    }else if(fechaStr.includes('may')){
      fechaEsp = fechaStr.replace('may', 'Mayo');
    }else if(fechaStr.includes('june')){
      fechaEsp = fechaStr.replace('june', 'Junio');
    }else if(fechaStr.includes('july')){
      fechaEsp = fechaStr.replace('july', 'Julio');
    }else if(fechaStr.includes('august')){
      fechaEsp = fechaStr.replace('august', 'Agosto');
    }else if(fechaStr.includes('september')){
      fechaEsp = fechaStr.replace('september', 'Septiembre');
    }else if(fechaStr.includes('october')){
      fechaEsp = fechaStr.replace('october', 'Octubre');
    }else if(fechaStr.includes('november')){
      fechaEsp = fechaStr.replace('november', 'Noviembre');
    }else if(fechaStr.includes('december')){
      fechaEsp = fechaStr.replace('december', 'Diciembre');
    }else{
      return fecha;
    }

    return fechaEsp;

  }



}
