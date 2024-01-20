#!/usr/bin/env -S deno run --allow-all

import * as colors from "https://deno.land/std@0.212.0/fmt/colors.ts";
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import * as dax from "https://deno.land/x/dax@0.36.0/mod.ts";

const $ = dax.build$({
  commandBuilder: new dax.CommandBuilder().noThrow(),
});
const HOME = Deno.env.get("HOME") ?? ".";

const localBinDest = (candidate: string) => `${HOME}/.local/bin/${candidate}`;

await Deno.mkdir(`${HOME}/.local/var/log/strategy-coach`, { recursive: true });
const logFileDest = (candidate: string) =>
  `${HOME}/.local/var/log/strategy-coach/${candidate}`;

const latestGitHubTag = async (
  repo: string,
  noOk = "main",
): Promise<string> => {
  const result = await fetch(
    `https://api.github.com/repos/${repo}/releases/latest`,
  );
  return result.ok ? (await result.json()).tag_name : noOk;
};

async function ensureTextFile(
  url: string,
  destFile: string,
  executable: boolean,
): Promise<string | undefined> {
  const response = await fetch(url);
  if (!response.ok) {
    return `Unable to download ${url} as ${destFile} (status: ${response.status} ${response.statusText})`;
  }
  const content = await response.text();
  await Deno.writeTextFile(destFile, content);
  // 0o711 user has rwx, group and world have rx
  if (executable) Deno.chmod(destFile, 0o711);
  return undefined; // success
}

const reportResults = async (cmd: string, result: string, logFile: string) => {
  if (result.trim().length > 0) {
    await Deno.writeTextFile(logFile, result);
    // deno-fmt-ignore
    console.log(colors.red(`🚫 ${cmd} encountered errors or warnings (${colors.brightRed(`see ${logFile}`)}).`));
  } else {
    // deno-fmt-ignore
    console.log(`✅ ${colors.green(`${cmd} completed`)} ${colors.dim(`(no errors or warnings encountered)`)}.`);
  }
};

// deno-fmt-ignore
const setup = new Command()
  .description("Idempotent setup of all Strategy Coach Workspaces Host packages")
  .option("--pkgx-install <package>", "Single string of space separated packages to install with pkgx")
  .option("--log-file <log-file>", "The location of the log file", {
    default: logFileDest('setup.log'),
  })
  .action(async ({ pkgxInstall, logFile }) => {
    const pkgxInstallPkgs = pkgxInstall?.split(/\s+/).filter(p => p.trim().length> 0) ?? [];
    const results: (string | undefined)[] = [];

    console.log(colors.dim(`Setting up Strategy Coach Workspaces Host packages... (tail -f ${logFile})...`));

    for(const pkg of pkgxInstallPkgs) {
      const result = (await $`/usr/local/bin/pkgx install ${pkg}`.stderr("piped")).stderr;
      if(result.indexOf('error') != -1) results.push(result);
    }
    
    // use `~/.eget.toml` configuration to install GitHub packages with `eget`
    results.push((await $`${HOME}/.local/bin/eget --download-all --quiet`.stderr("piped")).stderr);

    // Netspective Labs SQLa `pgpass.ts` parses and allows PostgreSQL connection lookups
    results.push((await $`${HOME}/.local/bin/deno install -A -f --quiet --unstable https://raw.githubusercontent.com/netspective-labs/sql-aide/${await latestGitHubTag('netspective-labs/sql-aide')}/lib/postgres/pgpass/pgpass.ts`.stderr("piped")).stderr);

    results.push(await ensureTextFile('https://raw.githubusercontent.com/pnikosis/semtag/master/semtag', localBinDest('git-semtag'), true))
    results.push(await ensureTextFile('https://raw.githubusercontent.com/fboender/multi-git-status/master/mgitstatus', localBinDest('git-mgitstatus'), true))
    results.push(await ensureTextFile('https://raw.githubusercontent.com/kamranahmedse/git-standup/master/git-standup', localBinDest('git-standup'), true))

    // find all non-null strings from the output and put them into a single string
    reportResults('setup', results.filter(l => l).map(l => l?.trim()).filter(l => l ? (l.length > 0) : false).join("\n\n"), logFile);
  });

await new Command()
  .name("workspaces-host-ctl")
  .description("Strategy Coach Workspaces Host")
  .version("v1.0.0")
  .action(() => console.log(`No subcommand supplied.`))
  .command("setup", setup)
  .parse();
