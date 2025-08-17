import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputWrapperProps extends React.ComponentProps<"input"> {
  className?: string;
  responsivePlaceholder?: boolean;
}

export function InputWrapper({ className, responsivePlaceholder, placeholder, ...props }: InputWrapperProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = React.useState(placeholder);

  React.useEffect(() => {
    if (!responsivePlaceholder || !placeholder) return;

    const updatePlaceholder = () => {
      if (window.matchMedia("(max-width: 640px)").matches) {
        setCurrentPlaceholder("Search");
      } else {
        setCurrentPlaceholder("Search (Ctrl+K)");
      }
    };

    // Set initial placeholder
    updatePlaceholder();

    // Listen for resize events
    window.addEventListener("resize", updatePlaceholder);
    return () => window.removeEventListener("resize", updatePlaceholder);
  }, [responsivePlaceholder, placeholder]);

  return (
    <Input
      className={cn("border-none shadow-none focus-visible:bg-background", className)}
      placeholder={currentPlaceholder}
      {...props}
    />
  );
}
