"use client";
import { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faBuilding, faDatabase, faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";
import "@/styles/login.css"; // Certifique-se de apontar para a pasta correta do CSS
import Image from "next/image";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function LoginPage() {
    const { loginUser } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [tenantSlug, setTenantSlug] = useState("empresa");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarCarregamento, setMostrarCarregamento] = useState(true);
    const [mostrarLogin, setMostrarLogin] = useState(false);

    const finalizarCarregamento = useCallback(() => {
        setMostrarCarregamento(false);
        window.setTimeout(() => {
            setMostrarLogin(true);
        }, 50);
    }, []);

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
        <>
            {mostrarCarregamento && (
                <LoadingScreen onComplete={finalizarCarregamento} />
            )}
            <main className={`login-page-container ${mostrarLogin ? "login-page-visible" : "login-page-hidden"}`} aria-hidden="true">
                <div className="login-decoration login-decoration-green" aria-hidden="true" />
                <div className="login-decoration login-decoration-yellow" aria-hidden="true" />
                <section className="login-card" aria-labelledby="login-title">    
                    <div className="login-header">
                        <div className="login-brand">
                            <Image 
                                src="/image/Logo.fw.png"
                                alt="Logo GestorERP"
                                width={100}
                                height={100}
                                className="login-logo-image"
                                priority
                            />
                        </div>
                        <h1 id="login-title" className="login-logo">
                            Gestor<span>ERP</span>
                        </h1>
                        <p className="login-subtitle">
                            Entre na sua conta para continuar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        
                        {/* Input do Tenant / Empresa */}
                        <div className="input-wrapper">
                            <label htmlFor="tenantSlug">Empresa</label>
                            <div className="input-field-icon">
                                <span className="login-input-icon" aria-hidden="true">
                                    <FontAwesomeIcon icon={faBuilding} />
                                </span>
                                <input 
                                    id="tenantSlug"
                                    type="text"
                                    name="tenantSlug"
                                    autoComplete="organization"
                                    value={tenantSlug} 
                                    onChange={(e) => setTenantSlug(e.target.value)} 
                                    placeholder="Slug da Empresa"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Input do Usuário */}
                        <div className="input-wrapper">
                            <label htmlFor="username">Usuário</label>
                            <div className="input-field-icon">
                                <span className="login-input-icon" aria-hidden="true">
                                    <FontAwesomeIcon icon={faUser} />
                                </span>
                                <input 
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    placeholder="Digite seu usuário" 
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Input da Senha */}
                        <div className="input-wrapper">
                            <label htmlFor="password">Senha</label>
                            <div className="input-field-icon">
                                <span className="login-input-icon" aria-hidden="true">
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                                <input
                                    id="password"
                                    name="passeword"
                                    type={mostrarSenha ? "text" : "password"}
                                    autoComplete="current-password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Digite sua senha" 
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setMostrarSenha((atual) => !atual)}
                                    aria-label={
                                        mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                                    }
                                    aria-pressed={mostrarSenha}
                                    disabled={loading}
                                >
                                    <FontAwesomeIcon icon={mostrarSenha ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>

                        {erro && <p className="login-error" role="alert">{erro}</p>}

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="login-spinner" aria-hidden="true" />
                                    <span>Autenticando...</span>
                                </>
                            ) : ("Entrar")}
                        </button>
                        <p className="login-footer-text">
                            Acesso seguro ao <strong>GestorERP</strong>
                        </p>
                    </form>
                </section>
                <div className="login-bottom-decoration" aria-hidden="true">
                    <div className="login-bottom-yellow" />
                    <div className="login-bottom-green" /> 
                </div>
            </main>
        </>
    );
}
