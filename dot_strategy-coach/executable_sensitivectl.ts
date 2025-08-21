#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-sys

/**
 * strategy-coach-sensitivectl.ts
 *
 * Commands:
 *   - backup-to-onedrive-vault [--dry-run]
 *   - restore-from-onedrive-vault [--dry-run]
 *
 * Design:
 *   - All I/O into the Personal Vault is done by Windows PowerShell (invoked from WSL).
 *   - WSL paths are converted to Windows paths (UNC) using `wslpath -w`, so PowerShell
 *     can copy to/from the Linux filesystem (\\wsl$\<distro>\...).
 *   - The Vault path is resolved in PowerShell using:
 *       1) $env:ONEDRIVE_VAULT_PATH if set, else
 *       2) $env:OneDriveCommercial or $env:OneDrive + "Personal Vault".
 *   - If the Vault is locked/unavailable, you’ll get a clear error.
 */

import { Command as Cliffy } from "jsr:@cliffy/command@1.0.0-rc.8";
import * as path from "jsr:@std/path@1.0.6";

/* ----------------------------- Types ----------------------------- */

type Target = {
    fsPath: {
        /** Path on WSL/Linux */
        localSrc: string;
        /** Relative path inside Personal Vault (Windows side) */
        remoteDest: string;
    };
    /** If true, backup fails if localSrc is missing. Otherwise it is skipped. */
    requiredInLocal: boolean;
};

/* ---------------------------- Config ----------------------------- */

const HOME = Deno.env.get("HOME") ?? "~";

const targets: Target[] = [
    {
        fsPath: {
            localSrc: path.join(HOME, ".config", "chezmoi", "chezmoi.toml"),
            remoteDest: path.join(
                "strategy-coach-workspaces (Sensitive)",
                "prime",
                ".config",
                "chezmoi",
                "chezmoi.toml",
            ),
        },
        requiredInLocal: true,
    },
    {
        fsPath: {
            localSrc: path.join(HOME, "workspaces", "ws-ensure.ts"),
            // Per requirement: store without ".ts" in the Vault
            remoteDest: path.join(
                "strategy-coach-workspaces (Sensitive)",
                "prime",
                "workspaces",
                "ws-ensure.ts",
            ),
        },
        requiredInLocal: false,
    },
];

/* --------------------------- Utilities --------------------------- */

async function pathExists(p: string): Promise<boolean> {
    try {
        await Deno.stat(p);
        return true;
    } catch {
        return false;
    }
}

/** Convert a Linux path to a Windows path (often a \\wsl$ UNC) using `wslpath -w`. */
async function wslToWindowsPath(linuxPath: string): Promise<string> {
    const cmd = new Deno.Command("wslpath", {
        args: ["-w", linuxPath],
        stdout: "piped",
        stderr: "piped",
    });
    const out = await cmd.output();
    if (!out.success) {
        const err = new TextDecoder().decode(out.stderr);
        throw new Error(`wslpath failed for ${linuxPath}: ${err.trim()}`);
    }
    return new TextDecoder().decode(out.stdout).trim();
}

