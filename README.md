# Strategy Coach Workspaces Host Setup

This is our opinionated [chezmoi](https://www.chezmoi.io/)-based "workspaces
host" (or "engineering sandbox home") setup for polyglot software development or
any other "creator tasks" that are performed on Linux-like operating systems.

See [chezmoi.toml Example](dot_config/chezmoi/chezmoi.toml.example) to help
understand the variables that can be set and used across chezmoi templates.

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

```bash
# Debian distro-specific, install curl and wget using OS package manager
sudo apt-get -qq update && sudo apt-get install -qq -y curl wget
```

Once you've got `wget` and `curl`, continue installing `upt` (a univeral CLI
which installs native packages) and `pkgx` for more complex package management
tasks (like for engineering environments):

```bash
curl -fsSL https://raw.githubusercontent.com/sigoden/upt/main/install.sh | sudo sh -s -- --to /usr/local/bin
sudo upt install -y unzip git
curl -Ssf https://pkgx.sh | sh
pkgx install fishshell.com chezmoi.io deno.land eget
```

Install `chezmoi` and generate configuration files based on values in Strategy
Coach Workspaces Host `chezmoi` templates:

```bash
sh -c "$(curl -fsSL git.io/chezmoi)" -- init --apply strategy-coach/workspaces-host
```

After `chezmoi` is initialized, edit the config file with your configuration:

```bash
vim.tiny ~/.config/chezmoi/chezmoi.toml
chez apply
```

We prefer `Fish` as the default shell and `Oh My Posh` as the CLI prompts theme
manager. These are configured automatically by `chezmoi`'s first-time
configuration. You should switch your user's default shell to `Fish` by running:

```bash
curl -s https://ohmyposh.dev/install.sh | bash -s -- -d ~/.local/bin
chsh -s /usr/bin/fish
exit
```

At this point the default configuration should be complete and you can start
using your Coach Workspaces (CWS).

## Secrets Management

