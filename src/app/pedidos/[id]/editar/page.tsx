"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faArrowLeft, faSpinner, faPersonDigging } from "@fortawesome/free-solid-svg-icons";
import { getOrderById, OrderDetails } from "@/app/lib/orders";
import "@/styles/editar-pedido.css";

export default function EditarPedidoPage() {
    const params = useParams();
    const router = useRouter();

    const [pedido, setPedido] = useState<OrderDetails | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [idInvalido, setIdInvalido] = useState(false);

    useEffect(() => {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        let ativo = true;

        async function carregarPedido() {
            if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
                if (ativo) {
                    setIdInvalido(true);
                    setCarregando(false);
                }
                return;
            }
            try {
                const dados = await getOrderById(Number(id));

                if (ativo) {
                    setPedido(dados);
                    setErro("");
                    setIdInvalido(false);
                }
            } catch (error) {
                console.error("Erro ao carregar pedido:", error);
                if (ativo) {
                    setErro("Não foi possível carregar os dados do pedido.");
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

    function formatarData(data: string | undefined) {
        if (!data) return "-";

        const dataSimples = data.substring(0, 10);
        const partes = dataSimples.split("-");

        if (partes.length !== 3) return data;

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    if (carregando) {
        return (
            <main className="editar-pedido">
                <div className="editar-pedido-mensagem">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <p>Carregando pedido...</p>
                </div>
            </main>
        );
    }
    if (idInvalido || erro || !pedido) {
        return (
            <main className="editar-pedio">
                <div className="editar-pedido-mensagem editar-pedido-erro">
                    <p>{idInvalido ? "Número do pedido inválido." : erro || "Pedido não encontrado."}</p>
                    <button
                        type="button"
                        onClick={() => router.push("/pedidos")}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Voltar para pedidos
                    </button>
                </div>
            </main>
        );
    }
    return (
        <main className="editar-pedido">
            <header className="editar-pedido-header">
                <div className="editar-pedido-titulo">
                    <h1>
                        <FontAwesomeIcon icon={faPencil} />
                        Editar pedido
                    </h1>

                    <p>Pedido #{pedido.VEN_NUMERO}</p>
                </div>
                <button
                    type="button"
                    className="editar-pedido-voltar"
                    onClick={() => router.push("/pedidos")}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Voltar
                </button>
            </header>

            <section className="editar-pedido-card">
                <h2>Informações do pedido</h2>

                <div className="editar-pedio-info-grid">
                    <div className="editar-pedido-info">
                        <span>Número do pedido</span>
                        <strong>{pedido.VEN_NUMERO}</strong>
                    </div>
                    <div className="editar-pedido-info">
                        <span>Cliente</span>
                        <strong>{pedido.CLI_NOME || "-"}</strong>
                    </div>
                    <div className="editar-pedido-info">
                        <span>Data do pedido</span>
                        <strong>{formatarData(pedido.VEN_DATA)}</strong>
                    </div>
                    <div className="editar-pedido-info">
                        <span>Vendedor</span>
                        <strong>{pedido.FUN_NOME || "-"}</strong>
                    </div>
                    <div className="editar-pedido-info">
                        <span>Forma de pagamento</span>
                        <strong>{pedido.FPG_DESCRICAO || "—"}</strong>
                    </div>
                    <div className="editar-pedido-info">
                        <span>Condição de pagamento</span>
                        <strong>{pedido.PLP_DESCRICAO || "—"}</strong>
                    </div>
                </div>
            </section>
            <section className="editar-pedido-card">
                <h2>Produtos do pedido</h2>

                {pedido.items && pedido.items.length > 0 ? (
                    <div className="editar-pedido-tabela-container">
                        <table className="editar-pedido-tabela">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Produto</th>
                                    <th>Quantidade</th>
                                    <th>Preço unitário</th>
                                    <th>Desconto</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedido.items.map((item, index) => (
                                    <tr
                                        key={`${item.PRO_CODIGO}-${index}`}
                                    >
                                        <td>{item.PRO_CODIGO}</td>
                                        <td>{item.PRO_DESCRICAO}</td>
                                        <td>{item.IVD_QTDE}</td>
                                        <td>
                                            {Number(item.IVD_PRECO).toLocaleString("pt-BR", {
                                                style: "currency",
                                                currency: "BRL"
                                            }
                                            )}
                                        </td>
                                        <td>
                                            {Number(item.IVD_DESCONTO).toLocaleString("pt-BR", {style: "currency", currency: "BRL"})}
                                        </td>
                                        <td>
                                            {Number(item.IVD_LIQUIDO).toLocaleString("pt-BR", {style: "currency", currency: "BRL"})}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="editar-pedido-sem-produtos">
                        Nenhum produto encontrado neste pedido.
                    </p>
                )}
            </section>
            <section className="editar-pedido-card editar-pedido-resumo">
                <h2>Resumo financeiro</h2>

                <div className="editar-pedido-resumo-linha">
                    <span>Total bruto</span>
                    <strong>
                        {Number(pedido.VEN_TOTALBRUTO || 0).toLocaleString("pt-BR", {style: "currency", currency:"BRL"})}
                    </strong>
                </div>
                <div className="editar-pedido-resumo-linha">
                    <span>Desconto total</span>
                    <strong>
                        {Number(pedido.VEN_TOTALDESC || 0).toLocaleString("pt-BR", {style: "currency", currency: "BRL"})}
                    </strong>
                </div>
                <div className="editar-pedido-resumo-linha editar-pedido-total">
                    <span>Total líquido</span>
                    <strong>
                        {Number(pedido.VEN_TOTALLIQUIDO || 0).toLocaleString("pt-BR", {style: "currency", currency: "BRL"})}
                    </strong>
                </div>
            </section>
        </main>
    );
}