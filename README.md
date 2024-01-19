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

Any Linux distro or similar OS which supports Fish Shell 3.6+ should work,
including Debian, Ubuntu, Kali, Fedora, etc. It will probably work with any
Linux-like OS but has only been tested on Debian-based distros (e.g. Debian 11,
Kali Linux and Ubuntu LTS).

If you're using Windows WSL, you can use these commands to install/uninstall our
preferred distro:

```powershell
$ wsl --unregister Debian
$ wsl --install -d Debian
```

You should be able to run this repo in any user account.

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
echo "$HOME/.local/bin/fish" | sudo tee -a /etc/shells
```

Install `chezmoi` and generate configuration files based on values in Strategy
Coach Workspaces Host `chezmoi` templates (`/lb` in the URL means put `chezmoi`
in ~/.local/bin):

```bash
sh -c "$(curl -fsLS get.chezmoi.io/lb)" -- init --apply strategy-coach/workspaces-host
```

After `chezmoi` is initialized, edit the config file with your configuration:

```bash
$ vim.tiny ~/.config/chezmoi/chezmoi.toml
$ ~/.local/bin/chezmoi apply
```

Let's finish up by configuring 'Fish' as our default shell, prompt decorations,
and endpoint observability (osquery, et. al.):

```bash
~/.strategy-coach/finalize-setup
chsh -s ~/.local/bin/fish
exit
```

At this point the default configuration should be complete and you can start
using your Coach Workspaces (CWS). Start a new session and run this command to
see if everything looks good:

```bash
$ coach-doctor.ts
```

`coach-doctor.ts` is a Deno script which checks that all our dependencies are
available.

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
$ chezmoi upgrade                   # run once in a while
$ chezmoi update && chezmoi apply   # run daily at least
```

<mark>** DO NOT EDIT ** chezmoi-managed files</mark>. To see which files are
managed by chezmoi run _chezmoi managed_ and edit those using guidance in the
_Contributing_ section below.

### Running chezmoi-managed scripts manually

There are a few chezmoi-managed scripts that are automatically run when
necessary:

- `run_once_install-packages.sh.tmpl`
- `run_onchange_dot_eget.toml.sh.tmpl`

These and other "managed" scripts show up like this:

```bash
$ chezmoi managed | grep '\.sh$'
.eget.toml.sh
install-packages.sh
```

#### Force the chezmoi-managed script execution to Install / Update

If you ever need to run chezmoi-managed scripts "manually" or forcefully install
the tools mentioned in this script to latest version. you would use:

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

## Polyglot Languages Installation and Directory-specific Version Management

We use `pkgx` to manage languages and utilities when deterministic
reproducibility is not crucial and convenience is more important.

For complex setups you should also check out [mise](https://mise.jdx.dev/).

`pkgx` and `mise` enable tools to be installed and, more importantly, support
multiple versions simultaneously. For example, we heavily use `Deno` for
multiple projects but each project might require a different version. `pkgx` and
`mise` support global, per session, and per project (directory) version
configuration strategy.

### Per-project and per-directory configuration management tools

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

If you're using `mise` you should use the built-in `direnv`-like capability in
`mise`.

## Conventions

- We use `$HOME/.local/bin` for binaries whenever possible instead globally
  installing them using `sudo`.
- We use `direnv` and per-directory `.envrc` to help manage secrets and
  env-based configurations per-project rather than globally.

## Packages

Run `coach-doctor.ts` to get list of useful packages and versions included. Some
highlights:

- We use [fish shell](https://fishshell.com/) for our CLI.
- We use `git` and `git-extras` and define many `git-*` individual scripts (e.g.
  `mGit`) because we're a GitOps shop.
- We use [pkgx](https://pkgx.sh) and its _Shell Integration_ plus `dev` modes
  for typical tools isolation.
- We use [mise](https://mise.jdx.dev/) for complex tools.
- We use [deno](https://deno.land) for custom scripting and `dax` command runner
  to execute tasks. We favor `deno` over `make` for new packages but `make` is
  still a great tool for legacy requirements. If we create complex scripts that
  need to perform shell manipulation, `deno` with
  [dax](https://github.com/dsherret/dax) is preferred over making system calls
  in `deno`.
- We use [gopass](https://www.gopass.pw/) for managing secrets that should not
  be in plaintext.
- We use `osQuery`, `cnquery`, `steampipe`, et. al. system and endpoint
  observabilty tools for SOC2 and other compliance requirements.
- We use `OpenObserve` for metrics, tracing, logging and similar application
  lifecycle obsverability.

## Environment Variables

- `XDG_CACHE_HOME` (defined in `dot_config/fish/config.fish`)
- `IS_COACH_WSH` and `IS_COACH_WSH_WSL` (defined in
  `dot_config/fish/conf.d/coach-workspaces-home.fish`)

## PATH

- `$HOME/.local/bin` (defined in `dot_config/fish/config.fish`)

## Managed Git Repos (GitHub, GitLab, etc.) Tools

Please review [Coach Workspaces](https://github.com/strategy-coach/workspaces)
for our opinionated approach to cloning and working with "managed" Git repos
(from GitHub, GitLab, BitBucket, etc.).

## Semantic Versioning

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
