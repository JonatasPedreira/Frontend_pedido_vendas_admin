"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
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
    faChevronDown,
    faXmark,
    faEllipsis,
    faUser,
    faChartPie,
    faGaugeHigh,
    faTableCellsLarge,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import "@/styles/layout/Sidebar.css";
import Image from "next/image";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}
interface MenuLink {
    label: string;
    href: string;
}
interface MenuGroup {
    label: string;
    icon: IconDefinition;
    links: MenuLink[];
}
const MenuGroups: MenuGroup[] = [
    {
        label: "Vendas",
        icon: faCartShopping,
        links: [
            { label: "Pedidos de Venda", href: "/pedidos" },
            { label: "Orçamentos", href: "/orcamentos" },
            { label: "Cond. de Pagamento", href: "/cond_paga" },
            { label: "Tabelas de Preço", href: "/tabelas_preco" },
        ],
    },
];
const mobileItems = [
    {label: "Início", href: "/", icon: faHouse },
    {label: "Realatórios", href: "/relatorios", icon: faChartPie },
    {label: "Dashbard", href: "/dashboard", icon: faTableCellsLarge },
    {label: "Perfil", href: "/perfil", icon: faUser },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [openGroup, setOpenGroup] = useState<string | null>("Vendas");
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [openMobileGroup, setOpenMobileGroup] = useState<string| null>(null);
    const { user, logoutUser } = useAuth();

    const isActive = (href: string) => 
        href !== "#" && (pathname === href || (href !== "/" && pathname.startsWith(`$(href)/`)));

    const groupIsActive = (group: MenuGroup) => 
        group.links.some((link) => isActive(link.href));

    const closeMore = () => {
        setIsMoreOpen(false);
        setOpenMobileGroup(null);
    };
    const renderGroupLinks = (
        group: MenuGroup,
        mobile = false
    ) => (
        <ul className={mobile ? "more-submenu" : "submenu"}>
            {group.links.map((link) => (
                <li key={`${group.label}-${link.label}`}>
                    {link.href === "#" ? (
                        <span className="sidebar-placeholder">
                            {link.label}
                        </span>
                    ): (
                        <Link
                            href={link.href}
                            className={isActive(link.href) ? "active" : ""}
                            onClick={() => {
                                onClose();
                                if (mobile) closeMore();
                            }}
                        >
                            {link.label}
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    );
    return (
        <>
            {/* Sidebar completa: desktop */}
            <aside
                className={`sidebar desktop-sidebar ${
                    isOpen ? "block" : "hidden"
                }`}
            >
                <section className="side-sec">
                    <div className="logo">
                        <Image 
                            src="/image/Logo.fw.png"
                            alt="Logo GestorERP"
                            width={40}
                            height={40}
                            className="sidebar-logo-image"
                            priority
                        />
                        <strong>Gestor<span>ERP</span></strong>
                    </div>
                    <ul className="sidebar-menu">
                        <li>
                            <Link
                                href={"/"}
                                className={pathname === "/" ? "active" : ""}
                            >
                                <FontAwesomeIcon icon={faHouse} />
                                <span>Início</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/dashboard"
                                className={pathname === "/dashboard" ? "active" : ""}
                            >
                                <FontAwesomeIcon icon={faTableColumns} />
                                <span>Dashboard</span>
                            </Link>
                        </li>

                        {MenuGroups.map((group) => {
                            const active = groupIsActive(group);
                            const expanded = openGroup === group.label;

                            return (
                                <li key={group.label} className={`menu-group ${active ? "active": ""}`}>
                                    <button
                                        type="button"
                                        className="menu-button"
                                        aria-expanded={expanded}
                                        onClick={() => setOpenGroup(expanded ? null : group.label)}
                                    >
                                        <FontAwesomeIcon icon={group.icon} />
                                        <span>{group.label}</span>
                                        <FontAwesomeIcon
                                            className={`group-chevron ${expanded ? "rotated" : ""}`}
                                            icon={faChevronDown}
                                        />
                                    </button>
                                    {expanded && renderGroupLinks(group)}
                                </li>
                            );
                        })}
                        <li>
                            <Link
                                href="/clientes"
                                className={pathname === "/clientes" ? "active" : ""}
                            >
                                <FontAwesomeIcon icon={faUsers} />
                                <span>Clientes</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/diagnostico-pagamentos"
                                className={pathname === "/configuracoes" ? "active" : ""}
                            >
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

            <nav className="mobile-bottom-nav" aria-label="Navegação Principal">
                    {mobileItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`mobile-nav-item ${isActive(item.href) ? "active" : ""}`}
                            onClick={closeMore}
                        >
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <button
                        type="button"
                        className={`mobile-nav-item mobile-more-button ${isMoreOpen ? "active" : ""}`}
                        aria-expanded={isMoreOpen}
                        aria-label="Mais opções"
                        onClick={() => setIsMoreOpen((previous) => !previous)}
                    >
                        <FontAwesomeIcon icon={isMoreOpen ? faXmark : faEllipsis} />
                        <span>Mais</span>
                    </button>
            </nav>
            {isMoreOpen && (
                <>
                    <button 
                        type="button"
                        className="mobile-more-backdrop"
                        aria-label="Fechar menu"
                        onClick={closeMore}
                    />
                    <section
                        className="mobile-more-panel"
                        aria-label="Outras áreas do sistema"
                    >
                        <div className="mobile-more-header">
                            <div>
                                <h2>Mais opções</h2>
                                <p>Outras áreas do GestorERP</p>
                            </div>
                            <button
                                type="button"
                                aria-label="Fechar menu"
                                onClick={closeMore}
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <div className="mobile-more-list">
                            <Link
                                href="/"
                                className="mobile-more-dashboard"
                                onClick={closeMore}
                            >
                                <FontAwesomeIcon icon={faHouse} />
                                <span>Inicio</span>
                            </Link>
                            {MenuGroups.map((group) => {
                                const expanded = openMobileGroup === group.label;
                                return (
                                    <div
                                        className={`mobile-more-group ${groupIsActive(group) ? "active" :"" }`}
                                        key={`mobile-${group.label}`}
                                    >
                                        <button
                                            type="button"
                                            className="mobile-more-group-button"
                                            aria-expanded={expanded}
                                            onClick={() => setOpenMobileGroup(expanded ? null : group.label)}
                                        >
                                            <FontAwesomeIcon icon={group.icon} />
                                            <span>{group.label}</span>
                                            <FontAwesomeIcon className={`group-chevron ${expanded ? "rotaded" : ""}`} icon={faChevronDown} />
                                        </button>
                                        {expanded && renderGroupLinks(group, true)}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </>
            )}
        </>
    );
}