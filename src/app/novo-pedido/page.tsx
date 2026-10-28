"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "@/styles/novo-pedido.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faArrowLeft, faBoxesStacked, faCartShopping, faCheck, faClipboardCheck, faFileLines, faMagnifyingGlass, faPercent, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getClients, getClientById, Client } from "@/app/lib/clients";
import { getProducts, Product } from "@/app/lib/products";
import { getLoggedUser } from "@/app/lib/auth";
import { createOrder, getOrders } from "../lib/orders";
import { getPaymentMethods, PaymentMethod } from "@/app/lib/payment-methods";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

interface ItemPedido {
    id: number;
    codigo: string;
    descricao: string;
    unidade: string;
    estoque: number;
    quantidade: number | "";
    preco: number | "";
    desconto: number | "";
}

export default function NovoPedidoPage() {
    const usuario = getLoggedUser();
    const { user } = useAuth();

    // --- dados do cabeçalho ---
    const [clienteQuery, setClienteQuery] = useState("");
    const [resultadosCliente, setResultadosCliente] = useState<Client[]>([]);
    const [clienteSelecionado, setClienteSelecionado] = useState<Client | null>(null);

    const [dataPedido, setDataPedido] = useState(() => {
        const hoje = new Date();

        return [
            hoje.getFullYear(),
            String(hoje.getMonth() + 1).padStart(2, "0"),
            String(hoje.getDate()).padStart(2, "0"),
        ].join("-");
    });

    const [prevFaturamento, setPrevFaturamento] = useState(() => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, "0");
        const dia = String(hoje.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    });
    function handleDataPedidoChange(novaData: string) {
        setDataPedido(novaData);
    }
    const [tabelaPrecos, setTabelaPrecos] = useState("");
    const [condicaoPagamento, setCondicaoPagamento] = useState("");
    const [tipoFrete, setTipoFrete] = useState("");
    const [observacoesCabecalho, setObservacoesCabecalho] = useState("");
    const [observacoesPedido, setObservacoesPedido] = useState("");
    const vendedor = user?.funCodigo ?? "";
    const [importando, setImportando] = useState(false);
    const arquivoInputRef = useRef<HTMLInputElement>(null);
    const [resumoImportacao, setResumoImportacao] = useState<string | null>(null);
    const [descontoGlobalAberto, setDescontoGlobalAberto] = useState(false);
    const [descontoGlobalValor, setDescontoGlobalValor] = useState("");
    const descontoGlobalRef = useRef<HTMLDivElement>(null);
    const [codigoPagamento, setCodigoPagamento] = useState("");
    const [erroCodigoPagamento, setErroCodigoPagamento] = useState("");
    const [formaPagamento, setFormaPagamento] = useState<number | "">("");
    const [formasPagamento, setFormasPagamento] = useState<PaymentMethod[]>([]);
    const [finalizando, setFinalizando] = useState(false);
    const [erroFinalizar, setErroFinalizar] = useState("");
    const [modalCancelar, setModalCancelar] = useState(false);
    const [modalFinalizar, setModalFinalizar] = useState(false);
    const [etapaAtual, setEtapaAtual] = useState(1);
    const router = useRouter();
    
    function abrirSeletorArquivo() {
        arquivoInputRef.current?.click();
    }

    async function handleArquivoSelecionado(e: ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0];
        if (!arquivo) return;

        setImportando(true);
        setResumoImportacao(null);

        try {
            const texto = await arquivo.text();
            const linhas = texto
                .split(/\r?\n/)
                .map((linha) => linha.trim())
                .filter(Boolean);

            // detecta e pula cabeçalho, caso a primeira célula não seja um número
            const primeiraCelula = linhas[0]?.split(/[;,]/)[0]?.trim();
            const temCabecalho = primeiraCelula && isNaN(Number(primeiraCelula));
            const linhasDeDados = temCabecalho ? linhas.slice(1) : linhas;

            const pares = linhasDeDados
                .map((linha) => {
                    const [codigo, quantidade] = linha.split(/[;,]/).map((c) => c.trim());
                    return { codigo, quantidade: Number(quantidade) };
                })
                .filter((p) => p.codigo && p.quantidade > 0);

            if (pares.length === 0) {
                setResumoImportacao("Nenhuma linha válida encontrada no arquivo.");
                return;
            }

            const catalogo = await getProducts();

            let importados = 0;
            const naoEncontrados: string[] = [];
            const novosItens: ItemPedido[] = [];

            pares.forEach(({ codigo, quantidade }) => {
                const produto = catalogo.find(
                    (p) =>
                        String(p.PRO_CODIGO) === codigo ||
                        p.PRO_CODIGOBAR === codigo
                );

                if (!produto) {
                    naoEncontrados.push(codigo);
                    return;
                }

                novosItens.push({
                    id: produto.PRO_CODIGO,
                    codigo: produto.PRO_CODIGOBAR,
                    descricao: produto.PRO_DESCRICAO,
                    unidade: "UN",
                    estoque: produto.EST_ATUAL,
                    quantidade,
                    preco: produto.PRECO,
                    desconto: 0,
                });
                importados++;
            });

            setItens((atuais) => [...atuais, ...novosItens]);

            setResumoImportacao(
                naoEncontrados.length > 0
                    ? `${importados} item(ns) importado(s). Não encontrados: ${naoEncontrados.join(", ")}.`
                    : `${importados} item(ns) importado(s) com sucesso.`
            );
        } catch {
            setResumoImportacao("Não foi possível ler o arquivo. Verifique o formato (código;quantidade).");
        } finally {
            setImportando(false);
            e.target.value = ""; // permite selecionar o mesmo arquivo de novo, se precisar
        }
    }

    useEffect(() => {
        function handleClickFora(e: MouseEvent) {
            if (descontoGlobalRef.current && !descontoGlobalRef.current.contains(e.target as Node)) {
                setDescontoGlobalAberto(false);
            }
        }
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    function aplicarDescontoGlobal() {
        const valor = Number(descontoGlobalValor);

        if (isNaN(valor) || valor < 0 || valor > 100) return;

        setItens((atuais) => atuais.map((item) => ({ ...item, desconto: valor })));
        setDescontoGlobalAberto(false);
        setDescontoGlobalValor("");
    }

    // --- busca de cliente (debounce simples) ---
    useEffect(() => {
    const timer = setTimeout(() => {
        if (clienteQuery.trim().length < 2) {
            setResultadosCliente([]);
            return;
        }

        getClients(clienteQuery)
            .then(setResultadosCliente)
            .catch(() => setResultadosCliente([]));
    }, 400);

    return () => clearTimeout(timer);
    }, [clienteQuery]);
    
    async function selecionarCliente(cliente: Client) {
        try {
            const clienteCompleto = await getClientById(cliente.CLI_CODIGO);

            setClienteSelecionado(clienteCompleto);
        } catch (error){
            console.error("ERRO AO BUSCAR CLIENTE:", error);

            setClienteSelecionado(cliente);
        }

        setClienteQuery("");
        setResultadosCliente([]);
    }

    // --- produtos do pedido ---
    const [itens, setItens] = useState<ItemPedido[]>([]);
    const [produtoQuery, setProdutoQuery] = useState("");
    const [resultadosProduto, setResultadosProduto] = useState<Product[]>([]);

    // no topo do componente
    const clienteBoxRef = useRef<HTMLDivElement>(null);
    const produtoBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickFora(e: MouseEvent) {
            if (clienteBoxRef.current && !clienteBoxRef.current.contains(e.target as Node)) {
                setResultadosCliente([]);
            }
            if (produtoBoxRef.current && !produtoBoxRef.current.contains(e.target as Node)) {
                setResultadosProduto([]);
            }
        }
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    async function buscarProdutos() {
        if (!produtoQuery.trim()) return;
        const resultados = await getProducts();
        setResultadosProduto(resultados);
    }

    function incluirProduto(produto: Product) {
        setItens((atuais) => [
            ...atuais,
            {
                id: produto.PRO_CODIGO,
                codigo: produto.PRO_CODIGOBAR,
                descricao: produto.PRO_DESCRICAO,
                unidade: "UN",
                estoque: produto.EST_ATUAL,
                quantidade: 1,
                preco: produto.PRECO,
                desconto: 0,
            },
        ]);
        setProdutoQuery("");
        setResultadosProduto([]);
    }
    // substitui a busca manual por uma busca automática enquanto digita
    useEffect(() => {
        const busca = produtoQuery.trim();

        if (busca.length < 2) {
            return;
        }

        const timer = setTimeout(() => {
            getProducts(busca)
                .then((produtos) => {
                    setResultadosProduto(produtos);
                })
                .catch(() => {
                    setResultadosProduto([]);
                });
        }, 300);

        return () => clearTimeout(timer);
    }, [produtoQuery]);

    useEffect(() => {
        getPaymentMethods().then(setFormasPagamento).catch(() => setFormasPagamento([]));
    }, []);

    function atualizarItem(id: number, campo: "quantidade" | "preco" | "desconto", valor: number | "") {
        setItens((atuais) => atuais.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)));
    }

    function excluirItem(id: number) {
        setItens((atuais) => atuais.filter((item) => item.id !== id));
    }

    function limparItens() {
        setItens([]);
    }

    function calcularTotalItem(item: ItemPedido) {
        const quantidade = Number(item.quantidade || 0);
        const preco = Number(item.preco || 0)
        const desconto = Number(item.desconto || 0);
        const subtotal = quantidade * preco;
        return subtotal - subtotal * (desconto / 100);
    }
    function handleIncluir() {
        if (resultadosProduto.length === 1) {
            incluirProduto(resultadosProduto[0]);
        }
    }
    function validarPedido() {
        if (!clienteSelecionado) return "Selecione um cliente.";
        if (!vendedor) return "Selecione o vendedor.";
        if (!condicaoPagamento) return "Selecione a condição de pagamento.";
        if (!formaPagamento) return "Selecione a forma de pagamento.";
        if (itens.length === 0) return "Adicione ao menos um produto.";
        return null;
    }
    function avancarEtapa() {
        setErroFinalizar("");
        if (etapaAtual === 1) {
            if(!clienteSelecionado) {
                setErroFinalizar("Selecione um cliente.");
                return;
            }
            if (!vendedor) {
                setErroFinalizar("Não foi possível identificar o vendedor.");
                return;
            }
        }
        if (etapaAtual === 2) {
            if (itens.length === 0) {
                setErroFinalizar("Adicionar ao menos um produto.");
                return;
            }
            if (!condicaoPagamento) {
                setErroFinalizar("Selecione a condição de pagamento.");
                return;
            }
            if (formaPagamento === "") {
                setErroFinalizar("Selecione a forma de pagamento.");
                return;
            }
        }
        setEtapaAtual((etapa) => Math.min(etapa + 1, 4));
        window.scrollTo({top: 0, behavior: "smooth"});
    }
    function voltarEtapa() {
        setErroFinalizar("");
        setEtapaAtual((etapa) => Math.max(etapa - 1, 1));
        window.scrollTo({top: 0, behavior:"smooth"});
    }
    function handleCancelar() {
        const temDadosPreenchidos =
            clienteSelecionado ||
            itens.length > 0 ||
            observacoesPedido.trim() !== "";

        if (temDadosPreenchidos) {
            setModalCancelar(true);
            return;
        }

        router.push("/pedidos");
    }

    function handleFinalizar() {
        const erroValidacao = validarPedido();

        if (erroValidacao) {
            setErroFinalizar(erroValidacao);
            return;
        }

        setErroFinalizar("");
        setModalFinalizar(true);
    }
    async function confirmarFinalizacao() {
        setModalFinalizar(false);
        setFinalizando(true);

        const formaSelecionada = formasPagamento.find(
            (f) => f.FPG_CODIGO === formaPagamento
        );

        const horaAtual = new Date().toTimeString().slice(0, 8);
        console.log("ITENS DO PEDIDO:", itens);
        console.log("PREÇO:", itens[0]?.preco);
        console.log("DESCONTO DO ITEM:", itens[0]?.desconto);
        console.log("DESCONTO TOTAL:", descontoTotal);
        const payload = {
            id: 0,
            client_id: clienteSelecionado!.CLI_CODIGO,
            provider_id: 0,
            employee_id: Number(vendedor),
            user_id: usuario?.usuCodigo ?? 0,
            store_id: usuario?.storeId ?? 0,
            price_table_id: Number(tabelaPrecos),
            date: dataPedido,
            hour: horaAtual,
            taxes: 0,
            discount: descontoTotal,
            store_note: observacoesPedido,
            payment_method_rate: 0,
            installment: 1,
            payment_method: formaSelecionada?.FPG_DESCRICAO ?? "",
            payment_plan_code: Number(condicaoPagamento),
            payment_date: prevFaturamento || dataPedido,
            interest: 0,
            has_payment: true,
            has_invoice: false,
            products_sold: itens.map((item) => ({
                product_id: Number(item.id),
                quantity: Number(item.quantidade),
                variant_id: 0,
            })),
        };
        console.log("PAYLOAD ENVIADO:", payload);
        try {
            const resposta = await createOrder(payload);
            console.log("RESPOSTA DA API AO CRIAR PEDIDO:", resposta);
            router.push("/pedidos");
        } catch {
            setErroFinalizar(
                "Não foi possível finalizar o pedido. Tente novamente."
            );
        } finally {
            setFinalizando(false);
        }
    }
    function aplicarCodigoPagamento() {
        const codigo = codigoPagamento.trim();
        if (!codigo) {
            setErroCodigoPagamento("");
            return;
        }
        if (codigo === "99") {
            setCondicaoPagamento("99");
            setFormaPagamento(1);
            setErroCodigoPagamento("");
            return;
        }
        const parcela = Number(codigo);

        if (
            /^\d+$/.test(codigo) &&
            Number.isInteger(parcela) &&
            parcela >= 1 &&
            parcela <= 12
        ) {
            setCondicaoPagamento(String(parcela));
            setFormaPagamento(4);
            setErroCodigoPagamento("");
            return;
        }
        setErroCodigoPagamento("Código inválido. Digite 99 ou um código de 1 a 12.");
    }

    // --- totais do pedido ---
    const [frete, setFrete] = useState(0);
    const [outrasDespesas, setOutrasDespesas] = useState(0);

    const subtotal = itens.reduce((soma, item) => soma + Number(item.quantidade || 0) * Number(item.preco || 0), 0);
    const descontoTotal = itens.reduce((soma, item) => soma + Number(item.quantidade || 0) * Number(item.preco || 0) * (Number(item.desconto || 0) / 100), 0);
    const totalPedido = subtotal - descontoTotal + frete + outrasDespesas;

    return (
        <div className="novo-pedido-page" data-active-step={etapaAtual}>
            <div className="novo-pedido-mobile-topo">
                <button
                    type="button"
                    className="novo-pedido-voltar-pedidos"
                    onClick={handleCancelar}
                    aria-label="Voltar para Pedidos"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <div>
                    <h1>Novo Pedido</h1>
                </div>
            </div>
            <div className="novo-pedido-header-desktop">
                <div>
                    <div className="novo-pedido-breadcrumb">
                        Vendas <span>›</span>
                        <Link href="/pedidos" onClick={handleCancelar}>Pedidos de Venda</Link> <span>›</span>
                        <Link href="/novo-pedido" onClick={handleCancelar}>Novo Pedido</Link>
                    </div>
                    <h1>Novo Pedido de Venda</h1>
                    <p>Preencha os dados do cliente, adicione os produtos e finalize o pedido.</p>
                </div>

                <button type="button" className="btn-pedidos-recentes">
                    <FontAwesomeIcon icon={faFileLines} /> Pedidos Recentes <span>▾</span>
                </button>
            </div>
            <div className="pedido-progresso-mobile">
                <div className="pedido-progresso-info">
                    <span>Etapa {etapaAtual} de 4</span>
                    <strong>{Math.round((etapaAtual / 4) * 100)}%</strong>
                </div>
                <div
                    className="pedido-progresso-barra"
                    role="progressbar"
                    aria-label="Progresso do novo pedido"
                    aria-valuemin={1}
                    aria-valuemax={4}
                    aria-valuenow={etapaAtual}
                >
                    <div
                        className="pedido-progresso-preenchimento"
                        style={{width: `${(etapaAtual / 4) * 100}%` }}
                    />
                </div>
                <p>
                    {[
                        "Dados do pedido",
                        "Produtos",
                        "Conferência",
                        "Finalização",
                    ][etapaAtual - 1]}
                </p>
            </div>
            <div className="pedido-stepper-desktop" aria-label="Etapas do novo pedido">
                {[
                    {
                        numero: 1,
                        titulo: "Dados do pedido",
                        descricao: "Cliente e pagamento",
                        icone: faAddressCard,
                    },
                    {
                        numero: 2,
                        titulo: "Produtos",
                        descricao: "Itens do pedido",
                        icone: faBoxesStacked,
                    },
                    {
                        numero: 3,
                        titulo: "Conferência",
                        descricao: "Observações e totais",
                        icone: faClipboardCheck,
                    },
                    {
                        numero: 4,
                        titulo: "Finalização",
                        descricao: "Revisão do pedido",
                        icone: faCheck,
                    },
                ].map((etapa) => (
                    <div
                        key={etapa.numero}
                        className={[
                            "pedido-stepper-item",
                            etapaAtual === etapa.numero ? "ativo" : "",
                            etapaAtual > etapa.numero ? "concluido" : "",
                        ].filter(Boolean).join(" ")}
                        aria-current={etapaAtual === etapa.numero ? "step" : undefined}
                    >
                        <div className="pedido-stepper-icone">
                            {etapaAtual > etapa.numero ? (
                                <FontAwesomeIcon icon={faCheck} />
                            ) : (
                                <FontAwesomeIcon icon={etapa.icone} />
                            )}
                        </div>
                        <div className="pedido-stepper-texto">
                            <span className="pedido-stepper-numero">
                                ETAPA {etapa.numero}
                            </span>
                            <strong>{etapa.titulo}</strong>
                            <small>{etapa.descricao}</small>
                        </div>
                    </div>
                ))}
            </div>
            <section className="novo-pedido-card" data-step="1">
                <div className="cabecalho-grid">
                    <div className="form-group cliente-col">
                        <label>Cliente <span>*</span></label>
                        <div className="cliente-search">
                            <input
                                type="text"
                                placeholder="Pesquise por nome ou CNPJ"
                                value={clienteSelecionado ? `${clienteSelecionado.CLI_CODIGO} - ${clienteSelecionado.CLI_NOME}` : clienteQuery}
                                onChange={(e) => {
                                    setClienteSelecionado(null);
                                    setClienteQuery(e.target.value);
                                }}
                                onBlur={() => {
                                    setTimeout(() => {
                                        setResultadosCliente([]);
                                    }, 150);
                                }}
                            />
                            <FontAwesomeIcon icon={faMagnifyingGlass} />

                            {resultadosCliente.length > 0 && (
                                <ul className="cliente-resultados">
                                    {resultadosCliente.map((c) => (
                                        <li key={c.CLI_CODIGO} onMouseDown={(e) => {
                                            e.preventDefault();
                                            selecionarCliente(c);
                                        }}>
                                            {c.CLI_CODIGO} - {c.CLI_NOME}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {clienteSelecionado && (
                            <div className="cliente-info-card">
                                <span>CPF/CNPJ: {clienteSelecionado.CLI_CPF_CNPJ || "-"}</span>
                                <span>Indentidade: {clienteSelecionado.CLI_IDENTIDADE || "-"}</span>
                                <span>Endereço: {clienteSelecionado.CLI_ENDERECO || "-"}</span>
                                <span>CEP: {clienteSelecionado.CLI_CEP || "-"}</span>
                                <span>UF: {clienteSelecionado.CLI_UF || "-"}</span>
                                <span>Telefone: {clienteSelecionado.CLI_FONE || "-"}</span>
                                <span>E-mail: {clienteSelecionado.CLI_EMAIL || "-"}</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Data do Pedido <span>*</span></label>
                        <input type="date" value={dataPedido} onChange={(e) => handleDataPedidoChange(e.target.value)} disabled />
                    </div>

                    <div className="form-group">
                        <label>Data Base</label>
                        <input 
                            type="date" 
                            value={prevFaturamento}
                            onChange={(e) => setPrevFaturamento(e.target.value)}
                            min={dataPedido} 
                        />
                    </div>

                    <div className="form-group">
                        <label>Nº do Pedido</label>
                        <input type="text" placeholder="(Automático)" disabled />
                    </div>

                    <div className="form-group">
                        <div className="form-group">
                            <label>Vendedor</label>
                            <input
                                type="text"
                                value={user?.name || "Usuário"}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="form-group observacoes-col">
                        <label>Observações</label>
                        <input
                            type="text"
                            placeholder="Ex: Entrega no horário comercial"
                            value={observacoesCabecalho}
                            onChange={(e) => setObservacoesCabecalho(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className="novo-pedido-card itens-pedido-card" data-step="2">
                <div className="itens-pedido-header">
                    <h2>Produtos</h2>
                    <p>Adicione os produtos que farão parte deste pedido.</p>
                </div>

                <div className="produto-abas">
                    <button type="button" className="produto-aba active">Adicionar Produto</button>
                    <button type="button" className="produto-aba">Adicionar por Código de Barras</button>
                </div>

                <div className="produto-pesquisa">
                    <input
                        type="text"
                        placeholder="Digite o código, descrição ou utilize o leitor de código de barras..."
                        value={produtoQuery}
                        onChange={(e) => {
                            const valor = e.target.value;
                            setProdutoQuery(valor);

                            if (!valor.trim()) {
                                setResultadosProduto([]);
                            }
                        }}
                        onBlur={() => {
                            setTimeout(() => {
                                setResultadosProduto([]);
                            }, 150);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleIncluir()}
                    />

                    <button type="button" tabIndex={-1} onClick={handleIncluir}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>

                    {resultadosProduto.length > 0 && (
                        <ul className="produto-resultados">
                            {resultadosProduto.map((p) => (
                                <li key={p.PRO_CODIGO} onMouseDown={(e) => {e.preventDefault(); incluirProduto(p);}}>
                                    {p.PRO_DESCRICAO} — R$ {p.PRECO.toFixed(2)} <FontAwesomeIcon icon={faCartShopping} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="itens-pedido-table">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th><th>Código</th><th>Descrição do Produto</th><th>Un</th>
                                <th>Estoque</th><th>Quantidade *</th><th>Preço Unit. (R$) *</th>
                                <th>Desconto (%) *</th><th>Total (R$)</th><th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itens.length === 0 && (
                                <tr><td colSpan={10}>Nenhum produto adicionado ainda.</td></tr>
                            )}
                            {itens.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.codigo}</td>
                                    <td className="produto-descricao">{item.descricao}</td>
                                    <td>{item.unidade}</td>
                                    <td>{item.estoque}</td>
                                    <td>
                                        <input type="number" min="1" value={item.quantidade}
                                            onChange={(e) => atualizarItem(item.id, "quantidade", e.target.value === "" ? "" : Number(e.target.value))} />
                                    </td>
                                    <td>
                                        <input type="number" min="0" step="0.01" value={item.preco}
                                            onChange={(e) => atualizarItem(item.id, "preco", e.target.value === "" ? "" : Number(e.target.value))} />
                                    </td>
                                    <td>
                                        <input type="number" min="0" max="100" step="0.01" value={item.desconto}
                                            onChange={(e) => atualizarItem(item.id, "desconto", e.target.value === "" ? "" : Number(e.target.value))} />
                                    </td>
                                    <td>R$ {calcularTotalItem(item).toFixed(2)}</td>
                                    <td>
                                        <button type="button" className="btn-excluir-item" onClick={() => excluirItem(item.id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="itens-pedido-acoes">
                    <button type="button" className="btn-limpar-itens" onClick={limparItens}>
                        <FontAwesomeIcon icon={faTrash} /> Limpar Itens
                    </button>

                    <input
                        type="file"
                        accept=".csv,.txt"
                        ref={arquivoInputRef}
                        onChange={handleArquivoSelecionado}
                        style={{ display: "none" }}
                    />

                    <div className="desconto-global-wrapper" ref={descontoGlobalRef}>
                        <button
                            type="button"
                            className="btn-desconto-global"
                            onClick={() => setDescontoGlobalAberto((aberto) => !aberto)}
                        >
                            <FontAwesomeIcon icon={faPercent} /> Aplicar Desconto Global
                        </button>

                        {descontoGlobalAberto && (
                            <div className="desconto-global-popover">
                                <label>Desconto (%) para todos os itens</label>
                                <div className="desconto-global-linha">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        placeholder="Ex: 10"
                                        value={descontoGlobalValor}
                                        onChange={(e) => setDescontoGlobalValor(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && aplicarDescontoGlobal()}
                                        autoFocus
                                    />
                                    <button type="button" onClick={aplicarDescontoGlobal}>Aplicar</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <span className="total-itens-label">Total de Itens: {itens.length}</span>
                </div>

                {resumoImportacao && (
                    <p className="aviso-importacao">{resumoImportacao}</p>
                )}
                <div className="form-group">
                    <label htmlFor="codigoPagamento" className="pagamento-label">
                        Código de pagamento<span>*</span>
                    </label>
                </div>
                <div className="pagamento-grid">
                    <div className="pagamento-group">
                        <input
                            id="codigoPagamento"
                            type="text"
                            inputMode="numeric"
                            placeholder="Digite 99 ou de 1 a 12"
                            value={codigoPagamento}
                            onChange={(e) => {
                                setCodigoPagamento(e.target.value);
                                setErroCodigoPagamento("");
                            }}
                            onBlur={aplicarCodigoPagamento}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    aplicarCodigoPagamento();
                                }
                            }}
                        />
                        {erroCodigoPagamento && (
                            <small className="erro-codigo-pagamento">
                                {erroCodigoPagamento}
                            </small>
                        )}
                    </div>
                    <div className="pagamento-group">
                        <select value={condicaoPagamento} onChange={(e) => setCondicaoPagamento(e.target.value)}>
                            <option value="">Selecione a condição</option>
                            <option value="99">ENT/A VISTA</option>
                            {Array.from({ length:12 }, (_, i) => i + 1).map((codigo) => (
                                <option key={codigo} value={String(codigo)}>
                                    0 + {codigo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="pagamento-group">
                        <select value={formaPagamento} onChange={(e) => {setFormaPagamento(e.target.value === "" ? "" : Number(e.target.value))}}>
                            <option value="">Selecione a forma</option>
                            {formasPagamento.map((f) => (
                                <option key={f.FPG_CODIGO} value={f.FPG_CODIGO}>{f.FPG_CODIGO} - {f.FPG_DESCRICAO}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="novo-pedido-rodape" data-step="3">
                <div className="observacoes-pedido">
                    <label>Observações do Pedido</label>
                    <textarea
                        value={observacoesPedido}
                        onChange={(e) => setObservacoesPedido(e.target.value)}
                        placeholder="Ex: Cliente solicitou entrega na segunda-feira."
                    />
                </div>

                <div className="totais-pedido">
                    <div className="totais-linha"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                    <div className="totais-linha negativo"><span>Desconto</span><span>- R$ {descontoTotal.toFixed(2)}</span></div>
                    <div className="totais-linha"><span>Frete</span><span>R$ {frete.toFixed(2)}</span></div>
                    <div className="totais-linha"><span>Outras Despesas</span><span>R$ {outrasDespesas.toFixed(2)}</span></div>
                    <div className="totais-linha total-final"><span>Total do Pedido</span><span>R$ {totalPedido.toFixed(2)}</span></div>
                </div>
            </section>
            <section className="novo-pedido-card pedido-revisao-mobile" data-step="4">
                <h2>Revise seu pedido</h2>
                <p>Confira as informações antes de confirmar.</p>
                <div className="pedido-revisao-linha">
                    <span>Cliente</span>
                    <strong>{clienteSelecionado?.CLI_NOME || "Não selecionado"}</strong>
                </div>
                <div className="pedido-revisao-linha">
                    <span>Data do pedido</span>
                    <strong>{dataPedido || "Não informada"}</strong>
                </div>
                <div className="pedido-revisao-linha">
                    <span>Produtos adicionados</span>
                    <strong>{itens.length}</strong>
                </div>
                <div className="pedido-revisao-linha">
                    <span>Condição de pagamento</span>
                    <strong>
                        {condicaoPagamento === "1" ? "À Vista" : condicaoPagamento === "2" ? "30 Dias" : condicaoPagamento === "3" ? "30/60 Dias" : "Não selecionada"}
                    </strong>
                </div>
                <div className="pedido-revisao-linha pedido-revisao-total">
                    <span>Total do pedido</span>
                    <strong>R$ {totalPedido.toFixed(2)}</strong>
                </div>
                <p className="pedido-revisao-ajuda">
                    Se precisar corrigir alguma informação, volte à etapa corresondente.
                </p>
            </section>
            {erroFinalizar && <p className="erro-finalizar">{erroFinalizar}</p>}
            {etapaAtual < 4 && (
                <div className="pedido-navegacao-desktop">
                    {etapaAtual === 1 && (
                        <button
                            type="button"
                            className="pedido-btn-voltar"
                            onClick={handleCancelar}
                        >
                            Cancelar
                        </button>
                    )}
                    {etapaAtual >= 2 && (
                        <button
                            type="button"
                            className="pedido-btn-voltar"
                            onClick={voltarEtapa}
                            disabled={etapaAtual === 1}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Voltar
                        </button>
                    )}
                    <span className="pedido-navegacao-contador">
                        Etapa {etapaAtual} de 4
                    </span>
                    <button
                        type="button"
                        className="pedido-btn-continuar"
                        onClick={avancarEtapa}
                    >
                        {etapaAtual === 3 ? "Revisar pedido" : "Continuar"}
                        <span aria-hidden="true"></span>
                    </button>
                </div>
            )}
            {modalCancelar && (
                <div className="modal-overlay">
                    <div className="modal-confirmacao">
                        <h2>Cancelar pedido?</h2>

                        <p>
                            Tem certeza que deseja cancelar o preenchimento deste pedido?
                        </p>

                        <p className="modal-aviso">
                            Todos os dados preenchidos serão perdidos.
                        </p>

                        <div className="modal-acoes">
                            <button
                                type="button"
                                className="modal-btn-voltar"
                                onClick={() => setModalCancelar(false)}
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                className="modal-btn-confirmar-cancelamento"
                                onClick={() => {
                                    setModalCancelar(false);
                                    router.push("/pedidos");
                                }}
                            >
                                Sim, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalFinalizar && (
                <div className="modal-overlay">
                    <div className="modal-confirmacao modal-resumo">
                        <h2>Confirmar pedido</h2>

                        <p>
                            Confira os dados abaixo antes de finalizar o pedido.
                        </p>

                        <div className="resumo-pedido">
                            <div className="resumo-linha">
                                <span>Cliente</span>
                                <strong>
                                    {clienteSelecionado?.CLI_NOME}
                                </strong>
                            </div>

                            <div className="resumo-linha">
                                <span>Vendedor</span>
                                <strong>
                                    {user?.name || "Usuário"}
                                </strong>
                            </div>

                            <div className="resumo-linha">
                                <span>Quantidade de produtos</span>
                                <strong>
                                    {itens.length}
                                </strong>
                            </div>

                            <div className="resumo-linha">
                                <span>Subtotal</span>
                                <strong>
                                    R$ {subtotal.toFixed(2)}
                                </strong>
                            </div>

                            <div className="resumo-linha">
                                <span>Desconto</span>
                                <strong>
                                    - R$ {descontoTotal.toFixed(2)}
                                </strong>
                            </div>

                            <div className="resumo-linha resumo-total">
                                <span>Total do pedido</span>
                                <strong>
                                    R$ {totalPedido.toFixed(2)}
                                </strong>
                            </div>
                        </div>

                        <div className="modal-acoes">
                            <button
                                type="button"
                                className="modal-btn-voltar"
                                onClick={() => setModalFinalizar(false)}
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                className="modal-btn-confirmar"
                                onClick={confirmarFinalizacao}
                            >
                                Confirmar pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="novo-pedido-footer" data-step="4">
                <button type="button" className="btn-cancelar" onClick={handleCancelar}>
                    Cancelar
                </button>

                <div className="acoes-finais">
                    <button type="button" className="btn-salvar-orcamento" disabled>
                        <FontAwesomeIcon icon={faFileLines} /> Salvar como Orçamento
                    </button>

                    <button
                        type="button"
                        className="btn-finalizar-pedido"
                        onClick={handleFinalizar}
                        disabled={finalizando}
                    >
                        <FontAwesomeIcon icon={faCartShopping} />
                        {finalizando ? "Finalizando..." : "Finalizar Pedido"}
                    </button>
                </div>
            </div>
            {etapaAtual < 4 && (
                <div className="pedido-navegacao-mobile">
                    <button
                        type="button"
                        className="pedido-btn-voltar"
                        onClick={voltarEtapa}
                        disabled={etapaAtual === 1}
                    >
                        Voltar
                    </button>
                    <button
                        type="button"
                        className="pedido-btn-continuar"
                        onClick={avancarEtapa}
                    >
                        {etapaAtual === 3 ? "Revisar pedido" : "Continuar"}
                        <span aria-hidden="true"> →</span>
                    </button>
                </div>
            )}
        </div>
    );
}