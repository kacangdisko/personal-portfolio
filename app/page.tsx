import Desktop from "@/components/Desktop";
import { projects } from "@/content/projects";
import { getRepoStats } from "@/lib/github";

/** Rebuild the GitHub numbers once a day. */
export const revalidate = 86400;

export default async function Page() {
  const repos = projects
    .map((p) => p.githubRepo)
    .filter((r): r is string => typeof r === "string");

  const repoStats = await getRepoStats(repos);

  return <Desktop repoStats={repoStats} />;
}
