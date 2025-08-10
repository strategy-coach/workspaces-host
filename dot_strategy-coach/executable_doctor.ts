#!/usr/bin/env -S deno run --allow-all

import * as colors from "https://deno.land/std@0.212.0/fmt/colors.ts";
import { build$, CommandBuilder } from "https://deno.land/x/dax@0.36.0/mod.ts";

const $ = build$({ commandBuilder: new CommandBuilder().noThrow() });

export type ReportResult = {
  readonly ok: string;
} | {
  readonly warn: string;
} | {
  readonly suggest: string;
};

export interface DoctorReporter {
  (
    args: ReportResult | {
      readonly test: () => ReportResult | Promise<ReportResult>;
    } | {
      ensure: {
        readonly cmd: string;
        readonly cmdVersion?: (cmd: string) => string | Promise<string>;
      };
    },
  ): Promise<void>;
}

export interface DoctorDiagnostic {
  readonly diagnose: (report: DoctorReporter) => Promise<void>;
}

export interface DoctorCategory {
  readonly label: string;
  readonly diagnostics: () => Generator<DoctorDiagnostic, void>;
}

export function doctorCategory(
  label: string,
  diagnostics: () => Generator<DoctorDiagnostic, void>,
): DoctorCategory {
  return {
    label,
    diagnostics,
  };
}

export function denoDoctor(): DoctorCategory {
  return doctorCategory("Deno", function* () {
    const deno: DoctorDiagnostic = {
      diagnose: async (report: DoctorReporter) => {
        report({ ok: (await $`deno --version`.lines())[0] });
      },
    };
    yield deno;
  });
}

/**
 * Doctor task legend:
 * - 🚫 is used to indicate a warning or error and should be corrected
 * - 💡 is used to indicate an (optional) _suggestion_
 * - 🆗 is used to indicate success
 * @param categories
 * @returns
 */
export function doctor(categories: () => Generator<DoctorCategory>) {
  // deno-lint-ignore require-await
  const report = async (options: ReportResult) => {
    if ("ok" in options) {
      console.info("  🆗", colors.green(options.ok));
    } else if ("suggest" in options) {
      console.info("  💡", colors.yellow(options.suggest));
    } else {
      console.warn("  🚫", colors.brightRed(options.warn));
    }
  };

  return async () => {
    for (const cat of categories()) {
      console.info(colors.dim(cat.label));
      for (const diag of cat.diagnostics()) {
        await diag.diagnose(async (options) => {
          if ("test" in options) {
            try {
              report(await options.test());
            } catch (err) {
              report({ warn: err.toString() });
            }
          } else if ("ensure" in options) {
            const { cmd, cmdVersion } = options.ensure;
            try {
              if (await $.commandExists(cmd)) {
                if (cmdVersion) {
                  report({ ok: await cmdVersion(cmd) });
                } else {
                  report({
                    ok: (await $`${cmd} --version`.text()).replace(
                      /\s+version\s+/,
                      " ",
                    ),
                  });
                }
              } else {
                report({ warn: `\`${cmd}\` command not found` });
              }
            } catch (err) {
              report({ warn: err.toString() });
            }
          } else {
            report(options);
          }
        });
      }
    }
  };
}

const firstWords = (text: string, count: number) =>
  text.split(/[ ,]/).filter((_, i) => i < count).join(" ").replace(
    /\s+version\s+/,
    " ",
  );

export const checkup = doctor(function* () {
  yield doctorCategory("Workspaces Host", function* () {
    yield {
      diagnose: async (report) => {
        await report({
          ensure: {
            cmd: "fish",
            cmdVersion: async (cmd) =>
              (await $`${cmd} --version`.text()).replace(
                /fish, version (.*)/,
                (_, version) => `fish ${version}`,
              ),
          },
        });
        await report({
          ensure: {
            cmd: "oh-my-posh",
            cmdVersion: async (cmd) =>
              `${cmd} ${await $`${cmd} --version`.text()}`,
          },
        });
        await report({ ensure: { cmd: "osqueryi" } });
        await report({ ensure: { cmd: "git" } });
        await report({
          ensure: {
            cmd: "chezmoi",
            cmdVersion: async (cmd) =>
              firstWords(await $`${cmd} --version`.text(), 3),
          },
        });
        await report({
          ensure: {
            cmd: "direnv",
            cmdVersion: async (cmd) =>
              `${cmd} ${await $`${cmd} --version`.text()}`,
          },
        });
        await report({ ensure: { cmd: "brew" } });
        await report({ ensure: { cmd: "pkgx" } });
        await report({
          ensure: {
            cmd: "mise",
            cmdVersion: async (cmd) =>
              `${cmd} ${await $`${cmd} --version`.text()}`,
          },
        });
        await report({ ensure: { cmd: "eget" } });
        await report({
          ensure: {
            cmd: "gopass",
            cmdVersion: async (cmd) =>
              firstWords(await $`${cmd} --version`.text(), 3),
          },
        });
        await report({ ensure: { cmd: "pgpass" } });
        await report({
          ensure: {
            cmd: "git-semtag",
            cmdVersion: async (cmd) =>
              `${cmd} ${((await $`${cmd} --version`.text()).split(" ")[1])}`,
          },
        });
        await report({
          ensure: {
            cmd: "git-mgitstatus",
            cmdVersion: async (cmd) =>
              `${cmd} ${(await $`${cmd} --version`.text())}`,
          },
        });
        await report({ ensure: { cmd: "surveilr" } });
        await report({ ensure: { cmd: "openobserve" } });
      },
    };
  });
  yield doctorCategory("Coach Infrastructure", function* () {
    yield* denoDoctor().diagnostics();
  });
  yield doctorCategory("OS Typical", function* () {
    yield {
      diagnose: async (report) => {
        await report({
          ensure: {
            cmd: "curl",
            cmdVersion: async (cmd) =>
              // curl --version returns multiple lines and text so we take only first two words of first line
              // deno-fmt-ignore
              (await $`${cmd} --version`.lines())[0].split(" ").filter((_, i) => i < 2).join(" "),
          },
        });
        await report({
          ensure: {
            cmd: "wget",
            cmdVersion: async (cmd) =>
              firstWords((await $`${cmd} --version`.lines())[0], 3),
          },
        });
      },
    };
  });
  const javaHome = Deno.env.get("JAVA_HOME");
  if (javaHome) {
    yield doctorCategory(
      `Java (${javaHome})`,
      function* () {
        yield {
          diagnose: async (report) => {
            await report({
              ensure: {
                cmd: "java",
                cmdVersion: async (cmd) =>
                  (await $`${cmd} --version`.lines())[0],
              },
            });
            await report({
              ensure: {
                cmd: "mvn",
                cmdVersion: async (cmd) =>
                  (await $`${cmd} --version`.lines())[0],
              },
            });
          },
        };
      },
    );
  } else {
    console.info(
      colors.dim(
        `Use \`setup-java-amazon-corretto\` to install Java (see ~/.config/fish/functions/setup-java-amazon-corretto.fish)\nUse \`inspect-java-home-env\` to help with JAVA_HOME value.`,
      ),
    );
  }
});

if (import.meta.main) {
  await checkup();
}
