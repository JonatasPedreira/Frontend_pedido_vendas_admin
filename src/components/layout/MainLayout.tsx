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
            <main className="w-full min-h-screen bg-white">
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

                <main className="page-content">
                    {children}
                </main>

            </div>

        </div>
    );
}