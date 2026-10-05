"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, OrderDetails } from "@/app/lib/orders";
import "@/styles/visualizar-pedido.css";

export default function VisualizarPedidoPage() {
    const params = useParams();
    const router = useRouter();

    const [pedido, setPedido] = useState<OrderDetails | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        if (!params.id) return;

        getOrderById(Number(params.id))
            .then((data) => {
                setPedido(data);
            })
            .catch((error) => {
                console.error("ERRO AO BUSCAR PEDIDO:", error);
                setErro("Não foi possível carregar o pedido.");
            })
            .finally(() => {
                setCarregando(false);
            });
    }, [params.id]);

    function formatarData(data: string | null | undefined) {
        if (!data) return "-";

        const dataFormatada = new Date(data);

        if (isNaN(dataFormatada.getTime())) {
            return "-";
        }

        return dataFormatada.toLocaleDateString("pt-BR");
    }

    function formatarHora(hora: string | null | undefined) {
        if (!hora) return "-";

        const data = new Date(hora);

        if (isNaN(data.getTime())) {
            return "-";
        }

        return data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatarMoeda(valor: number | null | undefined) {
        const numero = Number(valor ?? 0);

        return `R$ ${numero.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    if (carregando) {
        return (
            <main className="visualizar-pedido">
                <div className="visualizar-carregando">
                    Carregando pedido...
                </div>
            </main>
        );
    }

    if (erro) {
        return (
            <main className="visualizar-pedido">
                <div className="visualizar-erro">
                    {erro}
                </div>
            </main>
        );
    }

    if (!pedido) {
        return (
            <main className="visualizar-pedido">
                <div className="visualizar-erro">
                    Pedido não encontrado.
                </div>
            </main>
        );
    }

    return (
        <main className="visualizar-pedido">

            {/* CABEÇALHO */}

            <div className="visualizar-header">

                <div className="visualizar-header-esquerda">
                    <button
                        type="button"
                        className="btn-voltar-pedido"
                        onClick={() => router.back()}
                    >
                        ←
                    </button>

                    <div>
                        <span className="visualizar-subtitulo">
                            Pedido
                        </span>

                        <h1>
                            #{pedido.VEN_NUMERO}
                        </h1>
                    </div>
                </div>

                <div className="visualizar-status">
                    Status: {pedido.SIT_CODIGO}
                </div>

            </div>


            {/* INFORMAÇÕES DO PEDIDO */}

            <section className="visualizar-card">

                <div className="visualizar-card-header">
                    <h2>Informações do pedido</h2>
                </div>

                <div className="visualizar-info-grid">

                    <div className="visualizar-info">
                        <span>Cliente</span>
                        <strong>{pedido.CLI_NOME}</strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Vendedor</span>
                        <strong>{pedido.FUN_NOME}</strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Data</span>
                        <strong>
                            {formatarData(pedido.VEN_DATA)}
                        </strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Hora</span>
                        <strong>{formatarHora(pedido.VEN_HORA)}</strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Forma de pagamento</span>
                        <strong>{pedido.FPG_DESCRICAO}</strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Condição de pagamento</span>
                        <strong>{pedido.PLP_DESCRICAO}</strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Tipo</span>
                        <strong>{pedido.VEN_TIPO}</strong>
                    </div>

                    <div className="visualizar-info">
                        <span>Origem</span>
                        <strong>{pedido.VEN_ORIGEMDAV}</strong>
                    </div>

                </div>

            </section>


            {/* PRODUTOS */}

            <section className="visualizar-card">

                <div className="visualizar-card-header">
                    <div>
                        <h2>Produtos</h2>

                        <span className="visualizar-card-descricao">
                            {pedido.items.length} produto(s) no pedido
                        </span>
                    </div>
                </div>

                <div className="visualizar-tabela-container">

                    <table className="visualizar-tabela">

                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Produto</th>
                                <th>Qtd.</th>
                                <th>Preço</th>
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
                                    <td>
                                        {item.PRO_CODIGO}
                                    </td>

                                    <td>
                                        <strong>
                                            {item.PRO_DESCRICAO}
                                        </strong>
                                    </td>

                                    <td>
                                        {item.IVD_QTDE}
                                    </td>

                                    <td>
                                        {formatarMoeda(item.IVD_PRECO)}
                                    </td>

                                    <td>
                                        {formatarMoeda(item.IVD_DESCONTO)}
                                    </td>

                                    <td>
                                        {formatarMoeda(item.IVD_TOTAL)}
                                    </td>

                                    <td>
                                        <strong>
                                            {formatarMoeda(
                                                item.IVD_LIQUIDO
                                            )}
                                        </strong>
                                    </td>
                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* DETALHES DE ENTREGA */}
            <div className="visualizar-final-grid">
                <section className="visualizar-card">

                    <div className="visualizar-card-header">
                        <h2>Entrega e logística</h2>
                    </div>

                    <div className="visualizar-info-grid">

                        <div className="visualizar-info campo-oculto">
                            <span>Transportadora</span>
                            <strong>
                                {pedido.TRA_NOME || "-"}
                            </strong>
                        </div>

                        <div className="visualizar-info campo-oculto">
                            <span>Previsão de entrega</span>
                            <strong>
                                {formatarData(
                                    pedido.VEN_DTPREVISAOENT
                                )}
                            </strong>
                        </div>

                        <div className="visualizar-info campo-oculto">
                            <span>Data de entrega</span>
                            <strong>
                                {formatarData(
                                    pedido.VEN_ENTREGA
                                )}
                            </strong>
                        </div>

                        <div className="visualizar-info campo-oculto">
                            <span>Data de montagem</span>
                            <strong>
                                {formatarData(
                                    pedido.VEN_MONTAGEM
                                )}
                            </strong>
                        </div>

                        <div className="visualizar-info campo-oculto">
                            <span>Peso total</span>
                            <strong>
                                {pedido.PESO} kg
                            </strong>
                        </div>

                        <div className="visualizar-info">
                            <span>Quantidade de itens</span>
                            <strong>
                                {pedido.VEN_QUANT}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* RESUMO FINANCEIRO */}

                <section className="visualizar-card visualizar-resumo">

                    <div className="visualizar-card-header">
                        <h2>Resumo financeiro</h2>
                    </div>

                    <div className="resumo-financeiro">

                        <div className="resumo-linha">
                            <span>Total bruto</span>

                            <strong>
                                {formatarMoeda(
                                    pedido.VEN_TOTALBRUTO
                                )}
                            </strong>
                        </div>

                        <div className="resumo-linha">
                            <span>Desconto</span>

                            <strong>
                                {formatarMoeda(
                                    pedido.VEN_TOTALDESC
                                )}
                            </strong>
                        </div>

                        <div className="resumo-linha">
                            <span>Valor de entrega</span>

                            <strong>
                                {formatarMoeda(
                                    pedido.VEN_VALORENT
                                )}
                            </strong>
                        </div>

                        <div className="resumo-linha">
                            <span>Valor pendente</span>

                            <strong>
                                {formatarMoeda(
                                    pedido.VEN_VALORPENDENTE
                                )}
                            </strong>
                        </div>

                        <div className="resumo-linha resumo-total">
                            <span>Total líquido</span>

                            <strong>
                                {formatarMoeda(
                                    pedido.VEN_TOTALLIQUIDO
                                )}
                            </strong>
                        </div>

                    </div>

                </section>
            </div>                
        </main>
    );
}