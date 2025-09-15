export class TDC {
  id: string = '';
  nombre: string = '';
  descripcion: string = '';
  institucion: string = '';
  corte: string = '';
  pago: string = '';
  orden: number = 0;
  activa: boolean = true;


    limpiar() {
        this.id = '';
        this.nombre = '';
        this.descripcion = '';
        this.institucion = '';
        this.corte = '';
        this.pago = '';
        this.orden = 0;
        this.activa = true;
    }

}