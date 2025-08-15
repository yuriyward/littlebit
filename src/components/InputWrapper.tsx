import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InputWrapperProps extends React.ComponentProps<"input"> {
  className?: string
}

export function InputWrapper({ className, ...props }: InputWrapperProps) {
  return (
    <Input 
      className={cn(
        "bg-transparent border-none shadow-none h-auto px-2 py-1", 
        "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:border-none focus-visible:ring-0 focus-visible:shadow-none",
        "placeholder:text-foreground font-mono",
        className
      )} 
      {...props} 
    />
  )
}