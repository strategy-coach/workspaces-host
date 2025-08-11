# Strategy Coach Workspaces Host Setup

The Workspaces Host is our opinionated, [chezmoi](https://www.chezmoi.io/)-based
setup for creating a personal, scriptable, and reproducible "engineering
sandbox" — a home base where you can do software development, creative
automation, or any other "maker" tasks in a Linux-like environment.

👉 If you need a Workspace Host document to feed context into an AI engine, use
<mark>[README.prompt.md](README.prompt.md)</mark>.

It’s designed for polyglot workflows — meaning it supports multiple programming
languages and toolchains — but it’s just as valuable for creators who want a
clean, automated setup for things like:

- Writing, editing, and publishing with automation in VS Code.
- Data analysis, creative coding, or generative art projects.
- Scripting repetitive tasks without worrying about breaking the main system.

While we focus on Linux and WSL2, most of the strategy works on macOS too
because the core tools — Fish Shell, Homebrew, chezmoi, pkgx, mise — are fully
cross-platform.

See [chezmoi.toml Example](.chezmoi.toml.tmpl) to help understand the variables
that can be set and used across chezmoi templates. <mark>The
`.chezmoi.toml.tmpl` file generates `~/.config/chezmoi/chemoi.toml` during
installation</mark> but then it is never modified by anyone other than the
Workspaces Host owner.

## Why we call it a "Workspaces Host"

The Workspaces Host setup is designed to give developers, engineers, and
"creators" a repeatable, scriptable, and portable environment for working across
multiple languages and tools on Linux-like systems.

The goal is to:

- Reduce manual setup time by automating installation and configuration with
  chezmoi templates.
- Use opinionated defaults that work well for polyglot development (multiple
  programming languages and toolchains).
- Treat development environments — especially WSL2 instances — as disposable, so
  they can be rebuilt quickly without losing important configuration or secrets.
- Encourage per-project environment management (via `direnv`, `pkgx`, or `mise`)
  so that different projects can have their own versions of tools without global
  conflicts.

This approach ensures that whether you're building in Java,
JavaScript/TypeScript (Deno), Python, Ruby, C/C++, Go, or any other language,
you can switch between projects easily while keeping dependencies clean and
predictable.

Workspaces Host instances are:

- Consistent - All developers across most programming environments use a
  consistent engineering infrastructure so you can get help from others easily.
- Portable – Your setup can be re-applied anywhere with one command.
- Disposable – On WSL2 or a VM, you can destroy and recreate the environment
  without losing important configs.
- Script-first – Everything is automated so you don’t have to remember manual
  steps.
- Multi-language ready – Switch between Java, Deno, Node.js, Go, and more
  without global conflicts.

## For Windows Users (WSL2)

If you want to run Workspaces Host inside a Windows DevBox WSL instance, start
with Microsoft’s
[windows-dev-box-setup-scripts](https://github.com/microsoft/windows-dev-box-setup-scripts)
to get a clean, opinionated workstation.

When using Windows 10/11 with WSL2:

- Create a "disposable" Linux instance via PowerShell CLI or the Windows Store.
- Treat it like a container, not a permanent VM. The cost for creation and
  destruction for a Engineering Sandbox should low so delete and rebuild your
  workspace regularly.
- Store all scripts and configurations in GitHub so you can re-run them easily
  using Fish Shell or chezmoi.

## Linux versions

Any Linux distro or similar OS which supports Homebrew and Fish Shell 4.0+
should work, including Debian, Ubuntu, Kali, Fedora, etc. It will probably work
with any Linux-like OS but has only been tested on Debian-based distros (e.g.
Debian 11, Kali Linux and Ubuntu LTS).

If you're using Windows WSL, you can use these commands to install/uninstall our
preferred distro:

```powershell
$ wsl --unregister Debian
$ wsl --install -d Debian

# if you want to use a different name
$ wsl --install -d Debian --name Debian_08_2025
```

You should be able to run this repo in any user account.

## One-time setup

If you want to upgrade Debian 12 to 13 (until WSL does it automatically)

```bash
sudo sed -i 's/bookworm/trixie/g' /etc/apt/sources.list && sudo apt update && sudo apt -qq -y full-upgrade && sudo apt --purge -qq -y autoremove
```

Install `curl` and `wget` using OS package manager before continuing. This
should be the only distro-specific installation required.

Once you've got `wget` and `curl`, continue installing `upt` (a univeral CLI
which installs native packages) and `brew` for more creator friendly package
management tasks (like for engineering environments):

```bash
# initial `cd` required to go into WSL filesystem instead of WindowsFS
cd && sudo apt-get -qq update && sudo apt-get install -qq -y curl wget
curl -fsSL https://raw.githubusercontent.com/sigoden/upt/main/install.sh | sudo sh -s -- --to /usr/local/bin
for pkg in zip unzip git git-extras libatomic1 jq build-essential; do sudo upt install -y "$pkg"; done
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
brew install gcc fish chezmoi deno eget direnv zoxide eza gopass
curl -Ssf https://pkgx.sh | sh
chezmoi init strategy-coach/workspaces-host
```

At this point the basic infrastructure and required packages as well as Coach
Workspaces Host `chezmoi` templates are installed. Now edit the config file with
your configuration:

```bash
vim.tiny ~/.config/chezmoi/chezmoi.toml
```

Let's finish up by applying the `chezmoi` templates, configuring 'Fish' as our
default shell, setting up prompt decorations, and endpoint observability
(osquery, et. al.):

```bash
chezmoi apply
~/.strategy-coach/finalize-setup
echo "$HOMEBREW_PREFIX/bin/fish" | sudo tee -a /etc/shells
chsh -s $HOMEBREW_PREFIX/bin/fish
exit
```

At this point the default configuration should be complete and you can start
using your Coach Workspaces (CWS). Start a new session and run this command to
see if everything looks good:

```bash
coach-doctor
```

`coach-doctor` is a Deno script which checks that all our dependencies are
available.

## Roadmap

- [ ] Integrate Zero Trust client infrastructure starting with
      [Tailscale](https://github.com/tailscale/tailscale) (Headscale is server
      side) and then add [Nebula](https://github.com/slackhq/nebula) so that we
      can give opinionated options.

## Secrets Management

Portable secrets management is critical because it keeps your tokens, passwords,
and private configuration out of source code and ensures they can be applied
securely across different machines or environments — whether you’re on Linux,
macOS, or WSL2.

The Workspaces Host is built with this in mind:

- Fish shell scripts and chezmoi templates are designed to keep secrets in your
  environment, not hardcoded into scripts or committed to Git.
- `direnv` and similar tools automatically load and unload environment variables
  depending on your current directory, adding an extra layer of protection by
  ensuring secrets aren’t always present in your shell.

### Centralized Secret Storage for Convenience & Security

- Keep GitHub personal access tokens in one place:

  - Store them in `~/.config/chezmoi/chezmoi.toml` (created at installation,
    private to you, not tracked by Git and can be used to store variables which
    can then be inserted into generated scripts).
  - When you need to update a token, change it once here, then run:

    ```bash
    chezmoi apply
    ```

    to automatically regenerate any configuration files that depend on it.
- Manage PostgreSQL credentials in `~/.pgpass` following
  [PostgreSQL’s .pgpass rules](https://tableplus.com/blog/2019/09/how-to-use-pgpass-in-postgresql.html).
  This keeps passwords out of scripts while letting CLI tools connect
  automatically.
- Use [gopass](https://www.gopass.pw/) for other sensitive credentials that
  shouldn’t be in plaintext — especially if they’re used across multiple
  projects.

By centralizing and environment-loading secrets, you:

- Reduce the risk of accidentally committing credentials.
- Make updates easier — change them once and apply everywhere.
- Keep your setup portable — you can recreate your environment on a new system
  without manually hunting for secrets.

### Passwords and secrets management quick reference

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

Keeping your _Workspaces Host_ up to date is important for security,
consistency, and making sure all your tools work correctly.

Think of maintenance in three timeframes:

### Daily

- Keep your local setup in sync with the latest `chezmoi` templates and configs:

  ```bash
  chezmoi update && chezmoi apply
  ```
- This ensures that if the `strategy-coach/workspaces-host` repo changes — or if
  you’ve updated secrets in `~/.config/chezmoi/chezmoi.toml` — they’re applied
  immediately.
- <mark>Reminder: never store passwords, API keys, or other secrets directly in
  your scripts or code</mark>. Keep them in:

  - `chezmoi.toml` (for GitHub tokens and other config-based secrets)
  - `.envrc` files (managed with `direnv` so they’re only loaded per project)
  - `~/.pgpass` for PostgreSQL
  - `gopass` for general secret storage

### Weekly

- Update `chezmoi` itself and check for upstream improvements:

  ```bash
  chezmoi upgrade
  ```
- Review any `.envrc` and project-specific config files to make sure they’re
  still correct and don’t contain sensitive values that should be stored
  elsewhere.

### Monthly (or when you notice breakages)

- Review which files are managed by `chezmoi`:

  ```bash
  chezmoi managed
  ```
- Check your secrets and tokens — replace any that are expiring soon.
- Audit your shell environment to ensure no long-lived secrets are set globally
  without reason.

### Important: <mark>Do Not Edit chezmoi-Managed Files Directly</mark>

Files managed by `chezmoi` are automatically overwritten when you run
`chezmoi apply`. If you need to change them, update the source templates in your
`chezmoi` config rather than editing the live file.

To see which files are managed:

```bash
chezmoi managed
```

### Running `chezmoi`-Managed Scripts Manually

Some scripts — like `run_after_once_dot_strategy-coach.sh.tmpl` — run
automatically only when needed. You can see them with:

```bash
chezmoi managed | grep '\.sh$'
```

### Forcing a Script to Run Again

If you need to force a `chezmoi`-managed script to re-run (for example, after
changing dependencies):

```bash
chezmoi state delete-bucket --bucket=scriptState
chezmoi apply
```

For more detail, see:
[Clear the state of run\_once\_ scripts](https://www.chezmoi.io/user-guide/use-scripts-to-perform-actions/#clear-the-state-of-run_once_-scripts).

Here’s a Quick Reference table you can include in the README or keep as a
separate `MAINTENANCE.md` so developers, engineers, and creators have an easy
daily/weekly/monthly checklist.

### Maintenance Quick Reference

| Frequency | Task                                     | Command(s)                                                                  | Purpose / Notes                                                                                                                      |                                                  |
| --------- | ---------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Daily     | Sync latest chezmoi templates & configs  | `chezmoi update && chezmoi apply`                                           | Pulls updates from `strategy-coach/workspaces-host` and applies them locally. Also reapplies any secret changes from `chezmoi.toml`. |                                                  |
|           | Keep secrets out of code                 | _(no direct command)_                                                       | Store secrets in `~/.config/chezmoi/chezmoi.toml`, `.envrc` (direnv), `~/.pgpass`, or `gopass` — never in scripts or Git commits.    |                                                  |
| Weekly    | Update chezmoi itself                    | `chezmoi upgrade`                                                           | Updates chezmoi to latest version for bug fixes and new features.                                                                    |                                                  |
|           | Review `.envrc` files                    | _(manual review)_                                                           | Ensure no sensitive data is accidentally hardcoded and project-specific env vars are still correct.                                  |                                                  |
| Monthly   | List chezmoi-managed files               | `chezmoi managed`                                                           | Check which files are auto-managed — edit templates, not live files.                                                                 |                                                  |
|           | Audit secrets & tokens                   | _(manual check)_                                                            | Replace expiring tokens, remove unused credentials, confirm they’re in secure storage.                                               |                                                  |
|           | Audit shell environment                  | \`env                                                                       | less\`                                                                                                                               | Check for secrets unnecessarily loaded globally. |
| As Needed | Force a chezmoi-managed script to re-run | `bash<br>chezmoi state delete-bucket --bucket=scriptState<br>chezmoi apply` | Useful when a run-once script needs to be reapplied, e.g. after changing dependencies.                                               |                                                  |

## GitHub Binary Releases Management

Sometimes you need a CLI tool that isn’t available in Homebrew’s Formulae
(package listings) or where the official installation method is downloading a
prebuilt binary from GitHub releases.

That’s where [`eget`](https://github.com/zyedidia/eget) comes in:

- What it does: Downloads and installs the latest release binary from a GitHub
  repo.
- When to use it:

  - A package is _not_ in Homebrew at all but the author of the package manages
    releases in GitHub.
  - You want the absolute latest release, even before it might be added to a
    package manager.
  - You only care about _one binary_ from a repo — not a whole suite of tools.
- Example:

  ```bash
  eget sharkdp/bat
  ```

  This would download and install the latest `bat` binary from its GitHub
  releases.

<mark>See `~/.eget.toml` for automating / scripting `eget` (generated from
`chezmoi` `dot_eget.toml.tmpl`).</mark>

### When to Use `brew` vs. `pkgx` vs. `mise`

The Workspaces Host setup gives you four main ways to install tools, each for
different situations:

| Tool   | Best For                                                                   | Key Advantages                                                      | Example Use                                     |
| ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| `brew` | Popular packages where exact version control is less critical              | Large library of prebuilt formulas; works the same on Linux & macOS | `brew install deno`                             |
| `pkgx` | Running tools without permanent install; trying different versions quickly | No root needed; temporary installs; can install locally per project | `pkgx install node@18`                          |
| `mise` | Complex multi-language setups with strict version requirements             | Per-directory config, reproducibility, language version switching   | `.mise.toml` to pin Python, Node, Java versions |
| `eget` | Installing a single binary from GitHub releases, usually when not in brew  | Gets latest release quickly without compiling                       | `eget someuser/sometool`                        |

#### Quick Decision Guide

- In Homebrew & version control not critical? → Use `brew`
- Need it for just this project or temporary use? → Use `pkgx`
- Need reproducible per-project language/tool versions? → Use `mise`
- Not in brew, only need a single binary from GitHub releases? → Use `eget`

## Polyglot Languages Installation and Directory-specific Version Management

We use `brew` to manage languages and utilities when deterministic
reproducibility is not crucial and convenience is more important.

For complex setups you can also use [mise](https://mise.jdx.dev/).

`brew`, `pkgx` and `mise` enable tools to be installed and, more importantly,
support multiple versions simultaneously. For example, we heavily use `Deno` for
multiple projects but each project might require a different version. `pkgx` and
`mise` support global, per session, and per project (directory) version
configuration strategy.

## Versioned Runtimes & Tools — What to Use, When, and Why

Many languages & ecosystems (Node.js/npm, Python, Ruby, and Java) regularly ship
multiple active versions. Different projects can need different versions at the
same time. The Workspaces Host intentionally supports per-project versioning so
you don’t have to uninstall/reinstall globally every time you switch projects.

### When you should _pin_ versions

Pin a specific version (per directory/project) when:

- The project documents a required version (e.g., `.nvmrc`, `.python-version`,
  `.ruby-version`, or README notes).
- You need reproducible builds (CI/CD, compliance, client deliverables).
- You work across multiple projects that need different versions simultaneously.

### Which tool fits which job?

| Need                                                                                | Best fit          | Why                                                                                                                                          |
| ----------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Fast global install where exact version isn’t critical                              | Homebrew (`brew`) | Simple, cross-platform (Linux + macOS) install path used throughout this setup.                                                              |
| Try a version temporarily or keep tools local to a project/session                  | `pkgx`            | Lightweight, easy to run different versions without polluting the global system.                                                             |
| Stable, pinned per-project versions with an on-disk config                          | `mise`            | Designed for per-directory tool/version configs; ideal for multi-language projects.                                                          |
| Only environment variables (no version managers), “lightweight” per-directory setup | `direnv`          | Loads/unloads env vars when you `cd` into a directory. Great for setting `PATH`, `JAVA_HOME`, or `DENO_INSTALL_ROOT` on a per-project basis. |

> Note: `direnv` just manages environment variables per directory; `mise` (and
> `pkgx`) manage actual tool versions. You can use `direnv` alone for simple env
> rules, or use it alongside `mise`/`pkgx` to export project-specific variables.

### Practical patterns (Node.js, `npm`, Python, Ruby)

- Global for convenience (quick scripts, one-off tasks): Install via `brew`.
  Good when the exact version doesn’t matter.
- Per-project for reliability (apps, libraries, teams): Use `mise` to pin
  versions with a file in the repo (e.g., `.mise.toml`). You can also use `pkgx`
  inside a project to keep versions isolated to that project/session.
- Environment-only tweaks: Use `direnv` to adjust `PATH`, set `NODE_OPTIONS`,
  select a local tool directory, or expose per-project secrets/env — without
  changing global state.

Example (per-project pinning with `mise`):

```toml
# .mise.toml in your project
[tools]
node = "18"     # Project A
# python = "3.11"
# ruby = "3.3"
# npm version follows Node in most setups; if you need a specific npm, you can manage it via project scripts.
```

Switching directories automatically activates the right versions.

### Java: versions _and_ vendors using SDKMAN!

Java is special because you often choose both:

- A _version_ (e.g., 17 LTS vs 21 LTS), _and_
- A _vendor_ (different distributions of the JDK).

This Workspaces Host includes:

- SDKMAN! for managing Java and the Java ecosystem SDKs.
- An opinionated function to install Amazon Corretto:

  ```fish
  setup-java-amazon-corretto
  ```
- `JAVA_HOME` configured in Fish via:

  ```
  ~/.config/fish/conf.d/java.fish
  ```

  (uses the default SDKMAN! configuration)

When to pin Java versions/vendors:

- The project or build tool (Maven/Gradle) requires a specific major/minor.
- You need reproducible builds across dev/CI.
- You are testing vendor-specific behavior (e.g., Amazon Corretto as provided
  here).

How to manage Java per project:

- Lightweight (env-only): Use `direnv` to set `JAVA_HOME` to the JDK you want
  for that project (and adjust `PATH`).
- Version manager: Use SDKMAN! to install/select specific Java versions/vendors
  globally, then optionally pin via per-project scripts or combine with `direnv`
  to activate the right `JAVA_HOME` when you enter the directory.
- Mixed stacks: If your project also pins Node/Python/Ruby, consider `mise` for
  those languages and use `direnv` + SDKMAN! for Java, or use `mise` alongside
  `direnv` purely for coordination. (Keep in mind: the README’s Java path is
  SDKMAN! + the provided Fish helpers.)

### Quick decision guide

- One global version is fine? → `brew`.
- Need a tool just for this project/session? → `pkgx`.
- Need repeatable, per-directory version pinning across multiple languages? →
  `mise`.
- Only need env scoping, not a version manager? → `direnv`.
- Java specifically → Prefer SDKMAN! (with the provided
  `setup-java-amazon-corretto`), optionally paired with `direnv` to set
  `JAVA_HOME` per project.

This approach keeps your machine clean, your projects reproducible, and your
context switches friction-free.

## Environment Variables with `direnv`

Environment variables store configuration values (like `PATH`, API keys, or
`JAVA_HOME`) outside of your code. This keeps sensitive data such as passwords
and tokens out of scripts and source control while still making them available
to your tools.

`direnv` automates loading and unloading these environment variables based on
the directory you’re in:

- You create a `.envrc` file in a project folder.
- When you cd into that folder, direnv loads the variables from `.envrc` into
  your shell.
- When you leave the folder, direnv removes them, keeping your global
  environment clean.

The first time you create or change `.envrc`, you must run direnv allow to
approve it.

This is useful for:

- Setting project-specific paths (`PATH`, `DENO_INSTALL_ROOT`, etc.).
- Defining per-project secrets (kept in untracked files like `.envrc.local`).
- Adjusting runtime settings for just that project.

Think of direnv as a switch that turns environment variables on when you enter a
project and off when you leave — making your setup portable, safer, and easier
to manage.

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
`mise` (best not to mix `direnv` and `mise`).

## Conventions

- All packages managed by Homebrew are in `/home/linuxbrew/.linuxbrew` and if
  you're scripting anything use that absolute path unless `$HOMEBREW_PREFIX` is
  available in that context.
- We use `$HOME/.local/bin` for binaries whenever possible instead globally
  installing them using `sudo`.
- We use `direnv` and per-directory `.envrc` to help manage secrets and
  env-based configurations per-project rather than globally.

## Packages

Run `coach-doctor` to get list of useful packages and versions included. Some
highlights:

- We use [fish shell](https://fishshell.com/) for our CLI.
- We use `git` and `git-extras` and define many `git-*` individual scripts (e.g.
  `mGit`) because we're a GitOps shop.
- We use [Homebrew](https://brew.sh/) and
  [Homebrew Formulae](https://formulae.brew.sh/).
- We use [pkgx](https://pkgx.sh) and its _Shell Integration_ plus `dev` modes
  for typical tools isolation.
- We use [mise](https://mise.jdx.dev/) for complex tools.
- We use [SDKMAN!](https://sdkman.io/) for Java and its ecosystem SDKs.
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
- Use `setup-java-amazon-corretto` function
  (`~/.config/fish/functions/setup-java-amazon-corretto.fish`) to install
  opinionated Java. `~/.config/fish/conf.d/java.fish` has `JAVA_HOME` set to
  default SDKMAN! configuration.
- Use Homebrew to install NodeJS globally or `pkgx install node npm` to install
  versioned NodeJS locally in your environment.

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
