# Strategy Coach Workspaces Host Setup

This is our opinionated [chezmoi](https://www.chezmoi.io/)-based "workspaces
host" (or "engineering sandbox home") setup for polyglot software development or
any other "creator tasks" that are performed on Linux-like operating systems.

See [chezmoi.toml Example](.chezmoi.toml.tmpl) to help understand the variables
that can be set and used across chezmoi templates.

If you're using Windows 10/11 with WSL2, create a "disposable" Linux instance
using Powershell CLI or Windows Store. This project treats the WSL2 instance as
"disposable" meaning it's for development only and can easily be destroyed and
recreated whenever necessary. The cost for creation and destruction for a
Engineering Sandbox should be so low that it should be treated almost as a
container rather than a VM. This means everything done in a sandbox should be
scripted, with the scripts stored in GitHub for easy re-running through Fish
shell or `chezmoi`.

## Linux versions

Any Debian-based distro which supports Fish Shell 3.6+ should work, including
Ubuntu 20.04 LTS, Ubuntu 22.04 LTS, Debian 11+ with Fish upgrades, etc.

If you're using Windows WSL, you can use these commands to install/uninstall our
preferred distro:

```powershell
$ wsl --unregister Debian
$ wsl --install -d Debian
```

If you're using a Debian-based distro you should be able to run this repo in any
Debian user account. It will probably work with any Linux-like OS but has only
been tested on Debian-based distros (e.g. Kali Linux and Ubuntu 20.04 LTS).

## One-time setup

Install `curl` and `wget` using OS package manager before continuing. This
should be the only distro-specific installation required.

```bash
sudo apt-get -qq update && sudo apt-get install -qq -y curl wget
```

Once you've got `wget` and `curl`, continue installing `upt` (a univeral CLI
which installs native packages) and `pkgx` for more complex package management
tasks (like for engineering environments):

```bash
curl -fsSL https://raw.githubusercontent.com/sigoden/upt/main/install.sh | sudo sh -s -- --to /usr/local/bin
sudo upt install -y unzip git git-extras libatomic1 jq
curl -Ssf https://pkgx.sh | sh
pkgx install fishshell.com deno.land eget direnv.net crates.io/zoxide crates.io/exa github.com/gopasspw/gopass
```

Install `chezmoi` and generate configuration files based on values in Strategy
Coach Workspaces Host `chezmoi` templates:

```bash
sh -c "$(curl -fsLS get.chezmoi.io/lb)" -- init --apply strategy-coach/workspaces-host
```

After `chezmoi` is initialized, edit the config file with your configuration:

```bash
vim.tiny ~/.config/chezmoi/chezmoi.toml
~/.local/bin/chezmoi apply
```

We prefer `Fish` as the default shell and `Oh My Posh` as the CLI prompts theme
manager. These are configured automatically by `chezmoi`'s first-time
configuration. You should switch your user's default shell to `Fish` by running:

```bash
curl -s https://ohmyposh.dev/install.sh | bash -s -- -d ~/.local/bin
echo "$HOME/.local/bin/fish" | sudo tee -a /etc/shells
chsh -s ~/.local/bin/fish
exit
```

At this point the default configuration should be complete and you can start
using your Coach Workspaces (CWS).

## Secrets Management

