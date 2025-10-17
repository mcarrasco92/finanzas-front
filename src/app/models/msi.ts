export class MsiModel{
    id: string = '';
    fecha: string = '';
    importe: number = 0;
    catEgresoId: string = '';
    tarjetaId: string = '';
    concepto: string = '';
    descripcion: string = '';
    meses: number = 0;
    necesario: Boolean = false;
    msiId: string = '';

    limpiar() {
        this.id = '';
        this.fecha = '';
        this.importe = 0;
        this.catEgresoId = '';
        this.tarjetaId = '';
        this.concepto = '';
        this.descripcion = '';
        this.meses = 0;
        this.necesario = false;
        this.msiId = '';
    }

    getImporte(): string {
        return this.importe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    setImporte(importe: string) {
        this.importe = parseFloat(importe.replace(/,/g, ''));
    }
}