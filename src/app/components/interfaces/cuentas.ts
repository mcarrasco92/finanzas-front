 export interface Cuenta {
    id: string;
    nombre: string;
    descripcion: string;
    institucion: string;
    saldo: number;
    inversion: boolean;
    vista: boolean;
    orden: number;
    activa: boolean;
}

export interface ListaCuentasResponse{
    coderr: string;
    message: string;
    cuentas: Cuenta[];
    saldoDisponible: number;
    saldoInvertido: number;
    saldoTotal: number;   
}

