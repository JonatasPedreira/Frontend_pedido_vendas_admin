"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, OrderDetails } from "@/app/lib/orders";
import "@/styles/visualizar-pedido.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons/faArrowLeft";

export default function VisualizarPedidoPage() {
    const params = useParams();
    const router = useRouter();

    const [pedido, setPedido] = useState<OrderDetails | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
            return;
        }
        let ativo = true;
        async function carregarPedido() {
            try {
                const data = await getOrderById(Number(id));

                if (ativo) {
                    setPedido(data);
                    setErro("");
                }
            } catch (error) {
                console.error("ERRO AO BUSCAR PEDIDO:", error);

                if (ativo) {
                    setErro("Não foi possível carregar o pedido.");
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }
        carregarPedido();
        return () => {
            ativo = false;
        };
    }, [params.id]);
    function formatarData(data: string | null | undefined) {
        if (!data) return "-";

        const dataISO = data.substring(0, 10);
        const partes = dataISO.split("-");

        if (partes.length !== 3 || !partes[0] || !partes[1] || !partes[2]) {
            return "-";
        }
        const [ano, mes, dia] = partes;

        return `${dia}/${mes}/${ano}`;
    }

    function formatarHora(hora: string | null | undefined) {
        if (!hora) return "-";

        const data = new Date(hora);

        if (Number.isNaN(data.getTime())) {
            return "-";
        }

        return data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatarMoeda(valor: number | null | undefined) {
        const numero = Number(valor ?? 0);

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    if (carregando) {
        return (
            <main className="visualizar-pedido">
                <div className="visualizar-estado">
                    <span className="visualizar-spinner" aria-hidden="true" />
                    <p>Carregando pedido...</p>
                </div>
            </main>
        );
    }

    if (erro || !pedido) {
        return (
            <main className="visualizar-pedido">
                <div className="visualizar-estado visualizar-estado-erro">
                    <span className="visualizar-estado-icone" aria-hidden="true">
                        !
                    </span>

                    <h2>{erro ? "Não foi possível abrir o pedido" : "Pedido não encontrado"}</h2>

                    <p>{erro || "O pedido solicitado não foi encontrado."}</p>

                    <button
                        type="button"
                        className="visualizar-btn-secundario"
                        onClick={() => router.back()}
                    >
                        Voltar
                    </button>
                </div>
            </main>
        );
    }

    const statusPedido: Record<number, string> = {
        1: "Aguardando faturamento",
        2: "Em separação",
        3: "Faturado",
        4: "Cancelado",
    };

    const codigoStatus = Number(pedido.SIT_CODIGO);
    const nomeStatus =
        statusPedido[codigoStatus] ?? `Status ${pedido.SIT_CODIGO ?? "-"}`;

    return (
        <main className="visualizar-pedido">
            {/* Cabeçalho */}
            <header className="visualizar-header">
                <div className="visualizar-header-esquerda">
                    <button
                        type="button"
                        className="btn-voltar-pedido"
                        onClick={() => router.back()}
                        aria-label="Voltar para a página anterior"
                        title="Voltar"
                    >
                        <span aria-hidden="true"><FontAwesomeIcon icon={faArrowLeft} /></span>
                    </button>

                    <div className="visualizar-titulo-grupo">
                        <span className="visualizar-subtitulo">
                            Vendas / Pedidos / Detalhes
                        </span>

                        <h1>Pedido #{pedido.VEN_NUMERO}</h1>

                        <span className="visualizar-cliente-resumo">
                            {pedido.CLI_NOME || "Cliente não informado"}
                        </span>
                    </div>
                </div>

                <div
                    className={`visualizar-status visualizar-status-${codigoStatus}`}
                    role="status"
                >
                    <span className="visualizar-status-ponto" aria-hidden="true" />
                    {nomeStatus}
                </div>
            </header>

            {/* Informações do pedido */}
            <section className="visualizar-card">
                <div className="visualizar-card-header">
                    <div>
                        <h2>Informações do pedido</h2>
                        <p>Dados gerais da venda</p>
                    </div>
                </div>

                <div className="visualizar-info-grid">
                    <div className="visualizar-info">
                        <span>Cliente</span>
                        <strong title={pedido.CLI_NOME || "-"}>
                            {pedido.CLI_NOME || "-"}
                        </strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Vendedor</span>
                        <strong title={pedido.FUN_NOME || "-"}>
                            {pedido.FUN_NOME || "-"}
                        </strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Data</span>
                        <strong>{formatarData(pedido.VEN_DATA)}</strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Hora</span>
                        <strong>{formatarHora(pedido.VEN_HORA)}</strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Forma de pagamento</span>
                        <strong title={pedido.FPG_DESCRICAO || "-"}>
                            {pedido.FPG_DESCRICAO || "-"}
                        </strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Condição de pagamento</span>
                        <strong title={pedido.PLP_DESCRICAO || "-"}>
                            {pedido.PLP_DESCRICAO || "-"}
                        </strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Tipo</span>
                        <strong>{pedido.VEN_TIPO || "-"}</strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Origem</span>
                        <strong>{pedido.VEN_ORIGEMDAV || "-"}</strong>
                    </div>
                </div>
            </section>

            {/* Produtos: tabela para desktop e cards para celular */}
            <section className="visualizar-card visualizar-produtos-card">
                <div className="visualizar-card-header visualizar-produtos-header">
                    <div>
                        <h2>Produtos do pedido</h2>
                        <p>
                            {pedido.items.length}{" "}
                            {pedido.items.length === 1
                                ? "produto no pedido"
                                : "produtos no pedido"}
                        </p>
                    </div>
                </div>

                {pedido.items.length === 0 ? (
                    <div className="visualizar-lista-vazia">
                        Nenhum produto encontrado neste pedido.
                    </div>
                ) : (
                    <>
                        <div className="visualizar-tabela-container">
                            <table className="visualizar-tabela">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Produto</th>
                                        <th>Qtd.</th>
                                        <th>Preço unitário</th>
                                        <th>Desconto</th>
                                        <th>Total</th>
                                        <th>Líquido</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pedido.items.map((item, index) => (
                                        <tr
                                            key={`${item.PRO_CODIGO}-${index}`}
                                        >
                                            <td>{item.PRO_CODIGO}</td>

                                            <td className="visualizar-produto-nome">
                                                <strong>
                                                    {item.PRO_DESCRICAO || "-"}
                                                </strong>
                                            </td>

                                            <td>{item.IVD_QTDE}</td>

                                            <td>{formatarMoeda(item.IVD_PRECO)}</td>

                                            <td>
                                                {formatarMoeda(item.IVD_DESCONTO)}
                                            </td>

                                            <td>{formatarMoeda(item.IVD_TOTAL)}</td>

                                            <td className="visualizar-valor-liquido">
                                                {formatarMoeda(item.IVD_LIQUIDO)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="visualizar-produtos-mobile">
                            {pedido.items.map((item, index) => (
                                <article
                                    className="visualizar-produto-mobile"
                                    key={`${item.PRO_CODIGO}-${index}`}
                                >
                                    <div className="visualizar-produto-mobile-topo">
                                        <div className="visualizar-produto-identificacao">
                                            <span className="visualizar-produto-codigo">
                                                Código: {item.PRO_CODIGO}
                                            </span>

                                            <h3>{item.PRO_DESCRICAO || "-"}</h3>
                                        </div>

                                        <div className="visualizar-produto-quantidade">
                                            <span>Qtd.</span>
                                            <strong>{item.IVD_QTDE}</strong>
                                        </div>
                                    </div>

                                    <div className="visualizar-produto-mobile-detalhes">
                                        <div>
                                            <span>Preço unitário</span>
                                            <strong>
                                                {formatarMoeda(item.IVD_PRECO)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Desconto</span>
                                            <strong>
                                                {formatarMoeda(item.IVD_DESCONTO)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Total bruto</span>
                                            <strong>
                                                {formatarMoeda(item.IVD_TOTAL)}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="visualizar-produto-mobile-total">
                                        <span>Valor líquido</span>
                                        <strong>
                                            {formatarMoeda(item.IVD_LIQUIDO)}
                                        </strong>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* Entrega e resumo financeiro */}
            <div className="visualizar-final-grid">
                <section className="visualizar-card">
                    <div className="visualizar-card-header">
                        <div>
                            <h2>Entrega e logística</h2>
                            <p>Informações de transporte e entrega</p>
                        </div>
                    </div>

                    <div className="visualizar-info-grid visualizar-logistica-grid">
                        <div className="visualizar-info campo-oculto">
                            <span>Transportadora</span>
                            <strong>{pedido.TRA_NOME || "-"}</strong>
                        </div>

                        <div className="visualizar-info campo-oculto">
                            <span>Previsão de entrega</span>
                            <strong>
                                {formatarData(pedido.VEN_DTPREVISAOENT)}
                            </strong>
                        </div>

                        <div className="visualizar-info campo-oculto">
                            <span>Data de entrega</span>
                            <strong>{formatarData(pedido.VEN_ENTREGA)}</strong>
                        </div>

                        <div className="visualizar-info campo-oculto">
                            <span>Data de montagem</span>
                            <strong>{formatarData(pedido.VEN_MONTAGEM)}</strong>
                        </div>

                        <div className="visualizar-info campo-oculto">
                            <span>Peso total</span>
                            <strong>
                                {pedido.PESO != null ? `${pedido.PESO} kg` : "-"}
                            </strong>
                        </div>

                        <div className="visualizar-info">
                            <span>Quantidade de itens</span>
                            <strong>{pedido.VEN_QUANT ?? "-"}</strong>
                        </div>
                    </div>
                </section>

                {/* Resumo financeiro */}
                <section className="visualizar-card visualizar-resumo">
                    <div className="visualizar-card-header">
                        <div>
                            <h2>Resumo financeiro</h2>
                            <p>Valores totais do pedido</p>
                        </div>
                    </div>

                    <div className="resumo-financeiro">
                        <div className="resumo-linha">
                            <span>Total bruto</span>
                            <strong>
                                {formatarMoeda(pedido.VEN_TOTALBRUTO)}
                            </strong>
                        </div>

                        <div className="resumo-linha">
                            <span>Desconto</span>
                            <strong>
                                {formatarMoeda(pedido.VEN_TOTALDESC)}
                            </strong>
                        </div>

                        <div className="resumo-linha">
                            <span>Valor de entrega</span>
                            <strong>
                                {formatarMoeda(pedido.VEN_VALORENT)}
                            </strong>
                        </div>

                        <div className="resumo-linha">
                            <span>Valor pendente</span>
                            <strong>
                                {formatarMoeda(pedido.VEN_VALORPENDENTE)}
                            </strong>
                        </div>

                        <div className="resumo-linha resumo-total">
                            <span>Total líquido</span>
                            <strong>
                                {formatarMoeda(pedido.VEN_TOTALLIQUIDO)}
                            </strong>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
