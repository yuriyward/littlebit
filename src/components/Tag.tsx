import type { CollectionEntry } from "astro:content";
import { Badge } from "./ui/badge";

interface TagProps {
  tag: CollectionEntry<"tags">;
  variant?: "default" | "interactive" | "filter";
  size?: "sm" | "default" | "lg";
  count?: number;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function Tag({
  tag,
  variant = "default",
  size = "default",
  count,
  active = false,
  onClick,
  href,
  className,
}: TagProps) {
  const badgeVariant =
    variant === "filter" ? (active ? "tag-active" : "tag") : variant === "interactive" ? "outline" : "muted";

  const content = (
    <Badge variant={badgeVariant} size={size} className={className}>
      <span>
        {tag.id} {count !== undefined && <span className="opacity-60">({count})</span>}
      </span>
    </Badge>
  );

  if (href) {
    return (
      <a
        href={href}
        className="no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md cursor-pointer"
      >
        {content}
      </button>
    );
  }

  return content;
}
