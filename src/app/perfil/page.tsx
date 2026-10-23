
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faIdBadge,
    faStore,
    faRightFromBracket,
    faShieldHalved,
    faCircleCheck,
    faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/app/contexts/AuthContext";
import "@/styles/perfil.css";

export default function PerfilPage() {
    const router = useRouter();
    const { user, logoutUser } = useAuth();

    const [confirmarSaida, setConfirmarSaida] = useState(false);
    const [saindo, setSaindo] = useState(false);
    const [erro, setErro] = useState("");

    const nome = user?.name || user?.username || "Usuário";
    const iniciais = nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join("");

    async function handleSair() {
        try {
            setSaindo(true);
            setErro("");

            await logoutUser();
            router.replace("/login");
        } catch {
            setErro("Não foi possível encerrar a sessão. Tente novamente.");
            setSaindo(false);
        }
    }

    return (
        <main className="perfil-page">
            <header className="perfil-header">
                <button
                    type="button"
                    className="perfil-voltar"
                    onClick={() => router.push("/")}
                    aria-label="Voltar para o início"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>

                <div>
                    <h1>Meu perfil</h1>
                    <p>Consulte suas informações de acesso.</p>
                </div>
            </header>

            <section className="perfil-resumo">
                <div className="perfil-avatar">
                    {iniciais || <FontAwesomeIcon icon={faUser} />}
                </div>

                <div className="perfil-resumo-info">
                    <h2>{nome}</h2>
                    <p>{user?.username || "Usuário do sistema"}</p>

                    <span className="perfil-status">
                        <FontAwesomeIcon icon={faCircleCheck} />
                        Sessão ativa
                    </span>
                </div>
            </section>

            <section className="perfil-secao">
                <div className="perfil-secao-titulo">
                    <div className="perfil-icone-secao">
                        <FontAwesomeIcon icon={faUser} />
                    </div>

                    <div>
                        <h2>Dados da conta</h2>
                        <p>Informações vinculadas ao seu acesso.</p>
                    </div>
                </div>

                <div className="perfil-dados">
                    <div className="perfil-campo">
                        <span>Nome</span>
                        <strong>{user?.name || "Não informado"}</strong>
                    </div>

                    <div className="perfil-campo">
                        <span>Nome de usuário</span>
                        <strong>{user?.username || "Não informado"}</strong>
                    </div>

                    <div className="perfil-campo">
                        <span>Código do usuário</span>
                        <strong>{user?.usuCodigo ?? "Não informado"}</strong>
                    </div>

                    <div className="perfil-campo">
                        <span>Código do vendedor</span>
                        <strong>{user?.funCodigo ?? "Não informado"}</strong>
                    </div>

                    <div className="perfil-campo">
                        <span>Código da loja</span>
                        <strong>{user?.storeId ?? "Não informado"}</strong>
                    </div>
                </div>
            </section>

            <section className="perfil-secao perfil-seguranca">
                <div className="perfil-secao-titulo">
                    <div className="perfil-icone-secao">
                        <FontAwesomeIcon icon={faShieldHalved} />
                    </div>

                    <div>
                        <h2>Segurança</h2>
                        <p>Gerencie o encerramento da sua sessão.</p>
                    </div>
                </div>

                <div className="perfil-seguranca-conteudo">
                    <div className="perfil-seguranca-texto">
                        <strong>Sair da conta</strong>
                        <p>
                            Encerre sua sessão neste dispositivo.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="perfil-botao-sair"
                        onClick={() => setConfirmarSaida(true)}
                        disabled={saindo}
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        Sair da conta
                    </button>
                </div>

                {erro && (
                    <p className="perfil-erro" role="alert">
                        {erro}
                    </p>
                )}
            </section>

            {confirmarSaida && (
                <div
                    className="perfil-modal-overlay"
                    onClick={() => {
                        if (!saindo) setConfirmarSaida(false);
                    }}
                >
                    <section
                        className="perfil-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="perfil-modal-titulo"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="perfil-modal-icone">
                            <FontAwesomeIcon icon={faRightFromBracket} />
                        </div>

                        <h2 id="perfil-modal-titulo">
                            Deseja sair da conta?
                        </h2>

                        <p>
                            Você precisará entrar novamente para acessar o
                            GestorERP.
                        </p>

                        {erro && (
                            <p className="perfil-erro" role="alert">
                                {erro}
                            </p>
                        )}

                        <div className="perfil-modal-acoes">
                            <button
                                type="button"
                                className="perfil-botao-cancelar"
                                onClick={() => {
                                    setConfirmarSaida(false);
                                    setErro("");
                                }}
                                disabled={saindo}
                            >
                                Continuar conectado
                            </button>

                            <button
                                type="button"
                                className="perfil-botao-confirmar"
                                onClick={handleSair}
                                disabled={saindo}
                            >
                                {saindo ? "Saindo..." : "Sim, sair"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}