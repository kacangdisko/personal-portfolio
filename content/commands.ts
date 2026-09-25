import type { Command, ViewKey } from "@/lib/types";

export const commands: Command[] = [
  {
    name: "about",
    view: "about",
    aliases: ["whoami", "me", "bio"],
    desc: "Who I am, what I study, and where.",
  },
  {
    name: "projects",
    view: "projects",
    aliases: ["work", "portfolio"],
    desc: "Things I built, converting ideas into real things.",
  },
  {
    name: "research",
    view: "research",
    aliases: ["papers", "publications"],
    desc: "List of my conference papers.",
  },
  {
    name: "experience",
    view: "experience",
    aliases: ["org", "activities", "leadership"],
    desc: "Activities that improve me.",
  },
  {
    name: "stack",
    view: "stack",
    aliases: ["skills", "tools", "tech"],
    desc: "Languages, frameworks, and certifications.",
  },
  {
    name: "contact",
    view: "contact",
    aliases: ["email", "links", "hire"],
    desc: "Where you can find me.",
  },
  {
    name: "resume",
    view: "resume",
    aliases: ["cv"],
    desc: "Full formal version of me.",
  },
  {
    name: "help",
    view: "help",
    aliases: ["?", "commands", "menu"],
    desc: "This list.",
  },
  {
    name: "clear",
    view: null,
    aliases: ["cls"],
    desc: "Clear the terminal.",
  },
];

/** Every name and alias mapped to its command. */
export const commandLookup: Record<string, Command> = {};
for (const c of commands) {
  commandLookup[c.name] = c;
  for (const a of c.aliases) commandLookup[a] = c;
}

/** Dock order. `help` sits after a separator, like Finder/Trash on a real dock. */
export const dockOrder: ViewKey[] = [
  "about",
  "projects",
  "research",
  "experience",
  "stack",
  "contact",
  "resume",
  "help",
];

/** Mobile has no terminal, so "Commands" — a reference table of things you'd
    type into it — has nothing to refer to. Shared by the mobile section list
    and each section's "Next" link, so both walk the same order. */
export const mobileOrder: ViewKey[] = dockOrder.filter((key) => key !== "help");

export const viewTitles: Record<ViewKey, string> = {
  about: "About",
  projects: "Projects",
  research: "Research",
  experience: "Experience",
  stack: "Tech Stack",
  contact: "Contact",
  resume: "Resume",
  help: "Commands",
};

/** Easter eggs. Not in `help` — finding them is the point. */
export const eggs: Record<string, string[]> = {
  sudo: ["nice try. This account has no sudo privileges."],
  ls: ["about  projects  research  experience  stack  contact  resume"],
  pwd: ["/home/dzaky/portfolio"],
  exit: ["there is no exit!"],
};
