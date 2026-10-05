"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "@/app/lib/theme/ThemeProvider";
import "@/styles/ThemeToggle.css";

export default function ThemeToggle() {
    const { theme, toggleTheme} = useTheme();

    const isDark = theme === "dark";

    return (
        <button className="theme-toggle" onClick={toggleTheme} aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"} title={isDark ? "Tema claro" : "Tema escuro"}>
            <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
        </button>
    );
}