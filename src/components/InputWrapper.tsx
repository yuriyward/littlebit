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
        "border-none shadow-none focus-visible:bg-background",
        className
      )}
      {...props}
    />
  )
}
