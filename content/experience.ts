import type { Role, StackGroup, Certification } from "@/lib/types";

export const experience: Role[] = [
  {
    id: "himti-education",
    role: "General Manager of Education",
    org: "HIMTI — Himpunan Mahasiswa Teknik Informatika",
    period: "Feb 2026 — Present",
    notes: [
      "Lead an Education commission of 152 activists across 7 regional campuses: Kemanggisan, Alam Sutera, Bekasi, Bandung, Semarang, Malang and Medan.",
      "Plan and oversee every academic event category (company visits, seminars, workshops, community outreach (PKM) and webinars), coordinating timelines with each regional team.",
    ],
  },
  {
    id: "freshmen-leader",
    role: "Freshmen Leader and Freshmen Partner",
    org: "Bina Nusantara University",
    period: "Aug 2025 — Aug 2026",
    notes: [
      "Guided new students through orientation and their first-year transition, supporting academic and social adaptation through mentoring and regular check-ins.",
    ],
  },
  {
    id: "pkm-secretary",
    role: "Secretary, Pengabdian Kepada Masyarakat 2025",
    org: "HIMTI — Himpunan Mahasiswa Teknik Informatika",
    period: "Jul 2025 — Oct 2025",
    notes: [
      "Drafted official correspondence, event proposals and partnership letters, and kept communication flowing between internal committees and external institutions.",
    ],
  },
  {
    id: "hishot-coordinator",
    role: "Coordinator, Domestic Study Tour (HISHOT 2025)",
    org: "HIMTI — Himpunan Mahasiswa Teknik Informatika",
    period: "Mar 2025 — Oct 2025",
    notes: [
      "Led a 4-person team organising an academic study tour to Garena Indonesia, securing the partnership and managing logistics, scheduling and participant coordination.",
    ],
  },
];

export const stack: StackGroup[] = [
  {
    group: "Languages",
    items: ["Python", "SQL", "C", "Java", "JavaScript", "TypeScript"],
  },
  {
    group: "Machine Learning",
    items: [
      "PyTorch",
      "TensorFlow",
      "Transformers",
      "Vision Transformers",
      "LoRA / PEFT",
      "seq2seq fine-tuning",
    ],
  },
  {
    group: "Data",
    items: ["pandas", "NumPy", "matplotlib", "seaborn", "GeoPandas"],
  },
  {
    group: "Engineering",
    items: ["FastAPI", "React", "Tailwind CSS", "Git", "GitHub Actions"],
  },
  {
    group: "Design",
    items: ["Figma"],
  },
  {
    group: "Spoken",
    display: "text",
    items: ["Bahasa Indonesia (native)", "English (professional working proficiency)"],
  },
];

export const certifications: Certification[] = [
  { title: "Data Analysis Course", issuer: "Udemy", date: "Sep 2026" },
  { title: "Azure AI Fundamentals", issuer: "Microsoft", date: "Mar 2026" },
  {
    title: "Event Division Volunteer",
    issuer: "ICPC Asia Jakarta 2025",
    date: "Nov 2025",
  },
  { title: "Building Conversational AI Applications", issuer: "NVIDIA", date: "Aug 2025" },
];
