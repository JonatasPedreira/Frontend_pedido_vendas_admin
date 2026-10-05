"use client";
import { useEffect, useState } from "react";
import "@/styles/pedidos.css";
import Link from "next/link";
import { getOrders, getOrderMetrics, Order, getOrderMetricsPeriodo } from "@/app/lib/orders";
import { getClients, Client } from "@/app/lib/clients";
import { getLoggedUser } from "../lib/auth";
import Icon from "@mdi/react";
import { mdiClockTimeThreeOutline, mdiCurrencyUsd, mdiFileDocumentOutline, mdiFinance } from "@mdi/js";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCopy, faEye, faPen, faPrint } from "@fortawesome/free-solid-svg-icons";

const ITENS_POR_PAGINA = 10;
const PEDIDOS_POR_CARGA = 100;

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

function Variacao({
    valor,
    mostrarComparacao,
    textoComparacao,
}: {
    valor: number;
    mostrarComparacao: boolean;
    textoComparacao: string;
}) {
    if (!mostrarComparacao) {
        return null;
    }

    const valorLimitado = Math.max(-100, Math.min(100, valor));

    const aumentou = valor > 0;
    const diminuiu = valor < 0;

    return (
        <div
            className={`card-variation ${
                aumentou
                    ? "positive"
                    : diminuiu
                    ? "negative"
                    : "neutral"
            }`}
        >
            <span className="variation-arrow">
                {aumentou ? "↑" : diminuiu ? "↓" : "→"}
            </span>

            <span>
                {Math.abs(valorLimitado).toFixed(1)}%
            </span>

            <span className="variation-label">
                {textoComparacao}
            </span>
        </div>
    );
}


