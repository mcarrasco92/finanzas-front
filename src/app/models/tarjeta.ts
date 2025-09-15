export class Tarjeta {
  id: string = '';
  nombre: string = '';
  descripcion: string = '';
  institucion: string = '';
  dcorte: string = '';
  dpago: string = '';
  orden: number = 0;
  activa: boolean = true;


    limpiar() {
        this.id = '';
        this.nombre = '';
        this.descripcion = '';
        this.institucion = '';
        this.dcorte = '';
        this.dpago = '';
        this.orden = 0;
        this.activa = true;
    }

}