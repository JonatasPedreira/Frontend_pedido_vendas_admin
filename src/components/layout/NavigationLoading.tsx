"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "@/styles/layout/Loading.css";

export default function NavigationLoading() {
    const pathaname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStartedAt, setLoadingStartedAt] = useState(0);

    useEffect(() => {
        const handleNavigationStart = (event: MouseEvent) => {
            if (
                event.button !== 0 ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }
            const target = event.target;
            if (!(target instanceof Element)) return;
            const link = target.closest("a[href]");
            if (!(link instanceof HTMLAnchorElement)) return;
            if (
                link.target === "_blank"||
                link.hasAttribute("download") ||
                link.origin !== window.location.origin
            ) {
                return;
            }
            const destination = new URL(link.href);
            if (
                destination.pathname === window.location.pathname &&
                destination.search === window.location.search &&
                destination.hash === window.location.hash
            ) {
                return;
            }
            setLoadingStartedAt(Date.now());
            setIsLoading(true);
        };
        document.addEventListener("click", handleNavigationStart);
        return () => {
            document.removeEventListener("click", handleNavigationStart);
        };
    }, []);
    useEffect(() => {
        if (!isLoading) return;
        const elapsed = Date.now() - loadingStartedAt;
        const remaining = Math.max(0, 500 - elapsed);
        const timeout = window.setTimeout(() => {
            setIsLoading(false);
        }, remaining);
        return () => window.clearTimeout(timeout);
    }, [pathaname, isLoading, loadingStartedAt]);
    if (!isLoading) return null;
    return (
        <div
            className="loading-page"
            role="status"
            aria-live="polite"
            aria-label="Carregando página"
        >
            <div className="loading-content">
                <div className="loading-spinner">
                    <span />
                </div>
                <h2>GestorERP</h2>
                <p>Carregando página...</p>
                <div className="loading-progress">
                    <span />
                </div>
            </div>
        </div>
    );
}