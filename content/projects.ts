import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    slug: "style-transfer",
    title: "Boomer to Gen Alpha Style Transfer",
    tagline:
      "A 24,885-pair parallel corpus and five fine-tuned seq2seq models for generational style transfer.",
    role: "Project lead — dataset design, fine-tuning experiments",
    team: "Team of 3",
    period: "2026",
    stack: [
      "Python",
      "PyTorch",
      "Transformers",
      "T5 / FLAN-T5 / BART",
      "Gemini 2.5 Flash Lite",
      "Hugging Face Spaces",
    ],
    image: "/images/projects/style-transfer.jpg",
    imageAlt:
      "The Boomer to Gen Alpha style transfer demo, showing an input sentence and its rewritten output.",
    body: "Generational slang drifts fast enough that a model trained on general English rewrites it into something nobody says. We built a parallel English corpus of 24,885 sentence pairs through a Gemini 2.5 Flash Lite generation pipeline, then fine-tuned and benchmarked five encoder-decoder models across the T5, FLAN-T5, and BART families under one fixed training configuration.",
    highlights: [
      "bart-base led on held-out test data: 19.20 BLEU, 41.67 chrF, 0.446 ROUGE-L",
      "Scored 3.17 / 4 on fluency in a 10-rater human evaluation",
      "Winning model deployed as a public Hugging Face Space",
      "I owned dataset design and ran every fine-tuning experiment",
    ],
    githubRepo: "kacangdisko/styletransfer-nlp",
    links: [{ label: "Repository", href: "https://github.com/kacangdisko/styletransfer-nlp" }],
  },

  {
    slug: "bansos",
    title: "BanSos",
    tagline: "Flood risk scoring and community reporting for Jakarta neighbourhoods.",
    role: "Project leader — ideation, risk model",
    team: "Team of 4",
    period: "2026",
    stack: [
      "Python",
      "pandas",
      "GeoPandas",
      "Shapely",
      "FastAPI",
      "React",
      "TypeScript",
      "Supabase",
      "Docker",
      "GitHub Actions",
    ],
    image: "/images/projects/bansos.jpg",
    imageAlt: "The BanSos map view, showing per-location flood risk scores.",
    body: "Flood warnings in Jakarta arrive as city-wide advisories, which is useless if you need to know whether your street floods. BanSos combines rainfall forecasts, water level readings, and administrative boundaries into a coordinate-level risk score, and lets residents file reports that feed back into the picture.",
    highlights: [
      "Designed the coordinate-based risk scoring logic joining forecast, sensor, and boundary data",
      "Led product direction across five Agile sprints",
      "Coordinated a FastAPI backend, React + TypeScript frontend, and Supabase data layer",
      "Shipped with Docker and GitHub Actions CI/CD",
    ],
    githubRepo: "BansosSoftwareEngineering/BanSos",
    links: [
      { label: "Repository", href: "https://github.com/BansosSoftwareEngineering/BanSos" },
    ],
  },

  {
    slug: "burnoutcheck",
    title: "BurnoutCheck",
    tagline:
      "Developer burnout risk from daily work and lifestyle inputs, without storing any of it.",
    role: "Experimentation, UI design, report writing",
    team: "Team of 4",
    period: "2026",
    stack: ["Python", "scikit-learn", "React", "Tailwind CSS"],
    image: "/images/projects/burnoutcheck.jpg",
    imageAlt: "The BurnoutCheck input form and its risk result state.",
    body: "Burnout self-assessments tend to ask you to hand over a lot of personal data to find out something you half suspect already. BurnoutCheck predicts burnout risk from daily work and lifestyle inputs in a privacy-conscious way, and is honest about being an indicator rather than a diagnosis.",
    highlights: [
      "Soft-voting ensemble of six classical models: 80.8% accuracy, 0.804 macro F1",
      "About 3 points above the strongest individual model in the ensemble",
      "Ran model experimentation and designed the React + Tailwind interface",
      "Authored the final project report",
    ],
    githubRepo: "kacangdisko/Burnout_prediction",
    links: [{ label: "Repository", href: "https://github.com/kacangdisko/Burnout_prediction" }],
  },
];
