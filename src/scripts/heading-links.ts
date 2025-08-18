// Add hover-able link buttons to headings
document.addEventListener("DOMContentLoaded", () => {
  const article = document.querySelector("article[data-pagefind-body]");
  if (!article) return;

  // Find all headings in the article
  const headings = article.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6");

  headings.forEach((heading) => {
    const id = heading.id;
    if (!id) return; // Skip headings without IDs

    // Add group class for hover effects
    heading.classList.add("group");

    // Create the link button element
    const linkButton = document.createElement("button");
    linkButton.className =
      "heading-link-button opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 rounded-sm hover:bg-accent text-muted-foreground hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer";
    linkButton.setAttribute("aria-label", `Copy link to ${id} section`);
    linkButton.title = "Copy link to section";

    // Create the link icon SVG
    const linkIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    linkIcon.setAttribute("width", "16");
    linkIcon.setAttribute("height", "16");
    linkIcon.setAttribute("viewBox", "0 0 24 24");
    linkIcon.setAttribute("fill", "none");
    linkIcon.setAttribute("stroke", "currentColor");
    linkIcon.setAttribute("stroke-width", "2");
    linkIcon.setAttribute("stroke-linecap", "round");
    linkIcon.setAttribute("stroke-linejoin", "round");

    // Link icon path
    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71");
    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path2.setAttribute("d", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71");

    linkIcon.appendChild(path1);
    linkIcon.appendChild(path2);
    linkButton.appendChild(linkIcon);

    // Add click handler
    linkButton.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Create the full URL with hash
      const url = `${window.location.origin}${window.location.pathname}#${id}`;

      try {
        await navigator.clipboard.writeText(url);
        showCopiedState(linkButton, linkIcon);
      } catch (_err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showCopiedState(linkButton, linkIcon);
      }

      // Scroll to the heading smoothly
      heading.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    // Append the button to the heading
    heading.appendChild(linkButton);
  });
});

function showCopiedState(button: HTMLButtonElement, iconElement: SVGElement) {
  // Change to check icon
  iconElement.innerHTML = '<path d="M20 6L9 17l-5-5" />';
  button.title = "Copied!";

  // Revert after 2 seconds
  setTimeout(() => {
    iconElement.innerHTML =
      '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />';
    button.title = "Copy link to section";
  }, 2000);
}
