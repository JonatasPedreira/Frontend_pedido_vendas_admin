import { api } from "./api";

export interface Order {
    VEN_NUMERO: number;
    SIT_CODIGO: number;
    VEN_NUMSITE: string;
    LOJ_CODIGO: number;
    FUN_CODIGO: number;
    FUN_NOME: string;
    USU_CODIGO: number;
    USU_APELIDO: string;
    VEN_TIPO: string;
    VEN_DATA: string;
    VEN_HORA: string;
    FP1_CODIGO: number;
    FPG_DESCRICAO: string;
    PP1_CODIGO: number;
    PLP_DESCRICAO: string;
    VEN_TOTALLIQUIDO: number;
    CLI_CODIGO: number;
    CLI_NOME: string;
}

export interface CreateOrderPayload {
    id: number;
    client_id: number;
    provider_id: number;
    employee_id: number;
    user_id: number;
    store_id: number;
    price_table_id: number;
    date: string;
    hour: string;
    taxes: number;
    discount: number;
    store_note: string;
    payment_method_rate: number;
    installment: number;
    payment_method: string;
    payment_plan_code: number;
    payment_date: string;
    interest: number;
    has_payment: boolean;
    has_invoice: boolean;
    products_sold: { product_id: number; quantity: number; variant_id: number }[];
}
export interface OrdersResponse {
    pedidos: Order[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
}

export async function getOrders(
    page: number = 1,
    perPage: number = 100
): Promise<OrdersResponse> {
    const response = await api.get<Order[]>("/api/v1/orders", {
        params: {
            page,
        },
        headers: {
            "X-Request-Count": "true",
        },
    });

    return {
        pedidos: response.data,
        totalCount: Number(response.headers["x-total-count"] ?? 0),
        totalPages: Number(response.headers["x-total-pages"] ?? 1),
        currentPage: Number(
            response.headers["x-current-page"] ?? page
        ),
        perPage: Number(
            response.headers["x-per-page"] ?? perPage
        ),
    };
}

export async function createOrder(payload: CreateOrderPayload) {
    const { data } = await api.post("/api/v1/orders", payload);
    return data;
}