import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-black placeholder:text-muted-foreground text-sm selection:bg-white selection:text-primary-foreground dark:bg-input/30 border-border h-10 lg:h-12 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-black shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-lg file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 lg:text-lg",
        "focus-visible:border-primary focus-visible:ring-[var(--primary-dark_green)] focus-visible:ring-[2px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
