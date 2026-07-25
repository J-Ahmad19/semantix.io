import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-game-cold disabled:pointer-events-none disabled:opacity-50 bg-game-cold text-game-bg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-game-cold/90 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] h-12 px-6 py-3 font-sans tracking-widest uppercase",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
