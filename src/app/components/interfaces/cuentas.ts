 export interface Cuenta {
    id: string;
    nombre: string;
    descripcion: string;
    institucion: string;
    saldo: number;
    inversion: boolean;
    tasa: number;
    periodicidad: string;
}

export interface ListaCuentasResponse{
    coderr: string;
    message: string;
    cuentas: Cuenta[];
    saldoPagar: number;
    saldoRestante: number;
    saldoTotal: number;   
}