/** Escape single quotes for use inside a single-quoted PowerShell string literal. */
function psSingleQuote(s: string): string {
    return s.replace(/'/g, "''");
}

/**
 * Run a small PowerShell snippet (string) in Windows from WSL.
 * We use -NoProfile to keep it fast/stable.
 */
async function runPS(
    script: string,
): Promise<{ ok: boolean; stdout: string; stderr: string }> {
    const cmd = new Deno.Command("powershell.exe", {
        args: ["-NoProfile", "-Command", script],
        stdout: "piped",
        stderr: "piped",
    });
    const out = await cmd.output();
    return {
        ok: out.success,
        stdout: new TextDecoder().decode(out.stdout),
        stderr: new TextDecoder().decode(out.stderr),
    };
}

/** Build a PowerShell expression that resolves the Vault path or exits with a helpful error. */
function psResolveVaultOrExit(): string {
    // This block sets $vault and exits if it doesn't exist.
    return `
$root = $env:ONEDRIVE_VAULT_PATH
if (-not $root -or [string]::IsNullOrWhiteSpace($root)) {
  $root = if ($env:OneDriveCommercial) { $env:OneDriveCommercial } else { $env:OneDrive }
}
$vault = if ($root) { Join-Path $root 'Personal Vault' } else { $null }
if (-not $vault -or -not (Test-Path -LiteralPath $vault)) {
  Write-Error "OneDrive Personal Vault is not accessible. Unlock it in Windows or set ONEDRIVE_VAULT_PATH to the unlocked path."
  exit 2
}
`;
}

/* --------------------------- Core logic -------------------------- */

/** Backup from WSL → OneDrive Personal Vault (via PowerShell). */
async function backupToVault(dryRun: boolean): Promise<void> {
    for (
        const { fsPath: { localSrc, remoteDest }, requiredInLocal } of targets
    ) {
        if (!(await pathExists(localSrc))) {
            if (requiredInLocal) {
                console.error(`Required file missing: ${localSrc}`);
                Deno.exit(1);
            } else {
                console.log(`(optional skipped) ${localSrc}`);
                continue;
            }
        }

        const winSrc = await wslToWindowsPath(localSrc); // UNC for PowerShell
        const psSrc = psSingleQuote(winSrc);
        const psRel = psSingleQuote(
            remoteDest.replaceAll(path.SEPARATOR, path.SEPARATOR),
        ); // normalize to backslash later in PS

        if (dryRun) {
            console.log(
                `[dry-run] COPY WSL -> Vault : "${localSrc}"  ->  "<Vault>\\${remoteDest}"`,
            );
            continue;
        }

        const script = `
${psResolveVaultOrExit()}
$dest = Join-Path $vault '${psRel}'
New-Item -ItemType Directory -Force -Path (Split-Path -LiteralPath $dest) | Out-Null
Copy-Item -LiteralPath '${psSrc}' -Destination $dest -Force
`;
        const res = await runPS(script);
        if (!res.ok) {
            console.error(
                `Backup failed for ${localSrc} -> ${remoteDest}\n${
                    res.stderr || res.stdout
                }`.trim(),
            );
            Deno.exit(1);
        }
        console.log(`• ${localSrc} -> <Vault>\\${remoteDest}`);
    }

    console.log(dryRun ? "Dry-run complete." : "Backup complete.");
}

/** Restore from OneDrive Personal Vault → WSL (via PowerShell writing to \\wsl$). */
async function restoreFromVault(dryRun: boolean): Promise<void> {
    for (const { fsPath: { localSrc, remoteDest } } of targets) {
        // Destination on Linux, but PowerShell will write to the \\wsl$ UNC for this local path
        const winDst = await wslToWindowsPath(localSrc);
        const psDst = psSingleQuote(winDst);
        const psRel = psSingleQuote(
            remoteDest.replaceAll(path.SEPARATOR, path.SEPARATOR),
        );

        if (dryRun) {
            console.log(
                `[dry-run] COPY Vault -> WSL : "<Vault>\\${remoteDest}"  ->  "${localSrc}"`,
            );
            continue;
        }

        const script = `
${psResolveVaultOrExit()}
$src = Join-Path $vault '${psRel}'
if (-not (Test-Path -LiteralPath $src)) {
  Write-Error "Missing in Vault: $src"
  exit 1
}
New-Item -ItemType Directory -Force -Path (Split-Path -LiteralPath '${psDst}') | Out-Null
Copy-Item -LiteralPath $src -Destination '${psDst}' -Force
`;
        const res = await runPS(script);
        if (!res.ok) {
            console.error(
                `Restore failed for ${remoteDest} -> ${localSrc}\n${
                    res.stderr || res.stdout
                }`.trim(),
            );
            Deno.exit(1);
        }
        console.log(`• <Vault>\\${remoteDest} -> ${localSrc}`);
    }

    console.log(dryRun ? "Dry-run complete." : "Restore complete.");
}

/* ------------------------------ CLI ----------------------------- */

await new Cliffy()
    .name("strategy-coach-sensitivectl")
    .version("2.0.0")
    .description(
        "Backup/restore a few sensitive files with OneDrive Personal Vault from WSL using PowerShell I/O.",
    )
    .command("backup-to-onedrive-vault")
    .description(
        "Copy from WSL -> OneDrive Personal Vault (requires the Vault to be unlocked).",
    )
    .option("--dry-run", "Show planned actions without copying.", {
        default: false,
    })
    .action(async ({ dryRun }) => {
        try {
            await backupToVault(dryRun);
        } catch (err) {
            console.error("Backup failed:", err);
            Deno.exit(1);
        }
    })
    .command("restore-from-onedrive-vault")
    .description(
        "Copy from OneDrive Personal Vault -> WSL (requires the Vault to be unlocked).",
    )
    .option("--dry-run", "Show planned actions without copying.", {
        default: false,
    })
    .action(async ({ dryRun }) => {
        try {
            await restoreFromVault(dryRun);
        } catch (err) {
            console.error("Restore failed:", err);
            Deno.exit(1);
        }
    })
    .parse(Deno.args);
