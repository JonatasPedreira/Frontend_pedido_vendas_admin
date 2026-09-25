"use client";
import { useEffect, useState } from "react";
import "@/styles/pedidos.css";
import Link from "next/link";
import { getOrders, Order } from "@/app/lib/orders";
import { getClients, Client } from "@/app/lib/clients";

const ITENS_POR_PAGINA = 10;

// ⚠️ mapeamento provisório — ajuste os números conforme a tabela real de SIT_CODIGO
function getStatusInfo(situacao: number) {
    const mapa: Record<number, { label: string; className: string }> = {
        1: { label: "Aguardando Faturamento", className: "aguardando" },
        2: { label: "Em Separação", className: "separacao" },
        3: { label: "Faturado", className: "faturado" },
        4: { label: "Cancelado", className: "cancelado" },
    };
    return mapa[situacao] ?? { label: `Status ${situacao}`, className: "aguardando" };
}


export default function PedidosPage() {
    const [pedidos, setPedidos] = useState<Order[]>([]);
    const [clientes, setClientes] = useState<Client[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);

    useEffect(() => {
        Promise.all([getOrders(), getClients()])
            .then(([pedidosData, clientesData]) => {
                setPedidos(pedidosData);
                setClientes(clientesData);
            })
            .catch(() => setErro("Não foi possível carregar os pedidos."))
            .finally(() => setCarregando(false));
    }, []);

    const totalPedidos = pedidos.length;
    const faturamento = pedidos.reduce((soma, p) => soma + p.VEN_TOTALLIQUIDO, 0);
    const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;
    const pedidosEmAberto = pedidos.filter((p) => p.SIT_CODIGO !== 3).length; // ajuste o "3" quando confirmar o código de "Faturado"

    const totalPaginas = Math.max(1, Math.ceil(pedidos.length / ITENS_POR_PAGINA));
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const pedidosDaPagina = pedidos.slice(inicio, inicio + ITENS_POR_PAGINA);

    const [filtroCliente, setFiltroCliente] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");
    const [filtroVendedor, setFiltroVendedor] = useState("");
    const [filtroDataInicio, setFiltroDataInicio] = useState("");
    const [filtroDataFim, setFiltroDataFim] = useState("");

    function filtrarPedidos() {
        let filtrados = pedidos;
        if (filtroCliente) {
            filtrados = filtrados.filter((p) => p.CLI_CODIGO === Number(filtroCliente));
        }
        if (filtroStatus) {
            filtrados = filtrados.filter((p) => p.SIT_CODIGO === Number(filtroStatus));
        }
        if (filtroVendedor) {
            filtrados = filtrados.filter((p) => p.FUN_NOME === filtroVendedor);
        }
        if (filtroDataInicio || filtroDataFim) {
            filtrados = filtrados.filter((p) => {
            const dataPedido = p.VEN_DATA.substring(0, 10);
                if (filtroDataInicio && dataPedido < filtroDataInicio) {
                    return false;
                }
                if (filtroDataFim && dataPedido > filtroDataFim) {
                    return false;
                }
                return true;
            });
        }
        setPedidos(filtrados);
        setPaginaAtual(1);
    }
    function limparFiltros() {
        setFiltroCliente("");
        setFiltroStatus("");
        setFiltroVendedor("");
        setFiltroDataInicio("");
        setFiltroDataFim("");
        Promise.all([getOrders(), getClients()]).then(([pedidosData, clientesData]) => {
            setPedidos(pedidosData);
            setClientes(clientesData);
        });
    }

    function gerarPaginas() {
    const paginas: (number | string)[] = [];
        if (totalPaginas <= 7) {
            for (let i = 1; i <= totalPaginas; i++) {
                paginas.push(i);
            }
            return paginas;
        }
        paginas.push(1);
        if (paginaAtual > 4) {
            paginas.push("...");
        }
        const inicio = Math.max(2, paginaAtual - 1);
        const fim = Math.min(totalPaginas - 1, paginaAtual + 1);
        for (let i = inicio; i <= fim; i++) {
            paginas.push(i);
        }
        if (paginaAtual < totalPaginas - 3) {
            paginas.push("...");
        }
        paginas.push(totalPaginas);
        return paginas;
    }

    return (
        <div className="pedidos-page">
            <div className="breadcrumb">
                Vendas
                <span>›</span>
                <Link href="/pedidos">Pedidos de Venda</Link>
            </div>

            <div className="page-title">
                <div>
                    <h1>Pedidos de Venda</h1>
                    <p>Gerencie seus pedidos, acompanhe o status e faça novas vendas.</p>
                </div>
                <Link href="/novo-pedido" className="novo-pedido">+ Novo Pedido</Link>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <span>Pedidos no Mês</span>
                    <strong>{totalPedidos}</strong>
                </div>
                <div className="summary-card">
                    <span>Faturamento (R$)</span>
                    <strong>{faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="summary-card">
                    <span>Ticket Médio</span>
                    <strong>R$ {ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="summary-card">
                    <span>Pedidos em Aberto</span>
                    <strong>{pedidosEmAberto}</strong>
                </div>
            </div>

            <section className="filters-card">
                <div className="periodo-filtro">
                    <label>Período</label>
                    <div className="periodo-input">
                        <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} />
                        <span>até</span>
                        <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} />
                    </div>
                </div>
                <div>
                    <label>Cliente</label>
                    <select value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
                        <option value="">Todos os clientes</option>
                        {clientes.map((c) => (
                            <option key={c.CLI_CODIGO} value={c.CLI_CODIGO}>{c.CLI_NOME}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Status</label>
                    <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="1">Aguardando Faturamento</option>
                        <option value="2">Em Separação</option>
                        <option value="3">Faturado</option>
                        <option value="4">Cancelado</option>
                    </select>
                </div>
                <div>
                    <label>Vendedor</label>
                    <select value={filtroVendedor} onChange={(e) => setFiltroVendedor(e.target.value)}>
                    <option value="">Todos</option>
                    {[...new Set(pedidos.map((p) => p.FUN_NOME))].map((v) => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                    </select>
                </div>
                <button className="filter-button" onClick={filtrarPedidos}>Filtrar</button>
                <button className="clear-button" onClick={limparFiltros}>Limpar filtros</button>
            </section>
            <section className="table-card">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Nº Pedido</th>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Vendedor</th>
                                <th>Valor (R$)</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {carregando && <tr><td colSpan={7}>Carregando pedidos...</td></tr>}
                            {!carregando && erro && <tr><td colSpan={7}>{erro}</td></tr>}
                            {!carregando && !erro && pedidosDaPagina.length === 0 && (
                                <tr><td colSpan={7}>Nenhum pedido encontrado.</td></tr>
                            )}

                            {!carregando && !erro && pedidosDaPagina.map((pedido) => {
                                const statusInfo = getStatusInfo(pedido.SIT_CODIGO);

                                return (
                                    <tr key={pedido.VEN_NUMERO}>
                                        <td>{pedido.VEN_NUMSITE}</td>
                                        <td>{new Date(pedido.VEN_DATA).toLocaleDateString("pt-BR")}</td>
                                        <td>{pedido.CLI_NOME}</td>
                                        <td>{pedido.FUN_NOME}</td>
                                        <td>{pedido.VEN_TOTALLIQUIDO.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                        <td><span className={`status ${statusInfo.className}`}>{statusInfo.label}</span></td>
                                        <td>•••</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span>
                        Mostrando {pedidos.length === 0 ? 0 : inicio + 1} a {Math.min(inicio + ITENS_POR_PAGINA, pedidos.length)} de {pedidos.length} registros
                    </span>

                    <div className="pagination">
                        <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual((p) => p - 1)}>‹</button>
                        {gerarPaginas().map((pagina, index) => {
                            if (pagina === "...") {
                                return (
                                    <button
                                        key={`dots-${index}`}
                                        className="pagination-dots"
                                        disabled
                                    >
                                        ...
                                    </button>
                                );
                            }
                            return (
                                <button
                                    key={pagina}
                                    className={pagina === paginaAtual ? "active" : ""}
                                    onClick={() => setPaginaAtual(pagina as number)}
                                >
                                    {pagina}
                                </button>
                            );
                        })}
                        <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual((p) => p + 1)}>›</button>
                    </div>
                </div>
            </section>
        </div>
    );
}