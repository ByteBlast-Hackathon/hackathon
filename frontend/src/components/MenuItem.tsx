"use client";

import { Button } from "@/components/ui/button";
import { ActivitySquareIcon, ClipboardIcon, HelpCircleIcon, LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface MenuItemProps {
    name: "Exames" | "Consultas" | "Fale Conosco";
    activated: boolean;
    minimized?: boolean;
}

const MenuItem = ({ name, activated, minimized = false }: MenuItemProps) => {
    const icons: Record<MenuItemProps["name"], React.ReactNode> = {
        Exames: <ActivitySquareIcon className="size-7" />,
        Consultas: <ClipboardIcon className="size-7" />,
        "Fale Conosco": <HelpCircleIcon className="size-7" />,
    };

    // Map menu name to route
    const routeMap: Record<MenuItemProps["name"], string> = {
        "Fale Conosco": "/",
        Exames: "/exames",
        Consultas: "/consultas",
    };

    return (
        <Link href={routeMap[name]} style={{ width: "100%" }}>
            <Button
                className={
                    `w-full flex gap-6 justify-${minimized ? "center" : "start"} items-center ${activated ? "bg-white text-primary shadow-lg" : "bg-primary text-white hover:bg-white hover:text-primary/90"}`
                }
                variant="menu"
                size="menu"
            >
                {icons[name]}
                <p className={"hidden lg:block"}>

                {!minimized && name}
                </p>
            </Button>
        </Link>
    );
};

export default MenuItem;
