import { api } from "./api";

export interface PaymentMethod {
    FPG_CODIGO: number;
    FPG_DESCRICAO: string;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data } = await api.get<PaymentMethod[]>("/api/v1/payment-methods");
    return data;
}