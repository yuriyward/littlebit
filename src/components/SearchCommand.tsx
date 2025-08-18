import DOMPurify from "dompurify";
import { FileTextIcon, FolderIcon } from "lucide-react";
import * as React from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Search result interface for type safety
interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  type: "blog" | "project" | "page";
}

/**
 * SearchCommand component that provides a modern command palette interface for searching content.
 * Uses Pagefind for full-text search across blog posts and project pages.
 *
 * Note: Search functionality only works after build (`bun run build`) as Pagefind requires
 * the built HTML files to generate the search index. In development mode, the search will
 * appear but won't return results until after a build + preview.
 */
export function SearchCommand() {
  // Component state
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [pagefindInitialized, setPagefindInitialized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Listen for custom event to open search command
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOpenSearch = () => {
      setOpen(true);
    };

    window.addEventListener("open-search-command", handleOpenSearch);
    return () => window.removeEventListener("open-search-command", handleOpenSearch);
  }, []);

  // Initialize Pagefind on mount
  React.useEffect(() => {
    const initializePagefind = async () => {
      if (!pagefindInitialized && typeof window !== "undefined") {
        try {
          setError(null);

          // Load Pagefind via inline module script to avoid Astro public directory restrictions
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.type = "module";
            script.textContent = `
              try {
                const pagefind = await import("/pagefind/pagefind.js");
                window.pagefind = pagefind;
                window.dispatchEvent(new CustomEvent('pagefind-loaded'));
              } catch (error) {
                window.dispatchEvent(new CustomEvent('pagefind-error', { detail: error }));
              }
            `;

            const handleLoaded = () => {
              window.removeEventListener("pagefind-loaded", handleLoaded);
              window.removeEventListener("pagefind-error", handleError);
              resolve();
            };

            const handleError = (event: Event) => {
              window.removeEventListener("pagefind-loaded", handleLoaded);
              window.removeEventListener("pagefind-error", handleError);
              const customEvent = event as CustomEvent;
              reject(customEvent.detail || new Error("Failed to load Pagefind"));
            };

            window.addEventListener("pagefind-loaded", handleLoaded);
            window.addEventListener("pagefind-error", handleError);

            document.head.appendChild(script);
          });

          setPagefindInitialized(true);
        } catch (error) {
          console.error("Failed to load Pagefind:", error);
          setError('Search unavailable. Run "bun run dev:search" to enable search in development mode.');
        }
      }
    };

    if (open && typeof window !== "undefined") {
      initializePagefind();
    }
  }, [open, pagefindInitialized]);

  // Search function using Pagefind
  const performSearch = React.useCallback(
    async (searchTerm: string) => {
      if (!pagefindInitialized || !searchTerm.trim() || typeof window === "undefined") {
        setResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // @ts-expect-error
        const search = await window.pagefind.search(searchTerm);
        const searchResults: SearchResult[] = [];

        for (const result of search.results) {
          const data = await result.data();

          // Determine content type based on URL
          let type: "blog" | "project" | "page" = "page";
          if (data.url.includes("/blog/")) {
            type = "blog";
          } else if (data.url.includes("/projects/")) {
            type = "project";
          }

          searchResults.push({
            id: data.url,
            title: data.meta.title || "Untitled",
            excerpt: data.excerpt || "",
            url: data.url,
            type,
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setError("Search temporarily unavailable. Please try again.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [pagefindInitialized]
  );

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSelect = (url: string) => {
    if (typeof window === "undefined") return;

    // Add search term to URL for highlighting
    let targetUrl = url;
    if (query.trim()) {
      const urlObj = new URL(targetUrl, window.location.origin);
      urlObj.searchParams.set("highlight", query.trim());
      targetUrl = urlObj.pathname + urlObj.search;
    }

    window.location.href = targetUrl;
    setOpen(false);
  };

  // Utility functions for rendering
  const getIcon = (type: string) => {
    switch (type) {
      case "blog":
        return <FileTextIcon className="h-4 w-4" />;
      case "project":
        return <FolderIcon className="h-4 w-4" />;
      default:
        return <FileTextIcon className="h-4 w-4" />;
    }
  };

  // Safe excerpt rendering component that avoids dangerouslySetInnerHTML
  const SafeExcerpt = React.memo(({ excerpt }: { excerpt: string }) => {
    // Parse HTML and render only safe mark elements
    const parseExcerpt = (html: string): React.ReactNode => {
      if (typeof window === "undefined") {
        // Server-side: return plain text
        return html.replace(/<[^>]*>/g, "");
      }

      // Client-side: sanitize and parse
      const sanitized = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ["mark"],
        ALLOWED_ATTR: [],
      });

      // Simple parser for mark tags - split by <mark> and </mark>
      const parts = sanitized.split(/(<\/?mark>)/);
      const elements: React.ReactNode[] = [];
      let isInMark = false;
      let key = 0;

      for (const part of parts) {
        if (part === "<mark>") {
          isInMark = true;
        } else if (part === "</mark>") {
          isInMark = false;
        } else if (part) {
          elements.push(isInMark ? <mark key={key++}>{part}</mark> : part);
        }
      }

      return elements;
    };

    return <>{parseExcerpt(excerpt)}</>;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "blog":
        return "Blog Posts";
      case "project":
        return "Projects";
      default:
        return "Pages";
    }
  };

  // Group results by type
  const groupedResults = results.reduce(
    (groups, result) => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
      return groups;
    },
    {} as Record<string, SearchResult[]>
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command shouldFilter={false}>
        <CommandInput placeholder="Search for content..." value={query} onValueChange={setQuery} />
        <CommandList>
          {isLoading && <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>}

          {error && <div className="py-6 text-center text-sm text-destructive">{error}</div>}

          {!isLoading && !error && query && results.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}

          {!isLoading &&
            !error &&
            results.length > 0 &&
            Object.entries(groupedResults).map(([type, typeResults]) => (
              <CommandGroup key={type} heading={getTypeLabel(type)}>
                {typeResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result.url)}
                    className="flex items-start gap-3 py-3"
                  >
                    {getIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{result.title}</div>
                      {result.excerpt && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          <SafeExcerpt excerpt={result.excerpt} />
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
