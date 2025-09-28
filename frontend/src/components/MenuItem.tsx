"use client";

import { Button } from "@/components/ui/button";
import { ActivitySquareIcon, ClipboardIcon, HelpCircleIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface MenuItemProps {
    name: "Exames" | "Consultas" | "Fale Conosco";
    activated: boolean;
    minimized?: boolean;
    className?: string;
}

const MenuItem = ({ name, activated, minimized = false, className }: MenuItemProps) => {
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
                    `lg:w-full w-16 flex gap-6 ${minimized ? "justify-center" : "justify-start"} items-center ` +
                    (activated ? "bg-white text-primary shadow-lg" : "bg-primary text-white hover:bg-white hover:text-primary/90") +
                    (className ? ` ${className}` : "")
                }
                variant="menu"
                size="menu"
            >
                {icons[name]}
                {!minimized && (
                  <p className={"hidden lg:block"}>{name}</p>
                )}
            </Button>
        </Link>
    );
};

export default MenuItem;
