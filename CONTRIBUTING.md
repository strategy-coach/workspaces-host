# Contributing to `workspaces-host` project

To see which files are _managed_ by `chezmoi` run `chezmoi managed`. Never edit
any managed without using `chezmoi edit` or opening the files in the `chezmoi`
source directory. Use `chezmoi edit <managed-file> --apply` like
`chezmoi edit ~/.config/fish/config.fish --apply` when you want to make quick
edits to individual files and apply the changes immediately.

An easier way to modify these file is to use VS Code to edit and manage
`chezmoi` templates and configurations using the `code $(chezmoi source-path)`.

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

## Community dotfiles projects to learn from

Study these
[chezmoi-tagged repos](https://github.com/topics/chezmoi?o=desc&s=stars):

- https://github.com/twpayne/dotfiles
- https://github.com/felipecrs/dotfiles
- https://github.com/renemarc/dotfiles

They will have good ideas about how to properly create fully configurable `home`
directories across all of our polyglot engineering stations.

## Documenting `workspaces-host` project

A project is only as useful as its documentation so if you contribute to or
modify code in this repo be sure to document it using this priority:

- Follow guidance and conventions for Fish (e.g. use `~/.config/fish/*`
  locations), `chezmoi`, `brew`, `pkgx`, `direnv`, etc. so that developers can easily
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