- Generate [GitHub personal access tokens](https://github.com/settings/tokens)
  and update `$HOME/.config/chezmoi/chezmoi.toml` file (this file is created at
  installation and is private to the user). Then, run `chez apply` to regenerate
  all configuration files that use the global `chezmoi.toml` file.
- `$HOME/.pgpass` should follow
  [PostgreSQL .pgpass](https://tableplus.com/blog/2019/09/how-to-use-pgpass-in-postgresql.html)
  rules for password management.

## Maintenance

Regularly run, or when `github.com/strategy-coach/workspaces-host` repo is
updated:

```bash
chez upgrade
chez update
```

<mark>** DO NOT EDIT ** chezmoi-managed files. To see which files are managed by
chezmoi run _chezmoi managed_ and edit those using guidance in the
_Contributing_ section below.</mark>

### Running chezmoi-managed scripts manually

There are a few chezmoi-managed scripts that are automatically run when
necessary:

- `run_once_dot_eget.toml.sh.tmpl`
- `run_once_install-packages.sh.tmpl`

These and other "managed" scripts show up like this:

```bash
$ chezmoi managed | grep '\.sh$'
.eget.toml.sh
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

### Starting Prometheus

To start Prometheus, prepare the
[prometheus.yml](https://prometheus.io/docs/prometheus/latest/getting_started/#configuring-prometheus-to-monitor-itself)
configuration file at any directory of your choice. Change to the directory
containing the Prometheus configuration file and run:

```bash
# By default, Prometheus stores its database in ./data (flag --storage.tsdb.path).
prometheus --config.file=prometheus.yml
```

Prometheus should start up. You should also be able to browse to a status page
about itself at localhost:9090

### Contributing to `home-polyglot` project

To see which files are _managed_ by `chezmoi` run `chezmoi managed`. Never edit
any managed without using `chez edit` or opening the files in the `chezmoi`
source directory. Use `chez edit <managed-file> --apply` like
`chez edit ~/.config/fish/config.fish --apply` when you want to make quick edits
to individual files and apply the changes immediately.

An easier way to modify these file is to use VS Code to edit and manage
`chezmoi` templates and configurations using the `chez-code` alias, which is
basically the same as running `chezmoi cd` and then opening VS Code.

Be sure to follow the
[chezmoi workflows for editing configuration files](https://www.chezmoi.io/user-guide/command-overview/#daily-commands)
and use `chezmoi apply` locally to do your testing.

Whenver possible, create `chezmoi` _templates_ that generate configs (especially
when secrets are involved, like in `.gitconfig`).

PRs are welcome. If you're making changes directly (without a PR), after
updating and before pushing code, tag the release:

```bash
chezmoi cd
# <git commit ...>
git-semtag final && git push
# or git-semtag final -v "vN.N.N" && git push
```

#### Community dotfiles projects to learn from

Study these
[chezmoi-tagged repos](https://github.com/topics/chezmoi?o=desc&s=stars):

- https://github.com/twpayne/dotfiles
- https://github.com/felipecrs/dotfiles
- https://github.com/renemarc/dotfiles

They will have good ideas about how to properly create fully configurable `home`
directories across all of our polyglot engineering stations.

#### Documenting `home-polyglot` project

A project is only as useful as its documentation so if you contribute to or
modify code in this repo be sure to document it using this priority:

- Follow guidance and conventions for Fish (e.g. use `~/.config/fish/*`
  locations), `chezmoi`, `pkgx`, `direnv`, etc. so that developers can easily
  understand your work
- Add comments to scripts that explain not just what is being done but, more
  importantly, _why_
- Whenever possible, explain concepts through visualizations using Draw.io (or
  D2/PlantUML/[diagram-as-code](https://text-to-diagram.com/) utilities).
  - Instead of Visio or any other desktop-based tools please use the
    [hediet.vscode-drawio](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
    VS code extension's `*.drawio.svg` and `*.drawio.png` capabilities. This
    allows you to edit the Draw.io files visually but an `.svg` or `.png` is
    automatically created for the repo (which can then be referenced/linked in
    Markdown like README.me).

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
- We use [pass](https://www.passwordstore.org/) the standard unix password
  manager for managing secrets that should not be in plaintext.
- We use `osQuery`, `cnquery`, `steampipe`, et. al. system and endpoint
  observabilty tools for SOC2 and other compliance requirements

### Environment Variables

- `XDG_CACHE_HOME` (defined in `dot_config/fish/config.fish`)
- `IS_CWS` and `IS_CWS_WSL` (defined in
  `dot_config/fish/conf.d/coach-workspaces-home.fish`)
- `DENO_INSTALL` (defined in `dot_config/fish/conf.d/deno.fish`)
- `MANAGED_GIT_WORKSPACES_HOME` (defined in `direnv` `.envrc` for `mGit`
  workspaces)
- `NPM_AUTH_TOKEN` set to GitHub token if supplied in
  `.config/chezmoi/chezmoi.toml` (defined in
  `dot_config/fish/conf.d/npm.fish.tmpl`)

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
chez cd
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

# Guidance and education

- Use
  [Single\-file scripts that download their dependencies](https://dbohdan.com/scripts-with-dependencies)
  as a guide for learning how to create portable scripts (especially
  [Anything with a Nix package](https://dbohdan.com/scripts-with-dependencies#anything-with-a-nix-package)).

# TODO (Roadmap)

## Implement `gopass` and `summon` integration to remove passwords from .envrc

Instead of putting passwords directly into `.envrc` and other files, use
`gopass` and `summon` (both installed as part of our default packages).

## Add higher-level scripting language support

We prefer Deno for scripts (rather than `bash` or `fish`) because of portability
and that Deno scripts are just Typescript. However, we can and should support
other languages too:

- [ ] [rust-script](https://rust-script.org/) can run Rust files and expressions
      as scripts without any setup or compilation step
- [ ] [erning/gorun](https://github.com/erning/gorun) enables "shebang" in the
      source code of a Go program to run it
- [ ] [bitfield/script](https://github.com/bitfield/script) makes it easy to
      write shell-like scripts in Go - this can be helpful if we need to
      customize things like PocketBase.io

The only downside to using Rust, Go, etc. as scripting languages is that we need
to have compilers available.

## Consider PocketBase.io as built-in BaaS

Instead of using `simple-http-server` switch to
[PocketBase.io](https://PocketBase.io) in case we need a built-in BaaS in
home-polyglot.

## Create CLI completions for `psql` and other commands

`strategy-coach/workspaces-host/lib/postgres/pgpass/pgpass.ts` has a TODO which
suggests
[martin1keogh/zsh_pgpass_completion](https://github.com/martin1keogh/zsh_pgpass_completion)-like
CLI completions. Once that's done incorporate the generated completions into
`home-polyglot`.

## Use `.netrc` and -n with `curl` commands

See
[Do you use curl? Stop using -u. Please use curl -n and .netrc](https://community.apigee.com/articles/39911/do-you-use-curl-stop-using-u-please-use-curl-n-and.html).
We should update all references to `curl` to include `curl -n` so that `.netrc`
is optionally pulled in when we need to use the following configuration:

```
machine api.github.com
  login gitHubUserName
  password gh-personal-access-token
```

When we run into problems of API rate limiting with anonymous use of
`api.github.com` then users can easily switch to authenticated use of
`api.github.com` which will increase rate limits.

## Install optional packages via chezmoi

Use [run_once_install-packages.sh.tmpl](run_once_install-packages.sh.tmpl) in
case we need to install some defaults. See:

```bash
chezmoi execute-template '{{ .chezmoi.osRelease.id }}'      # e.g. debian or ubuntu
chezmoi execute-template '{{ .chezmoi.osRelease.idLike }}'  # e.g. debian if running ubuntu
```

If a release is Debian or Debian-like (e.g. Ubuntu and others) we should
automatically install some packages through `chezmoi`
[scripts to perform actions](https://www.chezmoi.io/docs/how-to/#use-scripts-to-perform-actions).
This might be a better way to install `postgresql-client` and other
database-specific functionality as well as other packages.

## File Management

- Integrate [Wildland](https://wildland.io/), a collection of protocols,
  conventions, and software, which creates a union file system across S3,
  WebDAV, K8s, and other storage providers.

## Evaluate pueue to processes a queue of shell commands

[Pueue](https://github.com/Nukesor/pueue) is a command-line task management tool
for sequential and parallel execution of long-running tasks. There is also
`pueued` daemon, with runs processes runs in the background (no need to be
logged in).
