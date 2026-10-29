"use client";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import type { Client } from "@/app/lib/clients";
import type { Order } from "@/app/lib/orders";
import { createPortal } from "react-dom";
import Select from "../ui/Select";
import type { SelectOption } from "../ui/Select";

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
    const opcoesClientes: SelectOption[] = [
        {
            value: "",
            label: "Todos os clientes",
        },
        ...clientes.map((cliente) => ({
            value: String(cliente.CLI_CODIGO),
            label: cliente.CLI_NOME,
        })),
    ];
    const opcoesStatus: SelectOption[] = [
        { value: "", label: "Todos" },
        { value: "1", label: "Aguardando Faturamento" },
        { value: "2", label: "Em Separação" },
        { value: "3", label: "Faturado" },
        { value: "4", label: "Cancelado" },
    ];
    const opcoesVendedores: SelectOption[] = [
        { value: "", label: "Todos"},
        ...Array.from(
            new Map(
                pedidos.map((pedido) => [
                    String(pedido.FUN_CODIGO),
                    pedido.FUN_NOME,
                ])
            ).entries()
        ).map(([codigo, nome]) => ({
            value: codigo,
            label: nome,
        })),
    ];
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
                    <Select 
                        label="Cliente"
                        name="filtroCliente"
                        value={filtroCliente}
                        onChange={setFiltroCliente}
                        options={opcoesClientes}
                        searchable
                    />
                </div>
                <div>
                    <Select 
                        label="Status"
                        name="filtroStatus"
                        value={filtroStatus}
                        onChange={setFiltroStatus}
                        options={opcoesStatus}
                    />
                </div>
                <div>
                    <Select 
                        label="Vendedor"
                        name="filtroVendedor"
                        value={filtroVendedor}
                        onChange={setFiltroVendedor}
                        options={opcoesVendedores}
                        searchable
                    />
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