"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<
    ThemeContextType | undefined
>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({
    children,
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem(
            "gestorerp-theme"
        );

        const systemPrefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        let initialTheme: Theme = "light";

        if (
            savedTheme === "dark" ||
            savedTheme === "light"
        ) {
            initialTheme = savedTheme;
        } else if (systemPrefersDark) {
            initialTheme = "dark";
        }

        document.documentElement.setAttribute(
            "data-theme",
            initialTheme
        );

        localStorage.setItem(
            "gestorerp-theme",
            initialTheme
        );
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem(
            "gestorerp-theme",
            theme
        );
    }, [theme]);

    function changeTheme(newTheme: Theme) {
        setThemeState(newTheme);
    }

    function toggleTheme() {
        setThemeState((currentTheme) =>
            currentTheme === "light"
                ? "dark"
                : "light"
        );
    }

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
                setTheme: changeTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme deve ser usado dentro de um ThemeProvider."
        );
    }

    return context;
}
