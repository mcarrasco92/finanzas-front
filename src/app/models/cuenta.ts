export class Cuenta {
  id: string = '';
  nombre: string = '';
  descripcion: string = '';
  institucion: string = '';
  saldo: number = 0;
  inversion: boolean = false;
  vista: boolean = false;
  orden: number = 0;
  activa: boolean = true;
  transacciones: boolean = false;


    limpiar() {
        this.id = '';
        this.nombre = '';
        this.descripcion = '';
        this.institucion = '';
        this.saldo = 0;
        this.inversion = false;
        this.vista = false;
        this.orden = 0;
        this.activa = true;
        this.transacciones = false;
    }

    setSaldo(saldo: string) {
        this.saldo = parseFloat(saldo.replace(/,/g, ''));
    }

    getSaldo(): string {
        return this.saldo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

}