export class Transferencia {
  id: string = '';
  fecha: string = '';
  importe: number = 0;
  cuentaOrigenId: string = '';
  cuentaDestinoId: string = '';
  tipoCuentaDestino: String = 'Cuenta'; // 'Cuenta' o 'Tarjeta'
  concepto: string = '';

    limpiar() {
        this.id = '';
        this.fecha = '';
        this.importe = 0;
        this.cuentaOrigenId = '';
        this.cuentaDestinoId = '';
        this.tipoCuentaDestino = 'Cuenta';
        this.concepto = '';
    }

    getImporte(): string {
        return this.importe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    setImporte(importe: string) {
        this.importe = parseFloat(importe.replace(/,/g, ''));
    }

}