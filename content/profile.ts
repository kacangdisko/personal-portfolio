import type { Profile } from "@/lib/types";

export const profile: Profile = {
  name: "Dzaky Rizha Anargya",
  shortName: "dzaky",
  tagline: "Computer Science undergraduate — Intelligent Systems",
  location: "Jakarta, Indonesia",

  bio: [
    "I’m a third-year Computer Science student at Bina Nusantara University, concentrating in Intelligent Systems.",
    "Academically, I really enjoy building products that solve real-world problems I come across in my daily life. They don’t have to be something big. To me, even a simple solution can help others, and just as importantly, teach me something valuable along the way.",
    "I also enjoy academic research. There’s something exciting about diving into a topic, asking questions, and discovering things I didn’t know before.",
    "Outside the classroom, I lead the Education Commission at HIMTI. It’s a role that has taught me more about scheduling, teamwork, and communication than any course ever could. More than that, I’m grateful that HIMTI has given me a community of friends who support one another and a place where we can openly share ideas.",
    "I also love learning about things that have little to do with my major. Most nights, Brian Cox or Neil deGrasse Tyson ends up being my sleep lullaby, though I’m not entirely sure how much of it actually stays in my head, hehe.",
  ],

  education: [
    {
      school: "Bina Nusantara University",
      credential: "B.Sc. Computer Science, Intelligent Systems",
      detail: "GPA 3.51 / 4.00",
      location: "Jakarta, Indonesia",
      period: "Aug 2024 — Expected 2028",
    },
    {
      school: "SMA Telkom Bandung",
      credential: "Mathematics and Science Track",
      location: "Bandung, Indonesia",
      period: "Jul 2021 — Jun 2024",
    },
  ],

  links: [
    {
      label: "Email",
      value: "rizhadzaky@gmail.com",
      href: "mailto:rizhadzaky@gmail.com",
      external: false,
    },
    {
      label: "GitHub",
      value: "github.com/kacangdisko",
      href: "https://github.com/kacangdisko",
      external: true,
    },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/dzakyrizha",
      href: "https://www.linkedin.com/in/dzakyrizha/",
      external: true,
    },
  ],
};

/**
 * Your phone number is on your CV but deliberately NOT on the public site.
 * A portfolio URL gets pasted into job boards and scraped; an email address
 * is enough for anyone who genuinely wants to reach you.
 * If you want it public anyway, add it to `links` above.
 */
