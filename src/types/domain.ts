export type Dietary = "omnivore" | "vegetarian" | "vegan";
export type Suitability = "suitable" | "possibly_suitable";
export type Confidence = "high" | "medium" | "low";
export type MenuMessageReason = "not_a_menu" | "no_suitable_dishes";

export interface DishResult {
  name: string;
  desc_nl: string;          // max 2 sentences, benefits-framing, never mentions triggers
  ingredients: string[];
  ask_user: string[];       // chef questions in the user's preferred language
  ask_menu: string[];       // same questions in the menu language; [] when menu_lang === user language
  suitability: Suitability;
  confidence: Confidence;
}
export interface MenuMessage { title: string; body_nl: string; reason?: MenuMessageReason; }
export interface MenuAnalysis { menu_lang: string; items: DishResult[]; message?: MenuMessage; }
export interface AnalyzeRequest { images: string[]; triggers: string[]; dietary: Dietary; language: string; }

// Guided step-based profile (v3): the user's checked option ids and per-step
// notes, compiled locally into `sensitivities` (the natural-language text sent
// to analysis). version is kept for migrations (v1 = retired form, v2 = retired
// chat). language defaults to "nl".
export interface UserProfile {
  version: 3;
  dietary: Dietary;
  language: string;
  selections: string[]; // checked option ids across all steps
  stepNotes: Record<string, string>; // per-step "anders…" notes, keyed by step id
  extraNote: string; // free-text "anything else" note
  sensitivities: string; // compiled Dutch summary sent to analysis
}
