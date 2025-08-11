#!/usr/bin/env -S deno run -A

import { Command, EnumType } from "jsr:@cliffy/command@^1.0.0-rc.5";
import $ from "jsr:@david/dax@^0.43.2";
import {
    basename,
    fromFileUrl,
    isAbsolute,
    normalize,
    resolve,
} from "jsr:@std/path@^1.0.6";

// The default SENSITIVE_ITEMS are files that are commonly sensitive
// (contain user-specific settings or passwords, etc.). Each item is
// relative to the user's home directory.

// TODO: test this script on Linux, macOS, and Windows and then document the
// expected behavior for each platform. Needs complete documentation on
// how to use this script, what files are included by default, and how to
// customize it. Also, explain the way to define rclone remotes and how the
// default rclone remote is named "workspaces-host-sensitive".

const HOME = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? "";
const SENSITIVE_ITEMS = [
    ".config/chezmoi/chezmoi.toml",
    "workspaces/ws-ensure.ts",
] as const;

enum Strategy {
    Push = "push",
    Pull = "pull",
}

const { args, options } = await new Command()
    .name(basename(fromFileUrl(import.meta.url)))
    .version("1.0.0")
    .description("Safely push and pull sensitive files to using rclone.")
    .type("strategy", new EnumType(Strategy))
    .option("-r --remote <name:string>", "rclone remote name (no colon).", {
        required: true,
        default: "workspaces-host-sensitive",
    })
    .option("-d --dest-root <path:string>", "Destination root on remote.", {
        required: true,
    })
    .option("-i --item <path:string>", "Relative path to sync (repeatable).", {
        collect: true,
    })
    .option("--rclone <path:string>", "Path to rclone binary.", {
        default: await $.which("rclone"),
        required: true,
    })
    .option("--dry-run", "Only perform the conflict-checking dry-run.")
    .option("--verbose", "Enable verbose output.")
    .arguments("<strategy:strategy>")
    .parse(Deno.args);

const normRel = (p: string) => normalize(p).replace(/^\.\/+/, "");
const absFromDir = (rel: string) => isAbsolute(rel) ? rel : resolve(HOME, rel);

try {
    const items = options.item
        ? [...SENSITIVE_ITEMS, ...options.item]
        : SENSITIVE_ITEMS;
    for (const rel of items) {
        const srcAbs = absFromDir(rel);
        try {
            await Deno.stat(srcAbs);
        } catch {
            console.error(`⚠️  Skip '${rel}' → '${srcAbs}': not found.`);
            continue;
        }

        if (options.verbose) console.info(`📄 Item: ${rel}`);

        const cleanRel = normRel(rel);
        const remotePrefix = `${options.remote}:`;
        const remoteDst = `${remotePrefix}${options.destRoot}/${cleanRel}`;
        const rcloneArgs = [
            ...(args[0] == Strategy.Push
                ? [srcAbs, remoteDst]
                : [remoteDst, srcAbs]),
        ];
        if (options.verbose) rcloneArgs.push("--verbose");
        if (options.dryRun) {
            rcloneArgs.push("--dry-run");
            console.info("ℹ️  --dry-run-only set.");
            continue;
        }

        const actualCmd = [options.rclone, "copyto", ...rcloneArgs];
        if (options.verbose) console.warn(actualCmd.join(" "));
        await $`${actualCmd}`;
        console.info(`✅ Done: ${rel}`);
    }
} catch (err) {
    console.error(`❌ ${err instanceof Error ? err.message : String(err)}`);
    Deno.exit(1);
}
