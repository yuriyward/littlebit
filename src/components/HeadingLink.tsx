import { useState } from "react";

interface HeadingLinkProps {
  headingId: string;
}

export default function HeadingLink({ headingId }: HeadingLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Create the full URL with hash
    const url = `${window.location.origin}${window.location.pathname}#${headingId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    // Scroll to the heading smoothly
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="heading-link-button opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 rounded-sm hover:bg-accent text-muted-foreground hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label={`Copy link to ${headingId} section`}
      title={copied ? "Copied!" : "Copy link to section"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-labelledby="link-icon-title"
      >
        <title id="link-icon-title">{copied ? "Copied" : "Link icon"}</title>
        {copied ? (
          <path d="M20 6L9 17l-5-5" />
        ) : (
          <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </>
        )}
      </svg>
    </button>
  );
}
