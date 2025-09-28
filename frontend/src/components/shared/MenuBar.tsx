"use client";

import React, {useState} from "react";
import Image from "next/image";
import {ChartNoAxesColumnIncreasingIcon, LogOutIcon} from "lucide-react";
import MenuItem from "@/components/MenuItem";
import {useCurrentPage} from "@/lib/slug";

const MenuBar = () => {
    const [minimized, setMinimized] = useState(false);

    const toggleMinimize = () => setMinimized((s) => !s);
    const onToggleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") toggleMinimize();
    };
    const path = useCurrentPage();
    console.log(path);

    const menuItems = [
        { name: "Fale Conosco", path: "/" },
        { name: "Exames", path: "/exames" },
        { name: "Consultas", path: "/consultas" },
    ];

    if(path != "/auth")
    return (
        <div className={"lg:items-center lg:h-screen w-full"}>
            <div className={`flex justify-between w-full bg-primary ${minimized ? "lg:w-26" : "lg:w-95"} lg:h-[95dvh] rounded-lg shadow-lg lg:mx-6 flex-col transition-all duration-200`}
                style={{ minHeight: '0', position: 'relative' }}>
                <div className={"py-6"}>
                    <div className={"hidden lg:flex justify-between items-center mx-6 lg:mb-16"}>
                        <Image
                            src={"/logo_unimed_branco.png"}
                            alt={"unimed logo"}
                            width={minimized ? 0 : 200}
                            height={minimized ? 0 : 100}
                            className={"object-contain"}
                        />

                        <div
                            role={"button"}
                            tabIndex={0}
                            aria-pressed={minimized}
                            onClick={toggleMinimize}
                            onKeyDown={onToggleKey}
                            className={"cursor-pointer p-2"}
                            title={minimized ? "Maximizar menu" : "Minimizar menu"}
                        >
                            <ChartNoAxesColumnIncreasingIcon className={`${minimized ? "size-6 rotate-90" : "size-8 -rotate-90"}`} />
                        </div>
                    </div>

                    <nav className={`hidden lg:flex flex-col ${minimized ? "items-center" : ""} mx-4 gap-4`}>
                        {menuItems.map(item => (
                            <MenuItem
                                key={item.name}
                                name={item.name as any}
                                activated={path === item.path}
                                minimized={minimized}
                            />
                        ))}
                    </nav>
                </div>

                {/* Menu Mobile Fixo Inferior */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden bg-white border-t border-gray-200 shadow-2xl justify-center items-center gap-2 py-2"
                    style={{boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.08)'}}>
                    {menuItems.map(item => (
                        <MenuItem
                            key={item.name}
                            name={item.name as any}
                            activated={path === item.path}
                            minimized={false}
                        />
                    ))}
                </nav>

                {/* Rodapé Desktop */}
                <div className={"hidden lg:flex justify-between items-center px-6 rounded-b-lg py-4 bg-[var(--primary-dark_green)] w-full"}>
                    <div className={`flex gap-4 items-center ${minimized ? "justify-center w-full" : ""}`}>
                        <div className="flex items-center gap-4 rounded-full bg-white text-black w-fit p-4 mt-auto">
                            NU
                        </div>
                        {!minimized && <p> Nome do Usuáio</p>}
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
