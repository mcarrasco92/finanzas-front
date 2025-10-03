export class Tarjeta {
  id: string = '';
  nombre: string = '';
  descripcion: string = '';
  institucion: string = '';
  saldo: number = 0;
  dcorte: string = '';
  dpago: string = '';
  orden: number = 0;
  activa: boolean = true;
  transacciones: boolean = false;


    limpiar() {
        this.id = '';
        this.nombre = '';
        this.descripcion = '';
        this.institucion = '';
        this.saldo = 0;
        this.dcorte = '';
        this.dpago = '';
        this.orden = 0;
        this.activa = true;
        this.transacciones = false;
    }

}