"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {ChartNoAxesColumnIncreasingIcon, LogOutIcon, User, UserIcon} from "lucide-react";
import MenuItem from "@/components/MenuItem";
import { useCurrentPage } from "@/lib/slug";

const MenuBar = () => {
    const [minimized, setMinimized] = useState(false);
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        // Tenta buscar o nome do usuário do localStorage
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const parsed = JSON.parse(user);
                setUserName(parsed.name || "");
            } catch {
                setUserName("");
            }
        }
    }, []);

    // Função para pegar as iniciais (primeira letra do primeiro e último nome)
    function getInitials(name: string) {
        if (!name) return "NU";
        const parts = name.trim().split(" ").filter(Boolean);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    const toggleMinimize = () => setMinimized((s) => !s);
    const onToggleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") toggleMinimize();
    };
    const path = useCurrentPage();

    const menuItems = [
        { name: "Fale Conosco", path: "/" },
        { name: "Exames", path: "/exames" },
        { name: "Consultas", path: "/consultas" },
    ];

    if (path !== "/auth")
        return (
            <div className="lg:items-center lg:h-screen flex items-center">
                <div
                    className={`flex justify-between w-full lg:bg-primary text-white ${
                        minimized ? "lg:w-26" : "lg:w-95"
                    } lg:h-[95dvh] rounded-lg shadow-lg lg:mx-6 flex-col transition-all duration-200`}
                    style={{ minHeight: "0", position: "relative" }}
                >
                    {/* Header Desktop */}
                    <div className="py-6">
                        <div className="hidden lg:flex justify-between items-center mx-6 lg:mb-16">
                            <Image
                                src={"/logo_unimed_branco.png"}
                                alt={"unimed logo"}
                                width={minimized ? 0 : 200}
                                height={minimized ? 0 : 100}
                                className="object-contain"
                            />

                            <div
                                role="button"
                                tabIndex={0}
                                aria-pressed={minimized}
                                onClick={toggleMinimize}
                                onKeyDown={onToggleKey}
                                className="cursor-pointer p-2"
                                title={minimized ? "Maximizar menu" : "Minimizar menu"}
                            >
                                <ChartNoAxesColumnIncreasingIcon
                                    className={`${
                                        minimized ? "size-6 rotate-90" : "size-8 -rotate-90"
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Menu Desktop */}
                        <nav
                            className={`hidden lg:flex flex-col ${
                                minimized ? "items-center" : ""
                            } mx-4 gap-4`}
                        >
                            {menuItems.map((item) => (
                                <MenuItem
                                    key={item.name}
                                    name={item.name as any}
                                    activated={path === item.path}
                                    minimized={minimized}
                                    className="hover:bg-white hover:text-green-600 rounded-lg transition"
                                />
                            ))}
                        </nav>
                    </div>

                    {/* Menu Mobile Fixo Inferior */}
                    <nav className="fixed bottom-0 left-0 px-6  right-0 z-50 flex lg:hidden bg-primary text-white border-t border-green-700 shadow-lg justify-around items-center py-2">
                        {menuItems.map((item) => (
                            <MenuItem
                                key={item.name}
                                name={item.name as any}
                                activated={path === item.path}
                                minimized={true}
                                className="hover:bg-white hover:text-primary rounded-full p-2 transition"
                            />
                        ))}

                        {/* Perfil no mobile */}
                        <button className="flex flex-col items-center gap-1 font-bold rounded-full p-5 transition">
                            <UserIcon />
                        </button>
                    </nav>

                    {/* Rodapé Desktop */}
                    <div className={"hidden lg:flex justify-between items-center px-6 rounded-b-lg py-4 bg-[var(--primary-dark_green)] w-full"}>
                        <div className={`flex gap-4 items-center ${minimized ? "justify-center w-full" : ""}`}>
                            <div className="flex items-center gap-4 rounded-full bg-white text-black w-fit p-4 mt-auto">
                                {getInitials(userName)}
                            </div>
                            {!minimized && <p>{userName || "Nome do Usuáio"}</p>}
                        </div>
                        {minimized ? (
                            <ChartNoAxesColumnIncreasingIcon className={"size-6 rotate-90"} />
                        ) : (
                            <LogOutIcon className={"text-destructive size-6"} />
                        )}
                    </div>
                </div>
            </div>
        );
};

export default MenuBar;
