"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faEye, faPencil, faBan } from "@fortawesome/free-solid-svg-icons";

interface AcoesPedidoProps {
    pedidoId: number;
    statusPedido: number;
}

export default function AcoesPedidos({
    pedidoId,
    statusPedido,
}: AcoesPedidoProps) {
    const router = useRouter();
    const [menuAberto, setMenuAberto] = useState(false);
    const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
    const [abrirParaCima, setAbrirParaCima] = useState(false);
    const [posicao, setPosicao] = useState({ top: 0, left: 0});
    const botaoRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const pedidoCancelado = statusPedido === 4;
    const pedidoFaturado = statusPedido === 3;

    function atualizarPosicao() {
        const botao = botaoRef.current;
        if (!botao) return;
        const rect = botao.getBoundingClientRect();
        const alturaMenu = 130;
        const espacoAbaixo = window.innerHeight - rect.bottom;
        const abrirCima = espacoAbaixo < alturaMenu + 12;
        setAbrirParaCima(abrirCima);
        setPosicao({
            top: abrirCima ? rect.top - alturaMenu - 8 : rect.bottom + 8, left: Math.max(8, rect.right - 190),
        });
    }

    useEffect(() => {
        if (!menuAberto) {
            atualizarPosicao();
            function fecharAoClicarFora(event: MouseEvent) {
                const alvo = event.target as Node;
                if (
                    !botaoRef.current?.contains(alvo) &&
                    !menuRef.current?.contains(alvo)
                ) {
                    setMenuAberto(false);
                }
            }
            function fecharAoRolar() {
                setMenuAberto(false);
            }
            document.addEventListener("mousedown", fecharAoClicarFora, true);
            window.addEventListener("resize", fecharAoRolar);
            window.addEventListener("scroll", fecharAoRolar, true);

            return () => {
                document.removeEventListener("mousedown", fecharAoClicarFora, false);
                window.removeEventListener("resize", fecharAoRolar);
                window.removeEventListener("scroll", fecharAoRolar, false);
            };
        }
    }, [menuAberto]);
    function abrirConfirmacao() {
        setMenuAberto(false);
        setConfirmacaoAberta(true);
    }
    function confirmarCancelamento() {
        setConfirmacaoAberta(false);
        alert("O cancelamento ainda não está disponível.");
    }
    return (
        <>
            <div className="acoes-pedido-container">
                <button
                    ref={botaoRef}
                    type="button"
                    className="btn-acoes-pedido btn-mais-pedido"
                    onClick={() => {
                        if (!menuAberto) atualizarPosicao();
                        setMenuAberto(!menuAberto);
                    }}
                    aria-expanded={menuAberto}
                    aria-haspopup="menu"
                    aria-label={`Mais ações para o pedido ${pedidoId}`}
                >
                    Mais <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
            </div>
            {menuAberto && typeof document !== "undefined" && createPortal(
                <div
                    ref={menuRef}
                    className={`pedido-acoes-menu ${abrirParaCima? "menu-para-cima" : ""}`}
                    role="menu"
                    style={{
                        position: "fixed",
                        top: posicao.top,
                        left: posicao.left,
                        width: 190,
                        zIndex: 100002,
                    }}
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setMenuAberto(false);
                            router.push(`/pedidos/${pedidoId}`);
                        }}
                    >
                        <FontAwesomeIcon icon={faEye} />
                        <span>Visualizar</span>
                    </button>
                    {!pedidoCancelado && !pedidoFaturado && (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setMenuAberto(false);
                                router.push(`/pedidos/${pedidoId}/editar`);
                            }}
                        >
                            <FontAwesomeIcon icon={faPencil} />
                            <span>Editar</span>
                        </button>
                    )}
                    {!pedidoCancelado && !pedidoFaturado && (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={abrirConfirmacao}
                        >
                            <FontAwesomeIcon icon={faBan} />
                            <span>Cancelar pedido</span>
                        </button>
                    )}
                </div>,
                document.body
            )}
            {confirmacaoAberta && typeof document!== "undefined" && createPortal(
                <div className="confirmacao-cancelamento-overlay">
                    <div
                        className="confirmacao-cancelamento-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="titulo-cancelamento"
                    >
                        <h2 id="titulo-cancelamento">
                            Cancelar pedido #{pedidoId}
                        </h2>
                        <p>
                            Deseja realmente cancelar este pedido?  
                        </p>
                        <div className="confirmacao-cancelamento-acoes">
                            <button
                                type="button"
                                className="btn-cancelar-modal"
                                onClick={() => setConfirmacaoAberta(false)}
                            >
                                Voltar
                            </button>
                            <button
                                type="button"
                                className="btn-confirmar-cancelamento"
                                onClick={confirmarCancelamento}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}