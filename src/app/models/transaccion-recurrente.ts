export class TransaccionRecurrenteModel {
  id: string = '';
  fecha: string = '';
  dia: string = '';
  importe: number = 0;
  catEgresoId: string = '';
  catIngresoId: string = '';
  tarjetaId: string = '';
  cuentaId: string = '';
  concepto: string = '';
  descripcion: string = '';
  periodicidad: string = '';
  tipo: string = ''; // 'Ingreso' o 'Egreso'

  limpiar() {
    this.id = '';
    this.fecha = '';
    this.dia = '';
    this.importe = 0;
    this.catEgresoId = '';
    this.catIngresoId = '';
    this.tarjetaId = '';
    this.cuentaId = '';
    this.concepto = '';
    this.descripcion = '';
    this.periodicidad = '';
  }

  getImporte(): string {
    return this.importe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  setImporte(importe: string) {
    this.importe = parseFloat(importe.replace(/,/g, ''));
  }
}
