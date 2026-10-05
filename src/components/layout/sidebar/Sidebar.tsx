"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    faHouse,
    faTableColumns,
    faCartShopping,
    faWarehouse,
    faDollarSign,
    faFileInvoiceDollar,
    faReceipt,
    faChartColumn,
    faUserGroup,
    faGear,
    faAngleUp,
    faAngleDown,
    faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/styles/layout/Sidebar.css";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {

    const pathname = usePathname();
    const isVendasActive = pathname.startsWith("/pedidos") || pathname.startsWith("/orcamentos") || pathname.startsWith("/clientes") || pathname.startsWith("/cond_paga") || pathname.startsWith("/tabelas_preco");
    const [isVendasOpen, setIsVendasOpen] = useState(isVendasActive);
    const [isComprasOpen, setIsComprasOpen] = useState(false);
    const [isEstoqueOpen, setIsEstoqueOpen] = useState(false);
    const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(false);
    const [isFaturamentoOpen, setIsFaturamentoOpen] = useState(false);
    const [isFiscalOpen, setIsFiscalOpen] = useState(false);
    const [isCadastroOpen, setIsCadastroOpen] = useState(false);
    const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);
    const [isMobileVisible, setIsMobileVisible] = useState(true);

    useEffect(() => {
        let ultimaPosicao = window.scrollY;

        function controlarScroll() {
            const posicaoAtual = window.scrollY;

            if (window.innerWidth <= 800){
                if (posicaoAtual > ultimaPosicao && posicaoAtual > 10){
                    setIsMobileVisible(false);
                } else if (posicaoAtual < ultimaPosicao){
                    setIsMobileVisible(true);
                }
            }

            ultimaPosicao = posicaoAtual;
        }

        window.addEventListener("scroll", controlarScroll, {passive: true,});

        return () => {
            window.removeEventListener("scroll", controlarScroll);
        }
    }, []);

    return (
        <aside className={`sidebar ${isOpen ? "block" : "hidden"} ${isMobileVisible ? "mobile-visible" : "mobile-hidden"}`}>
            <section className="side-sec">

                <div className="logo">
                    <div className="logo-icon">
                        <FontAwesomeIcon icon={faDatabase} />
                    </div>

                    <div>
                        <strong>Gestor<span>ERP</span></strong>
                    </div>
                </div>

                <ul className="sidebar-menu">

                    <li>
                        <Link href="/" className={pathname === "/" ? "active" : ""}>
                            <FontAwesomeIcon icon={faHouse} />
                            <span>Início</span>
                        </Link>
                    </li>

                    <li>
                        <Link href="#" className={pathname === "#" ? "active" : ""}>
                            <FontAwesomeIcon icon={faTableColumns} />
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li className={`menu-group ${isVendasActive ? "active": ""}`}>

                        <div className="menu-title">
                            <button className="menu-button" onClick={() => setIsVendasOpen(!isVendasOpen)}>
                                <FontAwesomeIcon icon={faCartShopping} />
                                <span>Vendas</span>
                                {isVendasOpen ? (<FontAwesomeIcon icon={faAngleUp} />): (<FontAwesomeIcon icon={faAngleDown} />)}
                            </button>
                        </div>
                        <ul className={`submenu ${isVendasOpen ? "open" : ""}`}>
                            <li>
                                <Link href="/pedidos" className={pathname === "/pedidos" ? "active" : ""}>Pedidos de Venda</Link>
                            </li>

                            <li>
                                <Link href="#">Orçamentos</Link>
                            </li>

                            <li>
                                <Link href="#">Clientes</Link>
                            </li>

                            <li>
                                <Link href="#">Cond. de Pagamento</Link>
                            </li>

                            <li>
                                <Link href="#">Tabelas de Preço</Link>
                            </li>
                        </ul>

                    </li>

                    <li className="menu-group">

                        <div className="menu-title">
                            <button className="menu-button" onClick={() => setIsComprasOpen(!isComprasOpen)}>
                                <FontAwesomeIcon icon={faCartShopping} />
                                <span>Compras</span>
                                {isComprasOpen ? (<FontAwesomeIcon icon={faAngleUp} />): (<FontAwesomeIcon icon={faAngleDown} />)}
                            </button>
                        </div>
                            <ul className={`submenu ${isComprasOpen ? "open" : ""}`}>
                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>
                        </ul>

                    </li>

                    <li className="menu-group">

                        <div className="menu-title">
                            <button className="menu-button" onClick={() => setIsEstoqueOpen(!isEstoqueOpen)}>
                                <FontAwesomeIcon icon={faWarehouse} />
                                <span>Estoque</span>
                                {isEstoqueOpen ? (<FontAwesomeIcon icon={faAngleUp} />): (<FontAwesomeIcon icon={faAngleDown} />)}
                            </button>
                        </div>
                            <ul className={`submenu ${isEstoqueOpen ? "open" : ""}`}>
                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>
                        </ul>

                    </li>

                    <li className="menu-group">

                        <div className="menu-title">
                            <button className="menu-button" onClick={() => setIsFinanceiroOpen(!isFinanceiroOpen)}>
                                <FontAwesomeIcon icon={faDollarSign} />
                                <span>Financeiro</span>
                                {isFinanceiroOpen ? (<FontAwesomeIcon icon={faAngleUp} />): (<FontAwesomeIcon icon={faAngleDown} />)}
                            </button>
                        </div>
                            <ul className={`submenu ${isFinanceiroOpen ? "open" : ""}`}>
                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>
                        </ul>

                    </li>

                    <li className="menu-group">

                        <div className="menu-title">
                            <button className="menu-button" onClick={() => setIsFaturamentoOpen(!isFaturamentoOpen)}>
                                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                                <span>Faturamento</span>
                                {isFaturamentoOpen ? (<FontAwesomeIcon icon={faAngleUp} />): (<FontAwesomeIcon icon={faAngleDown} />)}
                            </button>
                        </div>
                            <ul className={`submenu ${isFaturamentoOpen ? "open" : ""}`}>
                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>
                        </ul>

                    </li>

                    <li className="menu-group">

                        <div className="menu-title">
                            <button className="menu-button" onClick={() => setIsFiscalOpen(!isFiscalOpen)}>
                                <FontAwesomeIcon icon={faReceipt} />
                                <span>Fiscal</span>
                                {isFiscalOpen ? (<FontAwesomeIcon icon={faAngleUp} />): (<FontAwesomeIcon icon={faAngleDown} />)}
                            </button>
                        </div>
                            <ul className={`submenu ${isFiscalOpen ? "open" : ""}`}>
                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>
                        </ul>

                    </li>

                    <li className="menu-group">

                        <div className="menu-title">
                            <button className="menu-button" onClick={() => setIsCadastroOpen(!isCadastroOpen)}>
                                <FontAwesomeIcon icon={faUserGroup} />
                                <span>Cadastros</span>
                                {isCadastroOpen ? (<FontAwesomeIcon icon={faAngleUp} />): (<FontAwesomeIcon icon={faAngleDown} />)}
                            </button>
                        </div>
                            <ul className={`submenu ${isCadastroOpen ? "open" : ""}`}>
                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>
                        </ul>

                    </li>

                    <li className="menu-group">

                        <div className="menu-title">
                            <button className="menu-button" onClick={() => setIsRelatorioOpen(!isRelatorioOpen)}>
                                <FontAwesomeIcon icon={faChartColumn} />
                                <span>Relatórios</span>
                                {isRelatorioOpen ? (<FontAwesomeIcon icon={faAngleUp} />): (<FontAwesomeIcon icon={faAngleDown} />)}
                            </button>
                        </div>
                            <ul className={`submenu ${isRelatorioOpen ? "open" : ""}`}>
                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>

                            <li>
                                <Link href="#">############</Link>
                            </li>
                        </ul>

                    </li>

                    <li>
                        <Link href="#">
                            <FontAwesomeIcon icon={faGear} />
                            <span>Configurações</span>
                        </Link>
                    </li>

                </ul>

                <div className="sidebar-company">
                    <strong>Empresa Exemplo Ltda</strong>
                    <span>CNPJ 12.345.678/0001-90</span>
                    <span>Versão 1.0.0</span>
                </div>

            </section>
        </aside>
    );
}