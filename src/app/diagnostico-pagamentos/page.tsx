
"use client";

import { useCallback, useMemo, useState } from "react";
import { getOrders, type Order } from "../lib/orders";
import "@/styles/diagnostico.css";

interface OpcaoPagamento {
  codigo: number;
  descricao: string;
  ocorrencias: number;
}

type TipoPagamento = "forma" | "condicao";

function agruparOpcoes(
  pedidos: Order[],
  tipo: TipoPagamento
): OpcaoPagamento[] {
  const opcoes = new Map<number, OpcaoPagamento>();

  for (const pedido of pedidos) {
    const codigo =
      tipo === "forma" ? pedido.FP1_CODIGO : pedido.PP1_CODIGO;

    const descricaoOriginal =
      tipo === "forma" ? pedido.FPG_DESCRICAO : pedido.PLP_DESCRICAO;

    if (codigo == null || !Number.isFinite(Number(codigo))) {
      continue;
    }

    const codigoNumerico = Number(codigo);
    const descricao = String(descricaoOriginal ?? "").trim() || "Sem descrição";

    const existente = opcoes.get(codigoNumerico);

    if (existente) {
      existente.ocorrencias += 1;

      if (
        existente.descricao === "Sem descrição" &&
        descricao !== "Sem descrição"
      ) {
        existente.descricao = descricao;
      }
    } else {
      opcoes.set(codigoNumerico, {
        codigo: codigoNumerico,
        descricao,
        ocorrencias: 1,
      });
    }
  }

  return Array.from(opcoes.values()).sort(
    (a, b) => a.codigo - b.codigo
  );
}

function filtrarOpcoes(
  opcoes: OpcaoPagamento[],
  busca: string
): OpcaoPagamento[] {
  const termo = busca.trim().toLocaleLowerCase("pt-BR");

  if (!termo) {
    return opcoes;
  }

  return opcoes.filter(
    (opcao) =>
      String(opcao.codigo).includes(termo) ||
      opcao.descricao.toLocaleLowerCase("pt-BR").includes(termo)
  );
}

export default function DiagnosticoPagamentosPage() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [buscaIniciada, setBuscaIniciada] = useState(false);
  const [erro, setErro] = useState("");
  const [buscaForma, setBuscaForma] = useState("");
  const [buscaCondicao, setBuscaCondicao] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(
    null
  );

  
