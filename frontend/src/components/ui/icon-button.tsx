"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "./button"
import type { VariantProps } from "class-variance-authority"

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & {
  children: React.ReactNode
}

export default function IconButton({ className, variant = "ghost", size = "sm", children, ...props }: IconButtonProps) {
  return (
    <button
      type={props.type || "button"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  )
}