export default function PedidosPage() {
    const usuarioLogado = getLoggedUser();
    const storeId = usuarioLogado?.storeId;
    const [pedidos, setPedidos] = useState<Order[]>([]);
    const [pedidosFiltrados, setPedidosFiltrados] = useState<Order[]>([]);
    const [clientes, setClientes] = useState<Client[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [paginaApiAtual, setPaginaApiAtual] = useState(1);
    const [totalPedidos, setTotalPedidos] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const router = useRouter();
    const [carregandoNovoPedido, setCarregandoNovoPedido] = useState(false);
    const [metricas, setMetricas] = useState({
        totalOrders: 0,
        billing: 0,
        averageTicket: 0,
        openOrders: 0,
    });
    const [carregandoMetricas, setCarregandoMetricas] = useState(false);


    const faturamento = pedidos.reduce((soma, p) => soma + p.VEN_TOTALLIQUIDO, 0);
    const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;
    const pedidosEmAberto = pedidos.filter((p) => p.SIT_CODIGO !== 3).length; // ajuste o "3" quando confirmar o código de "Faturado"
    const [filtroCliente, setFiltroCliente] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");
    const [filtroVendedor, setFiltroVendedor] = useState("");
    const [filtroDataInicio, setFiltroDataInicio] = useState("");
    const [filtroDataFim, setFiltroDataFim] = useState("");
    const [filtroAtivo, setFiltroAtivo] = useState(false);
    const [filtrando, setFiltrando] = useState(false);
    const [limpandoFiltro, setLimpandoFiltro] = useState(false);

    const totalPaginasFiltro = Math.max(1, Math.ceil(pedidosFiltrados.length / ITENS_POR_PAGINA));
    const inicio = filtroAtivo ? (paginaAtual - 1) * ITENS_POR_PAGINA : ((paginaAtual - 1) % (PEDIDOS_POR_CARGA / ITENS_POR_PAGINA)) * ITENS_POR_PAGINA;
    const pedidosDaPagina = pedidosFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);


    const pedidosAtuais = pedidosFiltrados;

    const faturamentoAtual = pedidosAtuais.reduce(
        (soma, p) => soma + p.VEN_TOTALLIQUIDO,
        0
    );

    const totalPedidosAtual = pedidosAtuais.length;

    const ticketMedioAtual =
            totalPedidosAtual > 0
                ? faturamentoAtual / totalPedidosAtual
                : 0;

    const pedidosEmAbertoAtual = pedidosAtuais.filter(
            (p) => p.SIT_CODIGO !== 3
        ).length;

    let pedidosAnteriores: Order[] = [];

    if (filtroDataInicio && filtroDataFim) {
        const periodoAnterior = obterPeriodoAnterior(
            filtroDataInicio,
            filtroDataFim
        );

        pedidosAnteriores = pedidos.filter((pedido) => {
            const dataPedido = new Date(pedido.VEN_DATA);

            return (
                dataPedido >= periodoAnterior.inicio &&
                dataPedido <= periodoAnterior.fim
            );
        });
    }
    const faturamentoAnterior = pedidosAnteriores.reduce(
        (soma, p) => soma + p.VEN_TOTALLIQUIDO,
        0
    );

    const totalPedidosAnterior = pedidosAnteriores.length;

    const ticketMedioAnterior =
        totalPedidosAnterior > 0
            ? faturamentoAnterior / totalPedidosAnterior
            : 0;

    const pedidosEmAbertoAnterior = pedidosAnteriores.filter(
        (p) => p.SIT_CODIGO !== 3
    ).length;

    const variacaoPedidos = calcularVariacao(
        totalPedidosAtual,
        totalPedidosAnterior
    );

    const variacaoFaturamento = calcularVariacao(
        faturamentoAtual,
        faturamentoAnterior
    );

    const variacaoTicket = calcularVariacao(
        ticketMedioAtual,
        ticketMedioAnterior
    );

    const variacaoAbertos = calcularVariacao(
        pedidosEmAbertoAtual,
        pedidosEmAbertoAnterior
    );
    function filtrarPedidos() {
        setErro("");

        // =====================================================
        // 1. VALIDAÇÃO DO PERÍODO DE DATAS
        // =====================================================

        if (filtroDataInicio && filtroDataFim) {
            const dataInicio = new Date(`${filtroDataInicio}T00:00:00`);
            const dataFim = new Date(`${filtroDataFim}T00:00:00`);

            // Data inicial maior que a final
            if (dataInicio > dataFim) {
                setErro("A data inicial não pode ser maior que a data final.");
                return;
            }

            // Diferença em dias, considerando as duas datas
            const diferencaDias =
                Math.floor(
                    (dataFim.getTime() - dataInicio.getTime()) /
                        (1000 * 60 * 60 * 24)
                ) + 1;

            // Limite máximo de 7 dias
            if (diferencaDias > 7) {
                setErro("O período máximo para pesquisa é de 7 dias.");
                return;
            }
        }

        // =====================================================
        // 2. FILTRO DOS PEDIDOS
        // =====================================================

        const filtrados = pedidos.filter((pedido) => {
            // ---------------------------------------------
            // Loja
            // ---------------------------------------------
            const pertenceALoja =
                storeId === undefined ||
                pedido.LOJ_CODIGO === storeId;

            if (!pertenceALoja) {
                return false;
            }

            // ---------------------------------------------
            // Cliente
            // ---------------------------------------------
            const correspondeCliente =
                !filtroCliente ||
                pedido.CLI_CODIGO === Number(filtroCliente);

            // ---------------------------------------------
            // Status
            // ---------------------------------------------
            const correspondeStatus =
                !filtroStatus ||
                pedido.SIT_CODIGO === Number(filtroStatus);

            // ---------------------------------------------
            // Vendedor
            // ---------------------------------------------
            const correspondeVendedor =
                !filtroVendedor ||
                pedido.FUN_CODIGO === Number(filtroVendedor);

            // ---------------------------------------------
            // Data inicial
            // ---------------------------------------------
            const dataPedido = pedido.VEN_DATA
                ? pedido.VEN_DATA.substring(0, 10)
                : "";

            const correspondeDataInicio =
                !filtroDataInicio ||
                dataPedido >= filtroDataInicio;

            // ---------------------------------------------
            // Data final
            // ---------------------------------------------
            const correspondeDataFim =
                !filtroDataFim ||
                dataPedido <= filtroDataFim;

            return (
                correspondeCliente &&
                correspondeStatus &&
                correspondeVendedor &&
                correspondeDataInicio &&
                correspondeDataFim
            );
        });

        // =====================================================
        // 3. ATUALIZA A TABELA
        // =====================================================

        setPedidosFiltrados(filtrados);
        setPaginaAtual(1);

        // Verifica se existe algum filtro ativo
        const existeFiltro =
            Boolean(filtroCliente) ||
            Boolean(filtroStatus) ||
            Boolean(filtroVendedor) ||
            Boolean(filtroDataInicio) ||
            Boolean(filtroDataFim);

        setFiltroAtivo(existeFiltro);

        // =====================================================
        // 4. CARREGA AS MÉTRICAS DO PERÍODO
        // =====================================================

        if (filtroDataInicio && filtroDataFim) {
            carregarMetricas(
                filtroDataInicio,
                filtroDataFim
            );
        }
    }
    async function carregarPagina(pagina: number) {
        try {
            setCarregando(true);
            setErro("");

            const novaPaginaApi = Math.floor((pagina - 1) / 10) + 1;

            if(novaPaginaApi !== paginaApiAtual){
                const resposta = await getOrders(novaPaginaApi, PEDIDOS_POR_CARGA);

                setPedidos(resposta.pedidos);
                setPedidosFiltrados(resposta.pedidos);

                setPaginaApiAtual(novaPaginaApi);
            }

            setPaginaAtual(pagina);
        } catch {
            setErro("Não foi possível carregar os pedidos.");
        } finally {
            setCarregando(false);
        }
    }
    async function limparFiltros() {
        try {
            setLimpandoFiltro(true);
            setErro("");

            // Limpa os campos dos filtros
            setFiltroCliente("");
            setFiltroStatus("");
            setFiltroVendedor("");
            setFiltroDataInicio("");
            setFiltroDataFim("");

            // Volta para a primeira página
            setPaginaAtual(1);
            setPaginaApiAtual(1);
            setFiltroAtivo(false);

            // Período padrão dos cards: últimos 30 dias
            const periodoMetricas = obterPeriodoMetricas();

            // Recarrega pedidos, clientes e métricas
            const [pedidosData, clientesData, metricasData] =
                await Promise.all([
                    getOrders(1, PEDIDOS_POR_CARGA),
                    getClients(),
                    getOrderMetricsPeriodo(
                        periodoMetricas.inicio,
                        periodoMetricas.fim,
                        storeId
                    ),
                ]);

            // Mantém somente os pedidos da loja logada
            const pedidosDaLoja = pedidosData.pedidos.filter(
                (pedido) =>
                    storeId === undefined ||
                    pedido.LOJ_CODIGO === storeId
            );

            setPedidos(pedidosDaLoja);
            setPedidosFiltrados(pedidosDaLoja);
            setClientes(clientesData);

            setTotalPedidos(pedidosData.totalCount);

            setTotalPaginas(
                Math.max(
                    1,
                    Math.ceil(
                        pedidosData.totalCount / ITENS_POR_PAGINA
                    )
                )
            );
            
            setPaginaApiAtual(1);
            // IMPORTANTE:
            // Atualiza os cards para os últimos 30 dias
            setMetricas(metricasData);
        } catch (error) {
            console.error(
                "ERRO AO LIMPAR FILTROS:",
                error
            );

            setErro(
                "Não foi possível limpar os filtros."
            );
        } finally {
            setLimpandoFiltro(false);
        }
    }
    function gerarPaginas() {
        const paginas: (number | string)[] = [];

        const paginasExibidas = filtroAtivo
            ? totalPaginasFiltro
            : totalPaginas;

        if (paginasExibidas <= 7) {
            for (let i = 1; i <= paginasExibidas; i++) {
                paginas.push(i);
            }

            return paginas;
        }

        paginas.push(1);

        if (paginaAtual > 4) {
            paginas.push("...");
        }

        const inicio = Math.max(2, paginaAtual - 1);
        const fim = Math.min(
            paginasExibidas - 1,
            paginaAtual + 1
        );

        for (let i = inicio; i <= fim; i++) {
            paginas.push(i);
        }

        if (paginaAtual < paginasExibidas - 3) {
            paginas.push("...");
        }

        paginas.push(paginasExibidas);

        return paginas;
    }
    function calcularVariacao(atual: number, anterior: number){
        if (anterior === 0){
            if (atual === 0) return 0;
            return 100;
        }

        return ((atual - anterior) / anterior ) * 100;
    }
    function obterPeriodoAnterior(dataInicio: string, dataFim: string) {
        const inicio = new Date(`${dataInicio}T00:00:00`);
        const fim = new Date(`${dataFim}T00:00:00`);

        const quantidadeDias =
            Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const fimAnterior = new Date(inicio);
        fimAnterior.setDate(fimAnterior.getDate() - 1);

        const inicioAnterior = new Date(fimAnterior);
        inicioAnterior.setDate(inicioAnterior.getDate() - quantidadeDias + 1);

        return {
            inicio: inicioAnterior,
            fim: fimAnterior,
        };
    }
    async function carregarMetricas(dataInicio: string, dataFim: string) {
        try {
            setCarregandoMetricas(true);

            console.log("STORE ID:", storeId);
            console.log("DATA INÍCIO:", dataInicio);
            console.log("DATA FIM:", dataFim);

            const resposta = await getOrderMetricsPeriodo(
                dataInicio,
                dataFim,
                storeId
            );

            setMetricas(resposta);
        } catch (error) {
            console.error("ERRO AO CARREGAR AS MÉTRICAS: ", error);

            setMetricas({
                totalOrders: 0,
                billing: 0,
                averageTicket: 0,
                openOrders: 0,
            });
        } finally {
            setCarregandoMetricas(false);
        }
    }

    function formatarData(data: Date) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    function obterPeriodoMetricas() {
        const hoje = new Date();

        const fim = new Date(hoje);

        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 29);

        return {
            inicio: formatarData(inicio),
            fim: formatarData(fim),
        };
    }
    const textoComparacao = filtroDataInicio && filtroDataFim ? filtroDataInicio.substring(0, 7) === filtroDataFim.substring(0, 7) ? "vs mês anterior" : "vs período anterior" : "";

    useEffect(() => {
        const periodoMetricas = obterPeriodoMetricas();

        Promise.all([
            getOrders(1, PEDIDOS_POR_CARGA),
            getClients(),
            getOrderMetricsPeriodo(
                periodoMetricas.inicio,
                periodoMetricas.fim,
                storeId
            ),
        ])
            .then(([pedidosData, clientesData, metricasData]) => {
                const pedidosDaLoja = pedidosData.pedidos.filter(
                    (pedido) => pedido.LOJ_CODIGO === storeId
                );

                setPedidos(pedidosDaLoja);
                setPedidosFiltrados(pedidosDaLoja);

                setClientes(clientesData);

                setTotalPedidos(pedidosData.totalCount);

                setPaginaApiAtual(1);

                setTotalPaginas(
                    Math.ceil(
                        pedidosData.totalCount / ITENS_POR_PAGINA
                    )
                );

                setMetricas(metricasData);
            })
            .catch((error) => {
                console.error("ERRO AO CARREGAR PEDIDOS:", error);
                setErro("Não foi possível carregar os pedidos.");
            })
            .finally(() => {
                setCarregando(false);
            });
    }, [storeId]);
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
                <button
                    className="novo-pedido"
                    onClick={() => {
                        setCarregandoNovoPedido(true);

                        setTimeout(() => {
                            router.push("/novo-pedido");
                        }, 800);
                    }}
                    disabled={carregandoNovoPedido}
                >
                    {carregandoNovoPedido ? "Carregando..." : "+ Novo Pedido"}
                </button>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <div className="icon-card"><Icon path={mdiFileDocumentOutline} size={1} /></div>
                    <div>
                        <span>{filtroAtivo ? "Pedidos da Semana" : "Pedidos dos Últimos 30 dias"}</span>
                        <strong>{carregandoMetricas ? "..." : metricas.totalOrders}</strong>
                        <Variacao
                            valor={variacaoPedidos}
                            mostrarComparacao={!!filtroDataInicio && !!filtroDataFim}
                            textoComparacao={textoComparacao}
                        />
                    </div>
                </div>
                <div className="summary-card">
                    <div className="icon-card"><Icon path={mdiCurrencyUsd} size={1} /></div>
                    <div>
                        <span>Faturamento</span>
                        <strong>{carregandoMetricas ? "..." : `R$ ${metricas.billing.toLocaleString("pt-br", {minimumFractionDigits: 2,})}`}</strong>
                        <Variacao
                            valor={variacaoFaturamento}
                            mostrarComparacao={!!filtroDataInicio && !!filtroDataFim}
                            textoComparacao={textoComparacao}
                        />
                    </div>
                </div>
                <div className="summary-card">
                    <div className="icon-card"><Icon path={mdiFinance} size={1} /></div>
                    <div>
                        <span>Ticket Médio</span>
                        <strong>{carregandoMetricas ? "..." : `R$ ${metricas.averageTicket.toLocaleString("pt-br", {minimumFractionDigits: 2,})}`}</strong>
                        <Variacao
                            valor={variacaoTicket}
                            mostrarComparacao={!!filtroDataInicio && !!filtroDataFim}
                            textoComparacao={textoComparacao}
                        />
                    </div>
                </div>
                <div className="summary-card">
                    <div className="icon-aberto"><Icon path={mdiClockTimeThreeOutline} size={1} /></div>
                    <div>
                        <span>Pedidos em Aberto</span>
                        <strong>{carregandoMetricas ? "..." : metricas.openOrders}</strong>
                        <Variacao
                            valor={variacaoAbertos}
                            mostrarComparacao={!!filtroDataInicio && !!filtroDataFim}
                            textoComparacao={textoComparacao}
                        />
                    </div>
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
                    {[...new Map(pedidos.map((p) => [p.FUN_CODIGO, p.FUN_NOME,])).entries(), ].map(([codigo, nome]) => (
                        <option key={codigo} value={codigo}>{nome}</option>
                    ))}
                    </select>
                </div>
                <button className="filter-button" onClick={filtrarPedidos} disabled={filtrando}>
                    {filtrando ? (
                        <>
                            <span className="button-spinner"></span>
                            Filtrando...
                        </>
                    ) : (
                        "Filtrar"
                    )}
                </button>
                <button className="clear-button" onClick={limparFiltros}>Limpar filtros</button>
            </section>
            <section className="table-card">
                {carregando ? (
                    <div className="tabela-loading">
                        <div className="loading-spinner"></div>
                        <span>Carregando pedidos...</span>
                    </div>
                    ): (
                        <div className="table-responsive tabela-wrapper">
                            {(filtrando || limpandoFiltro) && (
                                <div className="tabela-filtro-loading">
                                    <div className="loading-spinner"></div>
                                    <span>{limpandoFiltro ? "Limpando Filtros..." : "Filtrando Pedidos..."}</span>
                                </div>
                            )}
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
                                                <td>{pedido.VEN_NUMERO}</td>
                                                <td>{new Date(pedido.VEN_DATA).toLocaleDateString("pt-BR")}</td>
                                                <td>{pedido.CLI_NOME}</td>
                                                <td>{pedido.FUN_NOME}</td>
                                                <td>{pedido.VEN_TOTALLIQUIDO.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                                <td><span className={`status ${statusInfo.className}`}>{statusInfo.label}</span></td>
                                                <td className="acoes-pedidos">
                                                    <button
                                                        type="button"
                                                        className="btn-acoes-pedido"
                                                        onClick={() => router.push(`/pedidos/${pedido.VEN_NUMERO}`)}
                                                        aria-label={`Visualizar pedido ${pedido.VEN_NUMERO}`}
                                                        title="Visualizar pedido"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                <div className="table-footer">
                    <span>
                        Mostrando{" "}
                        {pedidosFiltrados.length === 0
                            ? 0
                            : inicio + 1}{" "}
                        a{" "}
                        {Math.min(
                            inicio + ITENS_POR_PAGINA,
                            pedidosFiltrados.length
                        )}{" "}
                        de{" "}
                        {filtroAtivo
                            ? pedidosFiltrados.length
                            : totalPedidos}{" "}
                        registros
                    </span>

                    <div className="pagination">
                        <button
                            disabled={paginaAtual === 1}
                            onClick={() => {
                                if(filtroAtivo){
                                    setPaginaAtual(paginaAtual - 1);
                                } else {
                                    carregarPagina(paginaAtual - 1);
                                }
                            }}
                        >
                            ‹
                        </button>
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
                                    onClick={() => {
                                        if(filtroAtivo){
                                            setPaginaAtual(pagina as number);
                                        } else {
                                            carregarPagina(pagina as number);
                                        }
                                    }}
                                >
                                    {pagina}
                                </button>
                            );
                        })}
                        <button
                            disabled={paginaAtual === (filtroAtivo ? totalPaginasFiltro : totalPaginas)}
                            onClick={() => {
                                if(filtroAtivo){
                                    setPaginaAtual(paginaAtual + 1);
                                } else {
                                    carregarPagina(paginaAtual + 1);
                                }
                            }}
                        >
                            ›
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}