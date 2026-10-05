"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
    faBars,
    faBell,
    faCircleQuestion,
    faMagnifyingGlass,
    faChevronDown,
    faArrowRightFromBracket,
    faCircleUser,
    faUsersGear,
    faDatabase,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "@/app/lib/theme/ThemeProvider";
import ThemeToggle from "@/components/themetoggle/ThemeToggle";

import "@/styles/layout/Header.css";
import Link from "next/link";
import { faUser } from "@fortawesome/free-regular-svg-icons";

interface HeaderProps {
    onMenuClick: () => void;
    isSidebarOpen: boolean;
}

function getInitials(name: string) {
    if (!name) return "??";

    const names = name.trim().split(" ");

    if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
    }

    return (
        names[0].charAt(0) +
        names[1].charAt(0)
    ).toUpperCase();
}

export function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
    const [termoBusca, setTermoBusca] = useState("");
    const [isContaOpen, setIsContaOpen] = useState(false);
    const { user, logoutUser } = useAuth();
    const { theme } = useTheme();

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const searchInputRef = useRef<HTMLInputElement>(null);

    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent){
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsContaOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleOpenSearch() {
        setSearchOpen(true);
    }

    function handleCloseSearch() {
        setSearchOpen(false);
        setSearchTerm("");
    }

    function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") {
            handleCloseSearch();
        }
    }

    return (
        <header className={`main-header ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
            <div className="header-content">
                <div className="mobile-header-logo">
                    <div className="Mobile-logo-icon">
                        <FontAwesomeIcon icon={faDatabase} />
                    </div>
                    <strong>
                        Gestor<span>ERP</span>
                    </strong>
                </div>
                <button
                    className="menu-toggler-btn"
                    onClick={onMenuClick}
                    aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <div className="search-container desktop-search">

                    <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />

                    <input
                        type="text"
                        placeholder="Pesquisar no sistema (Ctrl + K)"
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />

                </div>

                <div className={`mobile-search ${searchOpen ? "mobile-search-open" : ""}`}>
                    {!searchOpen ? (
                        <button type="button" className="mobile-search-button" onClick={handleOpenSearch} aria-label="Pesquisar">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
                    ) : (
                        <div className="mobile-search-input-wrapper">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="mobile-search-icon" />

                            <input ref={searchInputRef} type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) =>
                                setSearchTerm(e.target.value)
                            } onKeyDown={handleSearchKeyDown} />
                            
                            <button type="button" className="mobile-search-close" onClick={handleCloseSearch} aria-label="Fechar pesquisa">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="header-actions">

                    <ThemeToggle />

                    <button>
                        <FontAwesomeIcon icon={faBell} />
                        <span className="notification">3</span>
                    </button>
 
                    <button>
                        <FontAwesomeIcon icon={faCircleQuestion} />
                    </button>
                    <div className="user-menu-wrapper" ref={userMenuRef}>
                        <button className="user-profile" onClick={() => setIsContaOpen(!isContaOpen)}>
                            <div className="user-avatar">{user && user.name ? getInitials(user.name): <FontAwesomeIcon icon={faUser} />}</div>
                            <div className="user-info">
                                <strong>{user?.name || "Usuário"}</strong>
                                <span>{user?.name || ""}</span>
                            </div>
                            <FontAwesomeIcon icon={faChevronDown} />
                        </button>
                        <ul className={`count-menu ${isContaOpen ? "open" : ""}`}>
                            <li><Link href=""><FontAwesomeIcon icon={faCircleUser} /> Perfil</Link></li>
                            <li><Link href=""><FontAwesomeIcon icon={faUsersGear} /> Mudar de Conta</Link></li>
                            <li><button type="button" onClick={logoutUser}><FontAwesomeIcon icon={faArrowRightFromBracket} /> Sair</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}