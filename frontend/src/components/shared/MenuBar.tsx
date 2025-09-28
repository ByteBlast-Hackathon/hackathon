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

    if(path != "/auth")
    return (
        <div className={"hidden lg:flex items-center h-screen"}>
            <div className={`flex justify-between bg-primary ${minimized ? "w-26" : "w-95"} h-[95dvh] rounded-lg shadow-lg mx-6 flex-col transition-all duration-200`}>
                <div className={"py-6"}>
                    <div className={"flex justify-between items-center mx-6 mb-16"}>
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

                    <nav className={`flex flex-col ${minimized ? "items-center" : ""} mx-4 gap-4`}>
                        <MenuItem name={"Dashboard"} activated={true} minimized={minimized} />
                        <MenuItem name={"Exames"} activated={false} minimized={minimized} />
                        <MenuItem name={"Consultas"} activated={false} minimized={minimized} />
                        <MenuItem name={"Fale Conosco"} activated={false} minimized={minimized} />
                    </nav>
                </div>

                <div className={"flex justify-between items-center px-6 py-4 bg-[var(--primary-dark_green)] w-full"}>
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
