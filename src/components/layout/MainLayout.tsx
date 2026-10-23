"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar/Sidebar";
import { Header } from "./header/Header";
import "@/styles/layout/MainLayout.css";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return (
            <main className="page-context animacao-entrada-pagina">
                {children}
            </main>
        );
    }

    return (
        <div className="main-layout">

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div
                className={`main-content ${
                    isSidebarOpen
                        ? "sidebar-open"
                        : "sidebar-closed"
                }`}
            >

                <Header
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                />

                <main key={pathname} className="page-content animacao-entrada-pagina">
                    {children}
                </main>

            </div>

        </div>
    );
}