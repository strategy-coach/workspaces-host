# This file is managed by chezmoi in {{ .chezmoi.sourceFile }}. DO NOT EDIT directly.
# To modify, use `chezmoi edit ~/.config/fish/config.fish --apply`. 

# put Oh My Posh `omp.cache` and other cache files into this path
export XDG_CACHE_HOME=$HOME/.cache

# setup shell availability of Homebrew infrastructure
if test -d /home/linuxbrew/.linuxbrew # Linux
	set -gx HOMEBREW_PREFIX "/home/linuxbrew/.linuxbrew"
	set -gx HOMEBREW_CELLAR "$HOMEBREW_PREFIX/Cellar"
	set -gx HOMEBREW_REPOSITORY "$HOMEBREW_PREFIX/Homebrew"
else if test -d /opt/homebrew # MacOS
	set -gx HOMEBREW_PREFIX "/opt/homebrew"
	set -gx HOMEBREW_CELLAR "$HOMEBREW_PREFIX/Cellar"
	set -gx HOMEBREW_REPOSITORY "$HOMEBREW_PREFIX/homebrew"
end
fish_add_path -gP "$HOMEBREW_PREFIX/bin" "$HOMEBREW_PREFIX/sbin";
! set -q MANPATH; and set MANPATH ''; set -gx MANPATH "$HOMEBREW_PREFIX/share/man" $MANPATH;
! set -q INFOPATH; and set INFOPATH ''; set -gx INFOPATH "$HOMEBREW_PREFIX/share/info" $INFOPATH;

# this is where we should keep our binaries
fish_add_path ~/.local/bin

# use https://ohmyposh.dev/ prompt theme engine to configure prompt
oh-my-posh init fish --config ~/.config/oh-my-posh/coach.omp.json | source

direnv hook fish | source
zoxide init fish | source
mise activate fish | source

if status is-login; and status is-interactive
    cd $HOME
end