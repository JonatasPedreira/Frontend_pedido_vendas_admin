import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "./contexts/AuthContext"; // Ajuste o caminho se necessário
import "./globals.css"; // Seus estilos globais

export const metadata: Metadata = {
    title: "Sistema de Vendas",
    description: "Sistema de gerenciamento de vendas",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body>
                {/* O Provedor de Autenticação precisa envolver todo o layout */}
                <AuthProvider>
                    <MainLayout>
                        {children}
                    </MainLayout>
                </AuthProvider>
            </body>
        </html>
    );
}
