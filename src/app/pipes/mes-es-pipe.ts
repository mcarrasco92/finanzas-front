import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mesEs'
})
export class MesEsPipe implements PipeTransform {

  transform(fecha: any): unknown {
    let fechaStr = fecha.toString().toLowerCase();
    let anio = fechaStr.split(' ')[1]; // Obtiene el año
    fechaStr = fechaStr.split(' ')[0]; // Obtiene solo el nombre del mes en inglés
    
    let fechaEsp = '';

    switch (fechaStr) {
      case 'january':
        return 'Enero' + ' ' + anio;
      case 'february':
        return 'Febrero' + ' ' + anio;
      case 'march':
        return'Marzo' + ' ' + anio;
      case 'april':
        return'Abril' + ' ' + anio;
      case 'may':
        return 'Mayo' + ' ' + anio;
      case 'june':
        return 'Junio' + ' ' + anio;
      case 'july':
        return'Julio' + ' ' + anio;
      case 'august':
        return 'Agosto' + ' ' + anio;
      case 'september':
        return 'Septiembre' + ' ' + anio;
      case 'october':
        return 'Octubre' + ' ' + anio;
      case 'november':
        return 'Noviembre' + ' ' + anio;
      case 'december':
        return 'Diciembre' + ' ' + anio;
      default:
        return fecha;
    }

  }



}
