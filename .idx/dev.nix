{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.bun
  ];

  # Make user bin dirs visible to shells & previews
  env = {
    PATH = [
      "/home/user/.local/bin"       # native installer puts `claude` here
      "/home/user/.npm-global/bin"  # fallback npm global prefix
    ];
    NPM_CONFIG_PREFIX = "/home/user/.npm-global";
  };

  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
    "astro-build.astro-vscode"
    "Anthropic.claude-code"
    "bradlc.vscode-tailwindcss"
    "christian-kohler.path-intellisense"
    "dbaeumer.vscode-eslint"
    "eamodio.gitlens"
    "gruntfuggly.todo-tree"
    "jock.svg"
    "mechatroner.rainbow-csv"
    "naumovs.color-highlight"
    "oven.bun-vscode"
    "pflannery.vscode-versionlens"
    "redhat.vscode-yaml"
    "streetsidesoftware.code-spell-checker"
    "streetsidesoftware.code-spell-checker-polish"
    "streetsidesoftware.code-spell-checker-ukrainian"
    "tamasfe.even-better-toml"
    "tomoki1207.pdf"
    "tyriar.sort-lines"
    "unifiedjs.vscode-mdx"
    "usernamehw.errorlens"
    "yzhang.markdown-all-in-one"
  ];

  idx.workspace.onCreate = {
    # Prefer Anthropic’s native installer (puts binary in ~/.local/bin).
    # If it fails, fall back to npm -g (goes to ~/.npm-global/bin via NPM_CONFIG_PREFIX).
    install-claude-cli = ''
      set -e
      if ! command -v claude >/dev/null 2>&1; then
        curl -fsSL https://claude.ai/install.sh | bash || true
      fi
      if ! command -v claude >/dev/null 2>&1; then
        npm install -g @anthropic-ai/claude-code || true
      fi
      which claude || true
      claude --version || true
    '';
  };

  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [ "bun" "x" "--bun" "astro" "dev" "--port" "$PORT" "--host" "0.0.0.0" ];
        manager = "web";
      };
    };
  };
}
