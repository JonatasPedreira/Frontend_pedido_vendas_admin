"use client";
import { useEffect, useState } from "react";
import "@/styles/LoadingScreen.css";
import Image from "next/image";

interface LoadingScreenProps {
    onComplete: () => void;
}

export default function LoadingScreen({onComplete,}: LoadingScreenProps) {
    const [exiting, setExiting] = useState(false);
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setExiting(true);
        }, 1600);
        const finishTimer = window.setTimeout(() => {
            onComplete();
        }, 2100);
        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(finishTimer);
        };
    }, [onComplete]);
    return (
        <div
            className={`loading-screen ${exiting ? "loading-screen-exit" : ""}`}
            aria-label="Carregando GestorERP"
            role="status"
        >
            <div className="loading-content">
                <div className="loading-logo">
                    <span className="loading-logo-icon"><Image src="/image/Logo.fw.png" alt="Logo Gestor ERP" width={72} height={72} /></span>
                </div>
                <h1 className="loading-title">
                    Gestor<span>ERP</span>
                </h1>
                <p className="loading-subtitle">
                    Simplificando sua gestão.
                </p>
                <div className="loading-progress">
                    <div className="loading-progress-bar" />
                </div>
                <span className="loading-message">
                    Preparando seu ambiente...
                </span>
            </div>
        </div>
    );
}