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

export interface OrderMetrics {
    totalOrders: number;
    billing: number;
    averageTicket: number;
    openOrders: number;
}
export interface OrderItem {
    PRO_CODIGO: number;
    PRO_DESCRICAO: string;
    PRO_PESO: number;
    IVD_PRECO: number;
    IVD_QTDE: number;
    IVD_TOTAL: number;
    IVD_DESCONTO: number;
    IVD_LIQUIDO: number;
    TRM_CODIGO: string;
    TRM_DESCRICAO: string;
    AMB_CODIGO: string;
    AMB_DESCRICAO: string;
    IVD_OPERACAO: string;
    IVD_ENTREGUE: string;
}

export interface OrderDetails extends Order {
    VEN_PRECO: string;
    VEN_TOTALBRUTO: number;
    VEN_TOTALDESC: number;
    VEN_VALORPENDENTE: number;
    VEN_VALORENC: number;
    VEN_DTPREVISAOENT: string;
    VEN_ORIGEMDAV: string;
    VEN_QUANT: number;
    VEN_ENTREGA: string;
    VEN_MONTAGEM: string;
    TRA_CODIGO: number;
    TRA_NOME: string;
    VEN_VALORENT: number;
    MON_DATA: string;
    PESO: number;
    items: OrderItem[];
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

export async function getOrderMetrics(startDate: string, endDate: string, storeId?: number): Promise<OrderMetrics> {
    const { data } = await api.get<OrderMetrics>("/api/v1/orders/order-metrics", 
        {
            params: {
                startDate,
                endDate,
                ...(storeId !== undefined ? { storeId } : {}),
            },
        }
    );

    return data;
}
export async function getOrderMetricsPeriodo(startDate: string, endDate: string, storeId?: number): Promise<OrderMetrics> {
    const inicio = new Date(`${startDate}T00:00:00`);
    const fim = new Date(`${endDate}T00:00:00`);

    let totalOrders = 0;
    let billing = 0;

    const formatarData = (data: Date) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth()+ 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    };

    const atual = new Date(inicio);

    while (atual <= fim){
        const inicioBloco = new Date(atual);

        const fimBloco = new Date(atual);
        fimBloco.setDate(fimBloco.getDate() + 6);

        if (fimBloco > fim) {
            fimBloco.setTime(fim.getTime());
        }

        const dataInicioBloco = formatarData(inicioBloco);
        const dataFimBloco = formatarData(fimBloco);

        console.log(
            "BUSCANDO MÉTRICAS:",
            dataInicioBloco,
            "até",
            dataFimBloco
        );

        const resposta = await getOrderMetrics(
            dataInicioBloco,
            dataFimBloco,
            storeId
        );

        totalOrders += Number(resposta.totalOrders || 0);
        billing += Number(resposta.billing || 0);

        atual.setDate(atual.getDate() + 7);
    }
    const PEDIDOS_POR_CARGA = 100;

    let pagina = 1;
    let totalPaginas = 1;

    const todosPedidos: Order[] = [];

    while (pagina <= totalPaginas) {
        const resposta = await getOrders(pagina, PEDIDOS_POR_CARGA);
        const pedidosDaLoja = resposta.pedidos.filter((pedido) => storeId === undefined || pedido.LOJ_CODIGO === storeId);
        todosPedidos.push(...pedidosDaLoja);
        totalPaginas = resposta.totalPages;

        pagina++;
    }

    const openOrders = todosPedidos.filter(
        (pedido) => {
            const pedidoEstaAberto = 
                pedido.SIT_CODIGO === 1 ||
                pedido.SIT_CODIGO === 2;
            
            if (!pedidoEstaAberto) {
                return false;
            }

            if (!pedido.VEN_DATA) {
                return false;
            }

            const dataPedido = pedido.VEN_DATA.substring(0, 10);

            return (
                dataPedido >= startDate && dataPedido <= endDate
            );
        }
    ).length;

    const averageTicket = totalOrders > 0 ? billing / totalOrders : 0;

    return {
        totalOrders,
        billing,
        averageTicket,
        openOrders,
    };
}

export async function createOrder(payload: CreateOrderPayload) {
    const { data } = await api.post("/api/v1/orders", payload);
    return data;
}

export async function getOrderById(id: number): Promise<OrderDetails> {
    const { data } = await api.get<OrderDetails>(
        `/api/v1/orders/${id}`
    );

    return data;
}