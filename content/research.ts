import type { Research } from "@/lib/types";

/**
 * Numbers here are taken from the accepted papers, not the CV summary.
 * Where the two disagreed, the paper wins — see README.
 */
export const research: Research[] = [
  {
    slug: "lora-medical-imaging",
    title:
      "Low-Rank Adaptation Provides a Parameter-Efficient Trade-Off for Low-Data Medical Imaging",
    venue: "ICISS 2026",
    status: "accepted",
    statusLabel: "Accepted",
    period: "2026",
    authorship: "Third author",
    team: "7-author research team",
    body:
      "Adapting large pretrained Vision Transformers to medical imaging is awkward: labelled clinical data is scarce and full fine-tuning is expensive. We ran a multi-seed, multi-modality study of parameter-efficient fine-tuning under a matched low-data protocol, comparing linear probing, LoRA at ranks 4, 8 and 16, DoRA, AdaLoRA, and full fine-tuning on a ViT-Base backbone across BreastMNIST ultrasound and PneumoniaMNIST chest X-ray.",
    highlights: [
      "Every dataset-condition pair repeated over 10 random seeds, with Holm-corrected paired significance tests",
      "LoRA at rank 8 retained 90.3% of full fine-tuning ROC-AUC on BreastMNIST and 98.4% on PneumoniaMNIST — while training 0.35% of the parameters",
      "Raising LoRA rank beyond 8 gave no significant improvement; LoRA and DoRA were statistically comparable",
      "PEFT methods produced better-calibrated probabilities than full fine-tuning despite lower AUC",
      "I designed the experimental methodology and ran the controlled comparisons",
    ],
    links: [],
  },

  {
    slug: "medmnist-representations",
    title:
      "A Classifier Controlled Study of Richer Visual Representations for MedMNIST Classification",
    venue: "ICIMTech 2026",
    status: "accepted",
    statusLabel: "Accepted",
    period: "2026",
    authorship: "Second author",
    team: "5-author research team",
    body:
      "Prior comparisons of visual representations mix different extractors, classifiers, and fine-tuning strategies, so it is never clear whether a win came from the representation or the classifier. We fixed the downstream classifier — one MLP, weighted cross-entropy — and projected every representation to a common 128 dimensions, which separates representation quality from raw dimensionality.",
    highlights: [
      "Compared PCA, a convolutional autoencoder, and frozen MAE-pretrained ViTs at three scales",
      "Evaluated across four MedMNIST v2 datasets spanning dermatoscopy, histopathology, chest X-ray and fundus imaging",
      "MAE-ViT led on complex multi-class tasks — 93.47% on PathMNIST, 78.54% on DermaMNIST",
      "Richer is not universally better: the margin was small on binary PneumoniaMNIST and every method stayed weak on RetinaMNIST",
      "I designed the methodology and produced the result visualisations",
    ],
    links: [
      { label: "Repository", href: "https://github.com/kacangdisko/rm-project" },
    ],
  },
];
