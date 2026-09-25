"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "@/styles/novo-pedido.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faFileLines, faMagnifyingGlass, faPercent, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getClients, Client } from "@/app/lib/clients";
import { getProducts, Product } from "@/app/lib/products";
import { getLoggedUser } from "@/app/lib/auth";
import { createOrder, getOrders } from "../lib/orders";
import { getPaymentMethods, PaymentMethod } from "@/app/lib/payment-methods";
import { useRouter } from "next/navigation";

interface ItemPedido {
    id: number;
    codigo: string;
    descricao: string;
    unidade: string;
    estoque: number;
    quantidade: number;
    preco: number;
    desconto: number;
}

export default function NovoPedidoPage() {
    const usuario = getLoggedUser();

    // --- dados do cabeçalho ---
    const [clienteQuery, setClienteQuery] = useState("");
    const [resultadosCliente, setResultadosCliente] = useState<Client[]>([]);
    const [clienteSelecionado, setClienteSelecionado] = useState<Client | null>(null);

    const [dataPedido, setDataPedido] = useState(new Date().toISOString().slice(0, 10));
    const [prevFaturamento, setPrevFaturamento] = useState("");
    const [tabelaPrecos, setTabelaPrecos] = useState("");
    const [condicaoPagamento, setCondicaoPagamento] = useState("");
    const [tipoFrete, setTipoFrete] = useState("");
    const [observacoesCabecalho, setObservacoesCabecalho] = useState("");
    const [observacoesPedido, setObservacoesPedido] = useState("");
    const [vendedor, setVendedor] = useState<number | "">("");
    const [vendedores, setVendedores] = useState<{ codigo: number; nome: string }[]>([]);
    const [importando, setImportando] = useState(false);
    const arquivoInputRef = useRef<HTMLInputElement>(null);
    const [resumoImportacao, setResumoImportacao] = useState<string | null>(null);
    const [descontoGlobalAberto, setDescontoGlobalAberto] = useState(false);
    const [descontoGlobalValor, setDescontoGlobalValor] = useState("");
    const descontoGlobalRef = useRef<HTMLDivElement>(null);
    const [formaPagamento, setFormaPagamento] = useState<number | "">("");
    const [formasPagamento, setFormasPagamento] = useState<PaymentMethod[]>([]);
    const [finalizando, setFinalizando] = useState(false);
    const [erroFinalizar, setErroFinalizar] = useState("");
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

    useEffect(() => {
        getOrders()
            .then((pedidos) => {
                const mapa = new Map<number, string>();
                pedidos.forEach((p) => {
                    if (p.FUN_CODIGO && p.FUN_NOME) mapa.set(p.FUN_CODIGO, p.FUN_NOME);
                });
                setVendedores(Array.from(mapa, ([codigo, nome]) => ({ codigo, nome })));
            })
            .catch(() => setVendedores([]));
    }, []);

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
    

    function selecionarCliente(cliente: Client) {
        setClienteSelecionado(cliente);
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
        const timer = setTimeout(() => {
            const busca = produtoQuery.trim().toLowerCase();

            if (busca.length < 2) {
                setResultadosProduto([]);
                return;
            }

            getProducts()
                .then((produtos) => {
                    const resultados = produtos.filter((produto) => {
                        const descricao = produto.PRO_DESCRICAO?.toLowerCase() ?? "";
                        const codigo = String(produto.PRO_CODIGO ?? "").toLowerCase();
                        const codigoBarras =
                            produto.PRO_CODIGOBAR?.toLowerCase() ?? "";

                        return (
                            descricao.includes(busca) ||
                            codigo.includes(busca) ||
                            codigoBarras.includes(busca)
                        );
                    });

                    setResultadosProduto(resultados);
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

    function atualizarItem(id: number, campo: "quantidade" | "preco" | "desconto", valor: number) {
        setItens((atuais) => atuais.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)));
    }

    function excluirItem(id: number) {
        setItens((atuais) => atuais.filter((item) => item.id !== id));
    }

    function limparItens() {
        setItens([]);
    }

    function calcularTotalItem(item: ItemPedido) {
        const subtotal = item.quantidade * item.preco;
        return subtotal - subtotal * (item.desconto / 100);
    }
    function handleIncluir() {
        if (resultadosProduto.length === 1) {
            incluirProduto(resultadosProduto[0]);
        } else if (resultadosProduto.length > 1) {
            // já está mostrando a lista, não faz nada — usuário clica no item certo
        }
    }
    function validarPedido() {
        if (!clienteSelecionado) return "Selecione um cliente.";
        if (!vendedor) return "Selecione o vendedor.";
        if (!condicaoPagamento) return "Selecione a condição de pagamento.";
        if (!formaPagamento) return "Selecione a forma de pagamento.";
        if (!tabelaPrecos) return "Selecione a tabela de preços.";
        if (itens.length === 0) return "Adicione ao menos um produto.";
        return null;
    }
    function handleCancelar() {
        const temDadosPreenchidos = clienteSelecionado || itens.length > 0 || observacoesPedido.trim() !== "";

        if (temDadosPreenchidos) {
            const confirmar = window.confirm("Tem certeza que deseja cancelar? Os dados preenchidos serão perdidos.");
            if (!confirmar) return;
        }

        router.push("/pedidos");
    }

    async function handleFinalizar() {
        const erroValidacao = validarPedido();
        if (erroValidacao) {
            setErroFinalizar(erroValidacao);
            return;
        }

        setErroFinalizar("");
        setFinalizando(true);

        const formaSelecionada = formasPagamento.find((f) => f.FPG_CODIGO === formaPagamento);
        const horaAtual = new Date().toTimeString().slice(0, 8);

        const payload = {
            id: 0, // backend deve gerar o número real do pedido
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
            installment: 1, // ⚠️ ajuste conforme a regra real de parcelas da sua condição de pagamento
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

        try {
            await createOrder(payload);
            router.push("/pedidos");
        } catch {
            setErroFinalizar("Não foi possível finalizar o pedido. Tente novamente.");
        } finally {
            setFinalizando(false);
        }
    }

    // --- totais do pedido ---
    const [frete, setFrete] = useState(0);
    const [outrasDespesas, setOutrasDespesas] = useState(0);

    const subtotal = itens.reduce((soma, item) => soma + item.quantidade * item.preco, 0);
    const descontoTotal = itens.reduce((soma, item) => soma + item.quantidade * item.preco * (item.desconto / 100), 0);
    const totalPedido = subtotal - descontoTotal + frete + outrasDespesas;

    return (
        <div className="novo-pedido-page">
            <div className="novo-pedido-header">
                <div>
                    <div className="novo-pedido-breadcrumb">
                        Vendas <span>›</span>
                        <Link href="/pedidos">Pedidos de Venda</Link> <span>›</span>
                        <Link href="/novo-pedido">Novo Pedido</Link>
                    </div>
                    <h1>Novo Pedido de Venda</h1>
                    <p>Preencha os dados do cliente, adicione os produtos e finalize o pedido.</p>
                </div>

                <button type="button" className="btn-pedidos-recentes">
                    <FontAwesomeIcon icon={faFileLines} /> Pedidos Recentes <span>▾</span>
                </button>
            </div>

            <section className="novo-pedido-card">
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
                            />
                            <FontAwesomeIcon icon={faMagnifyingGlass} />

                            {resultadosCliente.length > 0 && (
                                <ul className="cliente-resultados">
                                    {resultadosCliente.map((c) => (
                                        <li key={c.CLI_CODIGO} onClick={() => selecionarCliente(c)}>
                                            {c.CLI_CODIGO} - {c.CLI_NOME}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {clienteSelecionado && (
                            <div className="cliente-info-card">
                                <span>CNPJ: —</span>
                                <span>IE: —</span>
                                <span>Endereço: {clienteSelecionado.CLI_ENDERECO}</span>
                                <span>Limite de Crédito: —</span>
                                <span>Saldo: —</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Data do Pedido <span>*</span></label>
                        <input type="date" value={dataPedido} onChange={(e) => setDataPedido(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Prev. Faturamento</label>
                        <input type="date" value={prevFaturamento} onChange={(e) => setPrevFaturamento(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Nº do Pedido</label>
                        <input type="text" placeholder="(Automático)" disabled />
                    </div>

                    <div className="form-group">
                        <label>Tabela de Preços <span>*</span></label>
                        <select value={tabelaPrecos} onChange={(e) => setTabelaPrecos(e.target.value)}>
                            <option value="">Selecione a tabela</option>
                            <option value="1">Varejo</option>
                            <option value="2">Atacado</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Condição de Pagamento <span>*</span></label>
                        <select value={condicaoPagamento} onChange={(e) => setCondicaoPagamento(e.target.value)}>
                            <option value="">Selecione a condição</option>
                            <option value="1">À Vista</option>
                            <option value="2">30 Dias</option>
                            <option value="3">30/60 Dias</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Forma de Pagamento <span>*</span></label>
                        <select value={formaPagamento} onChange={(e) => setFormaPagamento(Number(e.target.value))}>
                            <option value="">Selecione</option>
                            {formasPagamento.map((f) => (
                                <option key={f.FPG_CODIGO} value={f.FPG_CODIGO}>{f.FPG_DESCRICAO}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Vendedor <span>*</span></label>
                        <select value={vendedor} onChange={(e) => setVendedor(Number(e.target.value))}>
                            <option value="">Selecione o vendedor</option>
                            {vendedores.map((v) => (
                                <option key={v.codigo} value={v.codigo}>{v.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Tipo de Frete</label>
                        <select value={tipoFrete} onChange={(e) => setTipoFrete(e.target.value)}>
                            <option value="">Selecione</option>
                            <option value="CIF">CIF</option>
                            <option value="FOB">FOB</option>
                        </select>
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

            <section className="novo-pedido-card itens-pedido-card">
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
                        onChange={(e) => setProdutoQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleIncluir()}
                    />

                    <button type="button" tabIndex={-1}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>

                    {resultadosProduto.length > 0 && (
                        <ul className="produto-resultados">
                            {resultadosProduto.map((p) => (
                                <li key={p.PRO_CODIGO} onClick={() => incluirProduto(p)}>
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
                                            onChange={(e) => atualizarItem(item.id, "quantidade", Number(e.target.value))} />
                                    </td>
                                    <td>
                                        <input type="number" min="0" step="0.01" value={item.preco}
                                            onChange={(e) => atualizarItem(item.id, "preco", Number(e.target.value))} />
                                    </td>
                                    <td>
                                        <input type="number" min="0" max="100" step="0.01" value={item.desconto}
                                            onChange={(e) => atualizarItem(item.id, "desconto", Number(e.target.value))} />
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

                    <button type="button" className="btn-importar-itens" onClick={abrirSeletorArquivo} disabled={importando}>
                        <FontAwesomeIcon icon={faFileLines} /> {importando ? "Importando..." : "Importar Itens"}
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
            </section>

            <section className="novo-pedido-rodape">
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

            {erroFinalizar && <p className="erro-finalizar">{erroFinalizar}</p>}

            <div className="novo-pedido-footer">
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
        </div>
    );
}