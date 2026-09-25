import { api } from "./api";

export interface Product {
    PRO_CODIGO: number;
    PRO_CODIGOBAR: string;
    PRO_DESCRICAO: string;
    MAR_CODIGO: number;
    MAR_DESCRICAO: string;
    GRU_CODIGO: number;
    GRU_DESCRICAO: string;
    EST_ATUAL: number;
    EST_APOIO: number;
    PRECO: number;
    PRECO2: number;
}

export async function getProducts(): Promise<Product[]> {
    const { data } = await api.get<Product[]>("/api/v1/products", {
        params: {
            pageSize: 50,
            storeId: 1,
        },
    });

    return data;
}