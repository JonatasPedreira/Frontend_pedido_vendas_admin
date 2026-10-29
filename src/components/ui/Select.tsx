"use client";
import {
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {
    useEffect,
    useId,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import "@/styles/components/Select.css";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    searchable?: boolean;
    id?: string;
    name?: string;
}

interface DropdownPosition {
    top: number;
    left: number;
    width: number;
    openAbove: boolean;
}

export default function Select({
    label,
    options,
    value,
    onChange,
    placeholder = "Selecione uma opção",
    disabled = false,
    searchable = false,
    id,
    name,
}: SelectProps) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [position, setPosition] = useState<DropdownPosition>({
        top: 0,
        left: 0,
        width: 0,
        openAbove: false,
    });

    const selectedOption = options.find(
        (option) => option.value === value
    );

    const filteredOptions = options.filter((option) =>
        option.label
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase())
    );

    // Calcula a posição do dropdown fora do fluxo do layout.
    function atualizarPosicao() {
        const trigger = triggerRef.current;

        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();

        const espacoAbaixo = window.innerHeight - rect.bottom;
        const espacoAcima = rect.top;

        const alturaEstimada = searchable ? 300 : 250;

        const openAbove =
            espacoAbaixo < alturaEstimada &&
            espacoAcima > espacoAbaixo;

        setPosition({
            top: openAbove
                ? rect.top
                : rect.bottom + 6,

            left: rect.left,

            width: rect.width,

            openAbove,
        });
    }

    // Atualiza a posição ao abrir e ao rolar a página.
    useEffect(() => {
        if (!open) return;

        atualizarPosicao();

        function handleScrollOrResize() {
            atualizarPosicao();
        }

        window.addEventListener(
            "resize",
            handleScrollOrResize
        );

        // Captura a rolagem de contêineres internos também.
        window.addEventListener(
            "scroll",
            handleScrollOrResize,
            true
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleScrollOrResize
            );

            window.removeEventListener(
                "scroll",
                handleScrollOrResize,
                true
            );
        };
    }, [open, searchable]);

    // Fecha ao clicar fora do componente e do dropdown.
    useEffect(() => {
        if (!open) return;

        function handleOutsideClick(event: MouseEvent) {
            const target = event.target as Node;

            const clicouNoSelect =
                containerRef.current?.contains(target);

            const clicouNoDropdown =
                dropdownRef.current?.contains(target);

            if (!clicouNoSelect && !clicouNoDropdown) {
                setOpen(false);
                setSearch("");
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, [open]);

    // Foca a pesquisa quando o dropdown abre.
    useEffect(() => {
        if (open && searchable) {
            searchRef.current?.focus();
        }
    }, [open, searchable]);

    function toggleDropdown() {
        if (disabled) return;

        if (!open) {
            atualizarPosicao();
        }

        setOpen((previous) => !previous);
    }

    function handleKeyDown(
        event: React.KeyboardEvent<HTMLButtonElement>
    ) {
        if (event.key === "Escape") {
            setOpen(false);
            setSearch("");
        }

        if (
            event.key === "ArrowDown" &&
            !open &&
            !disabled
        ) {
            event.preventDefault();

            atualizarPosicao();
            setOpen(true);
        }
    }

    function handleSelect(option: SelectOption) {
        if (option.disabled) return;

        onChange(option.value);

        setOpen(false);
        setSearch("");
    }

    const dropdown = open
        ? createPortal(
            <div
                ref={dropdownRef}
                className={`custom-select-dropdown custom-select-portal ${
                    position.openAbove
                        ? "custom-select-dropdown-above"
                        : ""
                }`}
                style={{
                    position: "fixed",
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    zIndex: 99999,
                    visibility: position.width > 0
                        ? "visible"
                        : "hidden",
                }}
            >
                {searchable && (
                    <input
                        ref={searchRef}
                        type="text"
                        className="custom-select-search"
                        placeholder="Pesquisar..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Escape") {
                                setOpen(false);
                                setSearch("");
                                triggerRef.current?.focus();
                            }
                        }}
                    />
                )}

                <ul
                    className="custom-select-options"
                    role="listbox"
                    aria-labelledby={`${selectId}-label`}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={
                                        option.value === value
                                    }
                                    disabled={option.disabled}
                                    className={`custom-select-option ${
                                        option.value === value
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleSelect(option)
                                    }
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="custom-select-empty">
                            Nenhuma opção encontrada.
                        </li>
                    )}
                </ul>
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <div
                ref={containerRef}
                className={`custom-select ${
                    open ? "custom-select-open" : ""
                }`}
            >
                <label
                    id={`${selectId}-label`}
                    className="custom-select-label"
                    htmlFor={selectId}
                >
                    {label}
                </label>

                <input
                    type="hidden"
                    name={name}
                    value={value}
                    disabled={disabled}
                />

                <button
                    ref={triggerRef}
                    id={selectId}
                    type="button"
                    className="custom-select-trigger"
                    aria-labelledby={`${selectId}-label ${selectId}-value`}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    disabled={disabled}
                    onClick={toggleDropdown}
                    onKeyDown={handleKeyDown}
                >
                    <span
                        id={`${selectId}-value`}
                        className={`custom-select-value ${
                            selectedOption
                                ? ""
                                : "custom-select-placeholder"
                        }`}
                    >
                        {selectedOption?.label ?? placeholder}
                    </span>

                    <FontAwesomeIcon icon={faChevronDown} />
                </button>
            </div>

            {dropdown}
        </>
    );
}