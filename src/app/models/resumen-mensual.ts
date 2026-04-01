export interface ResumenCategoria {
  id: string;
  nombre: string;
  tipo: string;
}

export interface ResumenTransaccion {
  id: string;
  tipo: string;
  importe: number;
  concepto: string;
  descripcion: string;
  necesario: boolean | string;
  fecha: string;
  msiId: string | null;
  categoria: ResumenCategoria | null;
}

export interface ResumenCuenta {
  id: string;
  nombre: string;
  transacciones: ResumenTransaccion[];
}

export interface ResumenTarjeta {
  id: string;
  nombre: string;
  transacciones: ResumenTransaccion[];
}

export interface ResumenMensual {
  mes: number;
  anio: number;
  cuentas: ResumenCuenta[];
  tarjetas: ResumenTarjeta[];
}
