"use client";
import "@/styles/layout/Loading.css";

export default function Loading() {
    return (
        <div className="loading-page">
            <div className="loading-content">
                <div className="loading-spinner">
                    <span></span>
                </div>
                <h2>GestorERP</h2>
                <p>Carregando página...</p>
                <div className="loading-progress">
                    <span></span>
                </div>
            </div>
        </div>
    );
}