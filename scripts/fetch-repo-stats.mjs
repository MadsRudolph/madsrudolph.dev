// Fetches repo statistics from GitHub (via the authenticated `gh` CLI) and
// writes them to src/data/repo-stats.json, keyed by "owner/name".
//
// Re-run whenever you want to refresh the numbers:  node scripts/fetch-repo-stats.mjs
// Requires: gh CLI logged in (`gh auth status`).

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectsDir = resolve(__dirname, '../src/content/projects');
const outFile = resolve(__dirname, '../src/data/repo-stats.json');

// Collect the unique "owner/name" repos referenced by project frontmatter.
import { readdirSync } from 'node:fs';
const repos = new Set();
for (const f of readdirSync(projectsDir).filter((f) => f.endsWith('.md'))) {
  const src = readFileSync(resolve(projectsDir, f), 'utf8');
  const m = src.match(/^repo:\s*['"]?(https:\/\/github\.com\/([^/'"]+\/[^/'"\s]+))/m);
  if (m) repos.add(m[2]);
}

const gh = (path, extra = []) =>
  execFileSync('gh', ['api', path, ...extra], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function statContributors(repo) {
  // /stats/contributors is computed async: GitHub returns 202 + empty until ready.
  for (let i = 0; i < 8; i++) {
    let raw = '';
    try {
      raw = gh(`repos/${repo}/stats/contributors`).trim();
    } catch {
      /* transient 202/5xx — retry */
    }
    if (raw && raw !== '[]') {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
    await sleep(2000);
  }
  return [];
}

function totalCommitCount(repo) {
  // The Link header's last page number == total commits on the default branch.
  const head = execFileSync('gh', ['api', `repos/${repo}/commits?per_page=1`, '-i'], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  const link = head.split('\n').find((l) => /^link:/i.test(l)) || '';
  const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return m ? Number(m[1]) : null;
}

const out = {};
for (const repo of [...repos].sort()) {
  process.stderr.write(`Fetching ${repo}…\n`);
  const contributors = JSON.parse(
    gh(`repos/${repo}/contributors?per_page=100`, ['--paginate']) || '[]',
  )
    .filter((c) => c.type !== 'Bot' && !/\[bot\]$/.test(c.login)) // drop CI bots
    .sort((a, b) => b.contributions - a.contributions)
    .map((c) => ({
      login: c.login,
      contributions: c.contributions,
      avatarUrl: c.avatar_url,
      htmlUrl: c.html_url,
    }));

  const commitsFromContribs = contributors.reduce((s, c) => s + c.contributions, 0);
  const commits = totalCommitCount(repo) ?? commitsFromContribs;

  const stats = await statContributors(repo);
  let additions = 0,
    deletions = 0;
  for (const a of stats) for (const w of a.weeks) {
    additions += w.a;
    deletions += w.d;
  }

  const meta = JSON.parse(gh(`repos/${repo}`));

  // Prefer the dominant *programming* language by bytes, not markup/docs
  // (repos with a report or timeline page otherwise report as HTML/TeX).
  const NON_CODE = new Set([
    'HTML', 'CSS', 'SCSS', 'Less', 'TeX', 'Makefile', 'CMake', 'Batchfile',
    'Dockerfile', 'Roff', 'Shell', 'PowerShell', 'Jupyter Notebook',
  ]);
  let language = meta.language ?? null;
  try {
    const langs = JSON.parse(gh(`repos/${repo}/languages`));
    const code = Object.entries(langs)
      .filter(([name]) => !NON_CODE.has(name))
      .sort((a, b) => b[1] - a[1]);
    if (code.length) language = code[0][0];
  } catch {
    /* keep meta.language */
  }

  out[repo] = {
    repo,
    url: `https://github.com/${repo}`,
    commits,
    contributors: contributors.length,
    contributorList: contributors,
    additions,
    deletions,
    linesChanged: additions + deletions,
    language,
    private: meta.private,
  };
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
process.stderr.write(`\nWrote ${outFile} (${Object.keys(out).length} repos)\n`);
