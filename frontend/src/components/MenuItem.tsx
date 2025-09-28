"use client";

import { Button } from "@/components/ui/button";
import { ActivitySquareIcon, ClipboardIcon, HelpCircleIcon, LayoutDashboardIcon } from "lucide-react";
import React from "react";

interface MenuItemProps {
    name: "Dashboard" | "Exames" | "Consultas" | "Fale Conosco";
    activated: boolean;
    minimized?: boolean;
}

const MenuItem = ({ name, activated, minimized = false }: MenuItemProps) => {
    const icons: Record<MenuItemProps["name"], React.ReactNode> = {
        Dashboard: <LayoutDashboardIcon className="size-7" />,
        Exames: <ActivitySquareIcon className="size-7" />,
        Consultas: <ClipboardIcon className="size-7" />,
        "Fale Conosco": <HelpCircleIcon className="size-7" />,
    };



    return (
        <Button
            className={activated ? "bg-white text-primary" : ""}
            variant="menu"
            size="menu"
        >
            {icons[name]}
            {!minimized && name}
        </Button>
    );
};

export default MenuItem;
