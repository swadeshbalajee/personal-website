import type { Loader, LoaderContext } from 'astro/loaders';

/**
 * A Content Layer loader that turns approved GitHub repositories into
 * project entries, entirely at build time — the built site stays fully
 * static, with no runtime calls to GitHub.
 *
 * A repository is picked up when its README's last non-blank line reads
 * `Website: Approved` (case-insensitive, whitespace-tolerant). Add that line
 * to a repo's README and it starts showing up under Projects on the next
 * build; remove it and the repo drops out again.
 *
 * Two more optional lines, anywhere else in the README, control the same
 * flags a local project file would set in frontmatter:
 *
 *   Status: in-progress      (planned | in-progress | completed | archived)
 *   Featured: true
 *
 * Without a `Status:` line, status defaults to `archived` for an archived
 * GitHub repo and `completed` otherwise. Without a `Featured:` line,
 * featured defaults to false. Both are entirely repo-controlled — nothing
 * about status or featured state is set locally for these entries.
 */

const APPROVAL_LINE = /^website\s*:\s*approved$/i;
const STATUS_LINE = /^status\s*:\s*(planned|in-progress|completed|archived)\s*$/im;
const FEATURED_LINE = /^featured\s*:\s*(true|yes)\s*$/im;
const FETCH_TIMEOUT_MS = 10_000;

type ProjectStatus = 'planned' | 'in-progress' | 'completed' | 'archived';

interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  topics?: string[];
  created_at: string;
  pushed_at: string;
}

interface GitHubReadme {
  content: string;
  encoding: string;
}

export interface GithubProjectsLoaderOptions {
  /** GitHub username whose public repositories are scanned. */
  username: string;
  /**
   * Optional token for the GitHub API, read at build time only (e.g. from
   * `process.env.GITHUB_TOKEN`). Raises the unauthenticated rate limit from
   * 60 to 5,000 requests/hour; not required for a small number of repos.
   */
  token?: string;
  /** Skip forked repositories. Defaults to true. */
  excludeForks?: boolean;
}

function authHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchJson<T>(
  url: string,
  token: string | undefined,
  logger: LoaderContext['logger'],
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: authHeaders(token),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      if (response.status !== 404) {
        logger.warn(`GitHub API request failed (${response.status}) for ${url}`);
      }
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    logger.warn(`GitHub API request errored for ${url}: ${String(error)}`);
    return null;
  }
}

function decodeReadme(readme: GitHubReadme): string {
  if (readme.encoding !== 'base64') return '';
  return Buffer.from(readme.content.replace(/\n/g, ''), 'base64').toString('utf-8');
}

function isApproved(readmeText: string): boolean {
  const lines = readmeText.split('\n').map((line) => line.trim());
  const lastNonBlank = [...lines].reverse().find((line) => line.length > 0);
  return !!lastNonBlank && APPROVAL_LINE.test(lastNonBlank);
}

function parseStatus(readmeText: string, fallback: ProjectStatus): ProjectStatus {
  const match = STATUS_LINE.exec(readmeText);
  return (match?.[1]?.toLowerCase() as ProjectStatus | undefined) ?? fallback;
}

function parseFeatured(readmeText: string): boolean {
  return FEATURED_LINE.test(readmeText);
}

export function githubApprovedReposLoader(options: GithubProjectsLoaderOptions): Loader {
  const { username, token, excludeForks = true } = options;

  return {
    name: 'github-approved-repos',
    async load({ store, logger, parseData }: LoaderContext) {
      store.clear();

      const repos = await fetchJson<GitHubRepo[]>(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
        token,
        logger,
      );

      if (!repos) {
        logger.warn(
          `Could not list repositories for GitHub user "${username}" — skipping auto-synced projects for this build.`,
        );
        return;
      }

      let approvedCount = 0;

      for (const repo of repos) {
        if (excludeForks && repo.fork) continue;

        const readme = await fetchJson<GitHubReadme>(
          `https://api.github.com/repos/${username}/${repo.name}/readme`,
          token,
          logger,
        );
        if (!readme) continue;

        const readmeText = decodeReadme(readme);
        if (!isApproved(readmeText)) continue;

        approvedCount += 1;

        const data = await parseData({
          id: repo.name,
          data: {
            title: repo.name,
            summary: repo.description ?? 'No description provided.',
            publishedAt: repo.created_at,
            updatedAt: repo.pushed_at,
            tags: repo.topics ?? [],
            featured: parseFeatured(readmeText),
            status: parseStatus(readmeText, repo.archived ? 'archived' : 'completed'),
            repositoryUrl: repo.html_url,
            liveUrl: repo.homepage || undefined,
            technologies: repo.topics ?? [],
          },
        });

        store.set({ id: repo.name, data });
      }

      logger.info(`Synced ${approvedCount} GitHub repositories approved for the website.`);
    },
  };
}
