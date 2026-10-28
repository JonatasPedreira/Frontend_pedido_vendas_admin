"use client";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import type { Client } from "@/app/lib/clients";
import type { Order } from "@/app/lib/orders";
import { createPortal } from "react-dom";

interface FiltrosPedidosProps {
    clientes: Client[];
    pedidos: Order[];
    filtroCliente: string;
    setFiltroCliente: (valor: string) => void;
    filtroStatus: string;
    setFiltroStatus: (valor: string) => void;
    filtroVendedor: string;
    setFiltroVendedor: (valor: string) => void;
    filtroDataInicio: string;
    setFiltroDataInicio: (valor: string) => void;
    filtroDataFim: string;
    setFiltroDataFim: (valor: string) => void;
    filtrosAbertos: boolean;
    setFiltrosAbertos: (aberto: boolean) => void;
    filtrarPedidos: () => void;
    limparFiltros: () => void;
    filtrando: boolean;
    limpandoFiltro: boolean;
}
export default function FiltrosPedidos({
    clientes,
    pedidos,
    filtroCliente,
    setFiltroCliente,
    filtroStatus,
    setFiltroStatus,
    filtroVendedor,
    setFiltroVendedor,
    filtroDataInicio,
    setFiltroDataInicio,
    filtroDataFim,
    setFiltroDataFim,
    filtrosAbertos,
    setFiltrosAbertos,
    filtrarPedidos,
    limparFiltros,
    filtrando,
    limpandoFiltro,
}: FiltrosPedidosProps) {
    const [portalPronto, setPortalPronto] = useState(false);
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 760px)");
        const verificarTela = () => {
            setIsMobile(mediaQuery.matches);
        }
        verificarTela();
        mediaQuery.addEventListener("change", verificarTela);
        return () => {
            mediaQuery.removeEventListener("change", verificarTela);
        }
    }, []);
    const painelFiltros = (
        <>
            {filtrosAbertos && (
                <button 
                    type="button"
                    className="mobile-filters-backdrop"
                    aria-label="Fechar filtros"
                    onClick={() => setFiltrosAbertos(false)}
                />
            )}
            <section id="pedidos-filters-panel" className={`filters-card ${filtrosAbertos ? "filters-open" : ""}`}>
                <div className="mobile-filters-header">
                    <div>
                        <h2>Filtros</h2>
                        <p>Refine sua busca de pedidos</p>
                    </div>
                    <button
                        type="button"
                        className="mobile-filters-close"
                        onClick={() => setFiltrosAbertos(false)}
                        aria-label="Fechar filtros"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
                <div className="periodo-filtro">
                    <label>Período</label>
                    <div className="periodo-input">
                        <input
                            type="date"
                            value={filtroDataInicio}
                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                            placeholder="dd/mm/aaaa"
                        />
                        <span>até</span>
                        <input 
                            type="date"
                            value={filtroDataFim}
                            onChange={(e) => setFiltroDataFim(e.target.value)}
                            placeholder="dd/mm/aaaa"
                        />
                    </div>
                </div>
                <div>
                    <label>Cliente</label>
                    <select
                        value={filtroCliente}
                        onChange={(e) => setFiltroCliente}
                    >
                        <option value="">Todos os clientes</option>
                        {clientes.map((cliente) => (
                            <option
                                key={cliente.CLI_CODIGO}
                                value={cliente.CLI_CODIGO}
                            >
                                {cliente.CLI_NOME}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Status</label>
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus}
                    >
                        <option value="">Todos</option>
                        <option value="1">Aguardando Faturamento</option>
                        <option value="2">Em Separação</option>
                        <option value="3">Faturado</option>
                        <option value="4">Cancelado</option>
                    </select>
                </div>
                <div>
                    <label>Vendedor</label>
                    <select
                        value={filtroVendedor}
                        onChange={(e) => setFiltroVendedor(e.target.value)}
                    >
                        <option value="">Todos</option>
                        {[...new Map(
                            pedidos.map((pedido) => [
                                pedido.FUN_CODIGO,
                                pedido.FUN_NOME,
                            ])
                        ).entries()].map(([codigo, nome]) => (
                            <option key={codigo} value={codigo}>
                                {nome}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="button"
                    className="filter-button"
                    onClick={filtrarPedidos}
                    disabled={filtrando}
                >
                    {filtrando ? (
                        <>
                            <span className="button-spinner" />
                            Filtrando...
                        </>
                    ) : ("Filtrar")}
                </button>
                <button
                    type="button"
                    className="clear-button"
                    onClick={limparFiltros}
                    disabled={limpandoFiltro}
                >
                    {limpandoFiltro ? "Limpando..." : "Limpar filtros"}
                </button>
            </section>
        </>
    );
    if (isMobile === null) {
        return null;
    }
    if (isMobile) {
        return filtrosAbertos ? createPortal(painelFiltros, document.body) : null;
    }
    return painelFiltros;
}