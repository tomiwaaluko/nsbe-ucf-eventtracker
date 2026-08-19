#!/usr/bin/env node
/**
 * Dependency audit gate.
 *
 * `npm audit --audit-level=high` fails on every high/critical advisory,
 * including ones with no published fix. That makes the gate permanently red
 * for reasons no pull request can address -- and a permanently red gate is one
 * people learn to scroll past, which costs more than it buys.
 *
 * This gate fails only on advisories that are actionable right now: high or
 * critical severity with a non-breaking fix available. Advisories that need a
 * major-version bump, or that have no published fix at all, are printed in
 * full and left for a human to schedule. They stay visible without blocking.
 *
 * Exit codes: 0 = nothing actionable, 1 = actionable findings or audit failed.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const BLOCKING_SEVERITIES = new Set(["high", "critical"]);

// On CI (Linux) npm is spawned directly with no shell involved. On Windows npm
// is a .cmd shim, which Node refuses to spawn without a shell, so that path
// passes one constant string - no interpolation, nothing user-supplied.
const spawnOptions = { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 };
const proc =
  process.platform === "win32"
    ? spawnSync("npm audit --json", { ...spawnOptions, shell: true })
    : spawnSync("npm", ["audit", "--json"], spawnOptions);

// npm audit exits non-zero whenever it finds anything at all, so its exit code
// tells us nothing on its own. What matters is whether a parseable report came
// back: if one did not, the audit did not actually run, and reporting success
// would be worse than reporting failure.
let report;
try {
  report = JSON.parse(proc.stdout);
} catch {
  console.error("npm audit returned no parseable JSON - the audit did not run.");
  console.error((proc.stdout || "").slice(0, 2000));
  console.error((proc.stderr || "").slice(0, 2000));
  process.exit(1);
}

if (report.error) {
  console.error(`npm audit failed: ${report.error.summary || "unknown error"}`);
  process.exit(1);
}
if (typeof report.auditReportVersion !== "number") {
  console.error("Unrecognised npm audit report format - refusing to pass.");
  process.exit(1);
}

const vulns = report.vulnerabilities || {};

/**
 * Decide whether a package's advisory can actually be cleared today.
 *
 * npm's own `fixAvailable` is not sufficient on its own. A package that is
 * vulnerable purely *through* a dependency gets `fixAvailable: true` even when
 * the only real remedy is a semver-major change to that dependency -- npm
 * reports jest-resolve-dependencies that way, while its sole path
 * (jest-snapshot) can only be fixed by moving jest across a major. Trusting the
 * flag there produces a finding that `npm audit fix` can never clear, which is
 * the permanently-red failure this gate exists to avoid.
 *
 * So: when every `via` entry is a package name rather than an advisory, defer
 * to those packages instead of to the flag.
 *
 * Returns { deferred: boolean, reason: string }.
 */
const decisionCache = new Map();

function classify(name, chain = new Set()) {
  if (decisionCache.has(name)) return decisionCache.get(name);

  const vuln = vulns[name];
  if (!vuln) return { deferred: false, reason: "run `npm audit fix`" };

  const fix = vuln.fixAvailable;

  if (fix === false) {
    return { deferred: true, reason: "no fix published upstream yet" };
  }
  if (fix && typeof fix === "object") {
    return fix.isSemVerMajor
      ? {
          deferred: true,
          reason: `needs a major-version bump to ${fix.name}@${fix.version} - review before taking`,
        }
      : {
          deferred: false,
          reason: `run \`npm audit fix\` (moves ${fix.name} to ${fix.version})`,
        };
  }

  // fix === true from here on.
  const via = vuln.via || [];
  const ownAdvisories = via.filter((e) => e && typeof e === "object");
  if (ownAdvisories.length > 0) {
    return { deferred: false, reason: "run `npm audit fix`" };
  }

  const parents = via.filter((e) => typeof e === "string");
  if (parents.length === 0) {
    return { deferred: false, reason: "run `npm audit fix`" };
  }

  if (chain.has(name)) {
    // A cycle in the "vulnerable because of" graph. We cannot prove this is
    // unfixable, so report it rather than hide it.
    return { deferred: false, reason: "run `npm audit fix` (cyclic advisory chain - verify by hand)" };
  }

  const nextChain = new Set(chain).add(name);
  // Fixing this package requires every path into it to be fixable. If any one
  // of them needs a major bump, `npm audit fix` leaves this package vulnerable.
  const blockedBy = parents.filter((p) => classify(p, nextChain).deferred);

  const decision =
    blockedBy.length > 0
      ? {
          deferred: true,
          reason: `only fixable by changing ${blockedBy.join(", ")}, which needs a major-version bump`,
        }
      : { deferred: false, reason: "run `npm audit fix`" };

  decisionCache.set(name, decision);
  return decision;
}

const blocking = [];
const deferred = [];

for (const [name, vuln] of Object.entries(vulns)) {
  if (!BLOCKING_SEVERITIES.has(vuln.severity)) continue;

  const advisories = (vuln.via || [])
    .filter((entry) => entry && typeof entry === "object" && entry.title)
    .map((entry) => `${entry.title} (${entry.url})`);

  // A package with only string `via` entries is vulnerable because something
  // it depends on is. Name that chain so the report explains itself.
  const throughDeps = (vuln.via || []).filter((entry) => typeof entry === "string");
  if (advisories.length === 0 && throughDeps.length > 0) {
    advisories.push(`vulnerable via ${throughDeps.join(", ")}`);
  }

  const { deferred: isDeferred, reason } = classify(name);
  const finding = { name, severity: vuln.severity, advisories, action: reason };
  (isDeferred ? deferred : blocking).push(finding);
}

const lines = [];
const workspace = process.env.AUDIT_WORKSPACE || process.cwd();
lines.push(`### Dependency audit - \`${workspace}\``, "");

const render = (heading, findings) => {
  lines.push(`**${heading}**`, "");
  if (findings.length === 0) {
    lines.push("_None._", "");
    return;
  }
  for (const f of findings) {
    lines.push(`- \`${f.name}\` (${f.severity}) - ${f.action}`);
    for (const advisory of f.advisories) lines.push(`  - ${advisory}`);
  }
  lines.push("");
};

render(`Blocking - ${blocking.length} high/critical with a non-breaking fix`, blocking);
render(`Deferred - ${deferred.length} high/critical with no safe fix available`, deferred);

const output = lines.join("\n");
console.log(output);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${output}\n`);
}

if (blocking.length > 0) {
  console.error(
    `\nFailing: ${blocking.length} high/critical advisor${blocking.length === 1 ? "y has" : "ies have"} a fix available that has not been taken.`,
  );
  process.exit(1);
}

console.log("No high or critical advisories with an available fix.");
