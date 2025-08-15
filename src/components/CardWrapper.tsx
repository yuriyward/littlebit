import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardWrapperProps {
  className?: string
  children: React.ReactNode
  [key: string]: any
}

export function CardWrapper({ className, children, ...props }: CardWrapperProps) {
  return (
    <Card className={cn("px-6", className)} {...props}>
      {children}
    </Card>
  )
}