const carregarPedidos = useCallback(async () => {
  if (carregando) return;

  setBuscaIniciada(true);
  setCarregando(true);
  setErro("");

  try {
    const todosPedidos: Order[] = [];
    let pagina = 1;
    let totalPaginas = 1;

    while (pagina <= totalPaginas && pagina <= 100) {
      const resposta = await getOrders(pagina, 100);

      if (!Array.isArray(resposta.pedidos)) {
        throw new Error(
          "A API retornou uma resposta em formato inesperado."
        );
      }

      if (pagina === 1 && resposta.pedidos.length === 0) {
        break;
      }

      todosPedidos.push(...resposta.pedidos);

      totalPaginas = Math.max(
        1,
        Number(resposta.totalPages) || 1
      );

      // Evita continuar se a API não tiver mais pedidos.
      if (resposta.pedidos.length === 0) {
        break;
      }

      pagina += 1;
    }

    setPedidos(todosPedidos);
    setUltimaAtualizacao(new Date());

    if (pagina > 100 && pagina <= totalPaginas) {
      setErro(
        "A consulta atingiu o limite de 100 páginas. Os pedidos recebidos foram mantidos."
      );
    }
  } catch (error: unknown) {
    setErro(
      error instanceof Error
        ? error.message
        : "Não foi possível consultar os pedidos."
    );
  } finally {
    setCarregando(false);
  }
}, [carregando]);

  const formasPagamento = useMemo(
    () => agruparOpcoes(pedidos, "forma"),
    [pedidos]
  );

  const condicoesPagamento = useMemo(
    () => agruparOpcoes(pedidos, "condicao"),
    [pedidos]
  );

  const formasFiltradas = useMemo(
    () => filtrarOpcoes(formasPagamento, buscaForma),
    [formasPagamento, buscaForma]
  );

  const condicoesFiltradas = useMemo(
    () => filtrarOpcoes(condicoesPagamento, buscaCondicao),
    [condicoesPagamento, buscaCondicao]
  );

  const totalFormasEncontradas = formasPagamento.length;
  const totalCondicoesEncontradas = condicoesPagamento.length;

  return (
    <main className="diagnostico-pagamentos">
      <header className="diagnostico-header">
        <div className="diagnostico-header-texto">
          <h1>Diagnóstico de pagamentos</h1>
          <p>
            Consulte os códigos e as descrições de formas e condições de
            pagamento encontrados nos pedidos da API.
          </p>
        </div>

        <button
          type="button"
          className="diagnostico-atualizar"
          onClick={() => void carregarPedidos()}
          disabled={carregando}
        >
          {carregando
            ? "Consultando API..."
            : pedidos.length > 0
              ? "Atualizar dados"
              : "Carregar dados"}
        </button>
      </header>

      <section className="diagnostico-resumo">
        <article className="diagnostico-card">
          <span className="diagnostico-card-label">Pedidos consultados</span>
          <strong className="diagnostico-card-valor">
            {pedidos.length.toLocaleString("pt-BR")}
          </strong>
          <span className="diagnostico-card-descricao">
            Registros recebidos da API
          </span>
        </article>

        <article className="diagnostico-card">
          <span className="diagnostico-card-label">
            Formas de pagamento
          </span>
          <strong className="diagnostico-card-valor">
            {totalFormasEncontradas.toLocaleString("pt-BR")}
          </strong>
          <span className="diagnostico-card-descricao">
            Códigos distintos encontrados
          </span>
        </article>

        <article className="diagnostico-card">
          <span className="diagnostico-card-label">
            Condições de pagamento
          </span>
          <strong className="diagnostico-card-valor">
            {totalCondicoesEncontradas.toLocaleString("pt-BR")}
          </strong>
          <span className="diagnostico-card-descricao">
            Códigos distintos encontrados
          </span>
        </article>
      </section>

      {ultimaAtualizacao && (
        <p className="diagnostico-ultima-atualizacao">
          Última consulta:{" "}
          {ultimaAtualizacao.toLocaleString("pt-BR")}
        </p>
      )}

      {erro && (
        <section className="diagnostico-erro" role="alert">
          <strong>Não foi possível carregar os dados.</strong>
          <p>{erro}</p>
          <button
            type="button"
            className="diagnostico-tentar-novamente"
            onClick={() => void carregarPedidos()}
            disabled={carregando}
          >
            Tentar novamente
          </button>
        </section>
      )}

      {!buscaIniciada && !carregando && (
        <section className="diagnostico-estado">
          <h2>Pronto para consultar</h2>
          <p>
            Clique em <strong>Carregar dados</strong> para buscar os pedidos
            e identificar os códigos de pagamento que aparecem neles.
          </p>
        </section>
      )}

      {carregando && (
        <section
          className="diagnostico-carregamento"
          aria-live="polite"
        >
          <span className="diagnostico-spinner" />
          <p>Consultando os pedidos da API. Aguarde...</p>
        </section>
      )}

      {buscaIniciada && !carregando && !erro && pedidos.length === 0 && (
        <section className="diagnostico-estado">
          <h2>Nenhum pedido encontrado</h2>
          <p>
            A consulta foi concluída, mas a API não retornou pedidos.
            Verifique se existem registros disponíveis para o usuário
            autenticado.
          </p>
        </section>
      )}

      {buscaIniciada && pedidos.length > 0 && (
        <div className="diagnostico-tabelas">
          <section className="diagnostico-secao">
            <div className="diagnostico-secao-header">
              <div>
                <h2>Formas de pagamento</h2>
                <p>
                  Campo da API: <code>FP1_CODIGO</code> e{" "}
                  <code>FPG_DESCRICAO</code>
                </p>
              </div>

              <span className="diagnostico-contador">
                {formasFiltradas.length} de {totalFormasEncontradas}
              </span>
            </div>

            <div className="diagnostico-busca">
              <input
                type="search"
                value={buscaForma}
                onChange={(event) => setBuscaForma(event.target.value)}
                placeholder="Buscar por código ou descrição..."
                aria-label="Buscar formas de pagamento"
              />
            </div>

            <div className="diagnostico-tabela-container">
              <table className="diagnostico-tabela">
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Descrição</th>
                    <th scope="col">Ocorrências</th>
                  </tr>
                </thead>

                <tbody>
                  {formasFiltradas.map((opcao) => (
                    <tr key={opcao.codigo}>
                      <td>
                        <code>{opcao.codigo}</code>
                      </td>
                      <td>{opcao.descricao}</td>
                      <td>{opcao.ocorrencias}</td>
                    </tr>
                  ))}

                  {formasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={3} className="diagnostico-sem-resultados">
                        Nenhuma forma de pagamento corresponde à busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="diagnostico-secao">
            <div className="diagnostico-secao-header">
              <div>
                <h2>Condições de pagamento</h2>
                <p>
                  Campo da API: <code>PP1_CODIGO</code> e{" "}
                  <code>PLP_DESCRICAO</code>
                </p>
              </div>

              <span className="diagnostico-contador">
                {condicoesFiltradas.length} de {totalCondicoesEncontradas}
              </span>
            </div>

            <div className="diagnostico-busca">
              <input
                type="search"
                value={buscaCondicao}
                onChange={(event) => setBuscaCondicao(event.target.value)}
                placeholder="Buscar por código ou descrição..."
                aria-label="Buscar condições de pagamento"
              />
            </div>

            <div className="diagnostico-tabela-container">
              <table className="diagnostico-tabela">
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Descrição</th>
                    <th scope="col">Ocorrências</th>
                  </tr>
                </thead>

                <tbody>
                  {condicoesFiltradas.map((opcao) => (
                    <tr key={opcao.codigo}>
                      <td>
                        <code>{opcao.codigo}</code>
                      </td>
                      <td>{opcao.descricao}</td>
                      <td>{opcao.ocorrencias}</td>
                    </tr>
                  ))}

                  {condicoesFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={3} className="diagnostico-sem-resultados">
                        Nenhuma condição de pagamento corresponde à busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      <footer className="diagnostico-aviso">
        <strong>Importante</strong>
        <p>
          Esta página agrupa os códigos encontrados nos pedidos retornados
          pela API. Se uma forma ou condição nunca foi usada nos pedidos
          consultados, ela poderá não aparecer. Para descobrir todos os
          códigos cadastrados, será necessário consultar também o endpoint
          de cadastro de formas ou condições de pagamento, caso exista.
        </p>
      </footer>
    </main>
  );
}