export class Transaccion {
  id: string = '';
  tipo: string = '';
  fecha: string = '';
  importe: number = 0;
  catIngresoId: string = '';
  catEgresoId: string = '';
  cuentaId: string = '';
  tarjetaId: string = '';
  descripcion: string = '';
  concepto: string = '';
  necesario: string = '';
  transferencia: boolean = false;

    limpiar() {
        this.id = '';
        this.tipo = '';
        this.fecha = '';
        this.importe = 0;
        this.catIngresoId = '';
        this.catEgresoId = '';
        this.cuentaId = '';
        this.tarjetaId = '';
        this.descripcion = '';
        this.concepto = '';
        this.necesario = '';
        this.transferencia = false;
    }

    getImporte(): string {
        return this.importe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    setImporte(importe: string) {
        this.importe = parseFloat(importe.replace(/,/g, ''));
    }

}   