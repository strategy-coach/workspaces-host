# This file is managed by chezmoi in {{ .chezmoi.sourceFile }}. DO NOT EDIT directly.
# To modify, use `chezmoi edit ~/.config/fish/conf.d/fsgit.fish --apply`. 

# cd to the top-level project HOME if inside a git repo
alias cdp='cd $(git rev-parse --show-toplevel)'
