import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ButtonWrapperProps extends React.ComponentProps<"button"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children: React.ReactNode
}

export function ButtonWrapper({ variant = "ghost", size = "icon", className, children, ...props }: ButtonWrapperProps) {
  return (
    <Button 
      variant={variant}
      size={size}
      className={cn("w-10 h-10 bg-card border border-border", className)} 
      {...props}
    >
      {children}
    </Button>
  )
}