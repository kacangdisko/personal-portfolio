import type { RepoStats } from "./types";

/**
 * Fetched at build time and revalidated daily. No token is needed at this
 * volume, so nothing secret ships to the client.
 *
 * Every call is wrapped: if GitHub is down, rate-limits the build, or a repo
 * goes private, the site builds anyway and the UI simply omits the live line.
 * A portfolio that fails to deploy because of a third-party API is a bad trade.
 */
export async function getRepoStats(repos: string[]): Promise<RepoStats> {
  const stats: RepoStats = {};

  await Promise.all(
    repos.map(async (full) => {
      try {
        const res = await fetch(`https://api.github.com/repos/${full}`, {
          headers: { Accept: "application/vnd.github+json" },
          next: { revalidate: 86400 },
        });
        if (!res.ok) return;
        const data = await res.json();
        stats[full] = {
          stars: data.stargazers_count ?? 0,
          language: data.language ?? null,
          updated: data.pushed_at ?? null,
        };
      } catch {
        // Silent by design — see the note above.
      }
    }),
  );

  return stats;
}

export function formatUpdated(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "updated today";
  if (days === 1) return "updated yesterday";
  if (days < 30) return `updated ${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `updated ${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `updated ${years} year${years > 1 ? "s" : ""} ago`;
}