- Generate [GitHub personal access tokens](https://github.com/settings/tokens)
  and update `$HOME/.config/chezmoi/chezmoi.toml` file (this file is created at
  installation and is private to the user). Then, run `chezmoi apply` to
  regenerate all configuration files that use the global `chezmoi.toml` file.
- `$HOME/.pgpass` should follow
  [PostgreSQL .pgpass](https://tableplus.com/blog/2019/09/how-to-use-pgpass-in-postgresql.html)
  rules for password management.
- [gopass](https://www.gopass.pw/) should be used for general password
  management.

## Maintenance

Regularly run, or when `github.com/strategy-coach/workspaces-host` repo is
updated:

```bash
chezmoi upgrade
chezmoi update
```

<mark>** DO NOT EDIT ** chezmoi-managed files. To see which files are managed by
chezmoi run _chezmoi managed_ and edit those using guidance in the
_Contributing_ section below.</mark>

### Running chezmoi-managed scripts manually

There are a few chezmoi-managed scripts that are automatically run when
necessary:

- `run_once_install-packages.sh.tmpl`

These and other "managed" scripts show up like this:

```bash
$ chezmoi managed | grep '\.sh$'
install-packages.sh
```

#### Force the chezmoi-managed script execution to Install / Update

- If you ever need to run them manually (such as when chezmoi or NL Aide libs
  are changed or an error occurs and you need to force the execution), as well
  as forcefully install the utilitize mentioned in this script to latest
  version. you would use:

```bash
$ chezmoi state delete-bucket --bucket=scriptState
$ chezmoi apply
```

See
[Clear the state of run_once_ scripts](https://www.chezmoi.io/user-guide/use-scripts-to-perform-actions/#clear-the-state-of-run_once_-scripts)
in `chezmoi` documentation for more information about how to force execution of
scripts instead of using memoized state.

## GitHub Binary Releases Management

We use [eget](https://github.com/zyedidia/eget) to install prebuilt binaries
from GitHub when `pkgx` does not have a package in its pantry. `eget` works
great when all we care about is the latest version of a single binary from a
particular GitHub repo.

## Polyglot Languages Installation and Version Management

We use `pkgx` to manage languages and utilities when deterministic
reproducibility is not crucial and convenience is more important. For complex
setups you can also try `mise`. `pkgx` and `mise` enable tools to be installed
and, more importantly, support multiple versions simultaneously. For example, we
heavily use `Deno` for multiple projects but each project might require a
different version. `pkgx` and `mise` support global, per session, and per
project (directory) version configuration strategy.

In addition to `pkgx` and `mise` which both support a flexible version
configuration strategy for languages and runtimes, we use
[direnv](https://direnv.net/) to encourage usage of environment variables with
per-directory flexibility. Per their documentation:

> direnv is an extension for your shell. It augments existing shells with a new
> feature that can load and unload environment variables depending on the
> current directory.

We use `direnv` and `.envrc` files to manage environments on a
[per-directory](https://www.tecmint.com/direnv-manage-environment-variables-in-linux/)
(per-project and descendant directories) basis. `direnv` can be used to
[manage secrets](https://www.youtube.com/watch?v=x3p-28PajJY) as well as
non-secret configurations. Many other
[development automation techniques](http://www.futurile.net/2016/02/03/automating-environment-setup-with-direnv/)
are possible.

There are some
[direnv YouTube videos](https://www.youtube.com/results?search_query=direnv)
worth watching to get familar with the capabilities.

### Conventions

- We use `$HOME/.local/bin` for binaries whenever possible instead globally
  installing them using `sudo`.
- We use `direnv` and per-directory `.envrc` to help manage secrets and
  env-based configurations per-project rather than globally.

### Packages

Run `coach-doctor.ts` to get list of useful packages and versions included. Some
highlights:

- We use [fish shell](https://fishshell.com/) for our CLI.
- We use `git` and `git-extras` and define many `git-*` individual scripts (e.g.
  `mGit`) because we're a GitOps shop.
- We use [pkgx](https://pkgx.sh) for basic tools isolation.
- We use [deno](https://deno.land) for custom scripting and `dax` command runner
  to execute tasks. We favor `deno` over `make` for new packages but `make` is
  still a great tool for legacy requirements. If we create complex scripts that
  need to perform shell manipulation, `deno` with
  [dax](https://github.com/dsherret/dax) is preferred over making system calls
  in `deno`.
- We use [gopass](https://www.gopass.pw/) for managing secrets that should not
  be in plaintext.
- We use `osQuery`, `cnquery`, `steampipe`, et. al. system and endpoint
  observabilty tools for SOC2 and other compliance requirements

### Environment Variables

- `XDG_CACHE_HOME` (defined in `dot_config/fish/config.fish`)
- `IS_CWS` and `IS_CWS_WSL` (defined in
  `dot_config/fish/conf.d/coach-workspaces-home.fish`)

### PATH

- `$HOME/.local/bin` (defined in `dot_config/fish/config.fish`)

## Managed Git Repos (GitHub, GitLab, etc.) Tools

Please review [Coach Workspaces](https://github.com/strategy-coach/workspaces)
for our opinionated approach to cloning and working with "managed" Git repos
(from GitHub, GitLab, BitBucket, etc.).

We use [Semantic Versioning](https://semver.org/) so be sure to learn and
regularly use the [semtag](https://github.com/nico2sh/semtag) bash script that
is installed as `git-semtag` in `$HOME/.local/bin`.

For example:

```bash
chezmoi cd
# perform regular git commits
git chglog --output CHANGELOG.md && git commit -m "auto-generate CHANGELOG.md" CHANGELOG.md
git semtag final
# or 'git semtag final -v "v0.5.0"' for specific version
git push
```

## Important per-project and per-directory configuration management tools

We use `direnv` to encourage usage of environment variables with per-directory
flexibility. Per their documentation:

> direnv is an extension for your shell. It augments existing shells with a new
> feature that can load and unload environment variables depending on the
> current directory.

We use `direnv` and `.envrc` files to manage environments on a
[per-directory](https://www.tecmint.com/direnv-manage-environment-variables-in-linux/)
(per-project and descendant directories) basis. `direnv` can be used to
[manage secrets](https://www.youtube.com/watch?v=x3p-28PajJY) as well as
non-secret configurations. Many other
[development automation techniques](http://www.futurile.net/2016/02/03/automating-environment-setup-with-direnv/)
are possible.

There are some
[direnv YouTube videos](https://www.youtube.com/results?search_query=direnv)
worth watching to get familar with the capabilities.
