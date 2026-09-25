"use client";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faBuilding } from "@fortawesome/free-solid-svg-icons";
import "@/styles/login.css"; // Certifique-se de apontar para a pasta correta do CSS

export default function LoginPage() {
    const { loginUser } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [tenantSlug, setTenantSlug] = useState("empresa");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro("");
        setLoading(true);

        try {
            await loginUser({ tenantSlug, username, password });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErro(err.message);
            } else {
                setErro("Usuário ou senha inválidos.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page-container">
            <div className="login-card">
                
                <div className="login-header">
                    <h1 className="login-logo">
                        <span className="icon-diamond">◇</span>
                        Gestor<span>ERP</span>
                    </h1>
                    <p className="login-subtitle">Acesse sua conta corporativa</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    
                    {/* Input do Tenant / Empresa */}
                    <div className="input-wrapper">
                        <label>Empresa</label>
                        <div className="input-field-icon">
                            <input 
                                type="text" 
                                value={tenantSlug} 
                                onChange={(e) => setTenantSlug(e.target.value)} 
                                placeholder="Slug da Empresa"
                                disabled={loading}
                                required
                            />
                            <FontAwesomeIcon icon={faBuilding} />
                        </div>
                    </div>

                    {/* Input do Usuário */}
                    <div className="input-wrapper">
                        <label>Usuário</label>
                        <div className="input-field-icon">
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                placeholder="Nome do usuário" 
                                disabled={loading}
                                required
                            />
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                    </div>

                    {/* Input da Senha */}
                    <div className="input-wrapper">
                        <label>Senha</label>
                        <div className="input-field-icon">
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Digite sua senha" 
                                disabled={loading}
                                required
                            />
                            <FontAwesomeIcon icon={faLock} />
                        </div>
                    </div>

                    {erro && <p className="login-error">{erro}</p>}

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? "Autenticando..." : "Entrar no Sistema"}
                    </button>
                </form>
            </div>
        </div>
    );
}
