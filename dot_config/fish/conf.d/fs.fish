# This file is managed by chezmoi in {{ .chezmoi.sourceFile }}. DO NOT EDIT directly.
# To modify, use `chezmoi edit ~/.config/fish/conf.d/fs.fish --apply`. 

alias ll='eza --long --header --git --icons'
alias lsl='ls -alF'

# start an HTTP server to serve the files in the current directory
alias serve-cwd-http='deno run -A jsr:@std/http/file-server .'