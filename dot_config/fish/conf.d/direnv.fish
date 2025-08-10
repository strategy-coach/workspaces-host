# This file is managed by chezmoi in dot_config/fish/conf.d/chezmoi.fish.tmpl. DO NOT EDIT directly.
# To modify, use `chezmoi edit ~/.config/fish/conf.d/direnv.fish --apply`.

eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
$HOMEBREW_PREFIX/bin/direnv hook fish | source
