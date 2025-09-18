export class Categoria {
  id: string = '';
  nombre: string = '';
  tipo: string = '';
  orden: number = 0;
  activa: boolean = true;


    limpiar() {
        this.id = '';
        this.nombre = '';
        this.tipo = '';
        this.orden = 0;
        this.activa = true;
    }

}