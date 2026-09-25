"use client";

import { useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "@/styles/layout/Header.css";
import Link from "next/link";

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

    return (
        <header className={`main-header ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
            <div className="header-content">
                <button
                    className="menu-toggler-btn"
                    onClick={onMenuClick}
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <div className="search-container">

                    <FontAwesomeIcon icon={faMagnifyingGlass} />

                    <input
                        type="text"
                        placeholder="Pesquisar no sistema (Ctrl + K)"
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />

                </div>

                <div className="header-actions">

                    <button>
                        <FontAwesomeIcon icon={faBell} />
                        <span className="notification">3</span>
                    </button>

                    <button>
                        <FontAwesomeIcon icon={faCircleQuestion} />
                    </button>
                    <div className="user-menu-wrapper">
                        <button className="user-profile" onClick={() => setIsContaOpen(!isContaOpen)}>
                            <div className="user-avatar">{user? getInitials(user.name): "??"}</div>
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