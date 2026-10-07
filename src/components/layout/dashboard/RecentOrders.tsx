"use client";

import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type PedidoRecente = {
    numero: number;
    cliente: string;
    vendedor: string;
    data: string;
    valor: number;
    status: "Faturado" | "Em Separação" | "Aguardando Faturamento" | "Cancelado";
};

const pedidosRecentes: PedidoRecente[] = [
    { 
        numero: 1025, 
        cliente: "Empresa ABC Ltda.", 
        vendedor: "João Silva", 
        data: "07/10/2026", 
        valor: 850, status: "Faturado", 
    }, 
    { 
        numero: 1024, 
        cliente: "Comercial Fortaleza", 
        vendedor: "Maria Santos", 
        data: "07/10/2026", 
        valor: 420, 
        status: "Em Separação", 
    }, 
    { 
        numero: 1023, 
        cliente: "Mercantil São Paulo", 
        vendedor: "João Silva", 
        data: "06/10/2026", 
        valor: 1250, 
        status: "Aguardando Faturamento", 
    }, 
    { 
        numero: 1022, 
        cliente: "Distribuidora Central", 
        vendedor: "Carlos Oliveira", 
        data: "06/10/2026", 
        valor: 675.5, 
        status: "Faturado", 
    }, 
    { 
        numero: 1021, 
        cliente: "Supermercado União", 
        vendedor: "Maria Santos", 
        data: "05/10/2026", 
        valor: 310, 
        status: "Cancelado", 
    },
];

const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valor);
};

const obterClasseStatus = (status: PedidoRecente["status"]) => {
    switch (status) {
        case "Faturado":
            return "status-faturado";

        case "Em Separação":
            return "status-separacao";

        case "Aguardando Faturamento":
            return "status-aguardando";

        case "Cancelado":
            return "status-cancelado";
        
        default:
            return "";
    }
};

const RecentOreders = () => {
    return (
        <div className="dashboard-table-card">
            <div className="dashboard-table-header">
                <div>
                    <h2>Pedidos Recentes</h2>
                    <p>Últimos pedidos realizados</p>
                </div>

                <button className="dashboard-view-all">
                    Ver todos
                </button>
            </div>
            <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Pedido</th>
                            <th>Cliente</th>
                            <th>Vendedor</th>
                            <th>Data</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidosRecentes.map((pedido) => (
                            <tr key={pedido.numero}>
                                <td className="order-number">
                                    #{pedido.numero}
                                </td>
                                <td>{pedido.cliente}</td>
                                <td>{pedido.vendedor}</td>
                                <td>{pedido.data}</td>
                                <td className="order-value">
                                    {formatarMoeda(pedido.valor)}
                                </td>
                                <td>
                                    <span className={`order-status ${obterClasseStatus(pedido.status)}`}>
                                        {pedido.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="order-action" title="Visiualizar pedido" type="button">
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentOreders;