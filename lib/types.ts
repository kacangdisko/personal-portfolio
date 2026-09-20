export type ViewKey =
  | "about"
  | "projects"
  | "research"
  | "experience"
  | "stack"
  | "contact"
  | "resume"
  | "help";

export interface Profile {
  name: string;
  shortName: string;
  tagline: string;
  location: string;
  bio: string[];
  education: Education[];
  links: ProfileLink[];
}

export interface Education {
  school: string;
  credential: string;
  detail?: string;
  location: string;
  period: string;
}

export interface ProfileLink {
  label: string;
  value: string;
  href: string;
  external: boolean;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  role: string;
  team: string;
  period: string;
  stack: string[];
  /** Path under /public. Renders a labelled placeholder well until the file exists. */
  image: string | null;
  imageAlt: string;
  body: string;
  highlights: string[];
  /** "owner/repo" — enables live GitHub data at build time. Optional. */
  githubRepo?: string;
  links: { label: string; href: string }[];
}

export type ResearchStatus = "published" | "accepted" | "review" | "ongoing";

export interface Research {
  slug: string;
  title: string;
  venue: string;
  status: ResearchStatus;
  statusLabel: string;
  period: string;
  authorship: string;
  team: string;
  body: string;
  highlights: string[];
  links: { label: string; href: string }[];
}

export interface Role {
  id: string;
  role: string;
  org: string;
  period: string;
  notes: string[];
}

export interface StackGroup {
  group: string;
  items: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
}

export interface Command {
  name: string;
  view: ViewKey | null;
  aliases: string[];
  desc: string;
}

export interface RepoStat {
  stars: number;
  language: string | null;
  updated: string | null;
}

export type RepoStats = Record<string, RepoStat>;
