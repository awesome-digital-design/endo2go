import type { MenuAnalysis } from "@/types/domain";
import { content } from "@/lib/content";

export const mockAnalysis: MenuAnalysis = {
  menu_lang: "it",
  items: [
    {
      name: "Gegrilde zalm met groenten",
      desc_nl: "Licht verteerbaar en rijk aan goede vetten.",
      ingredients: ["zalm", "courgette", "olijfolie"],
      ask_user: [],
      ask_menu: [],
      suitability: "suitable",
      confidence: "high",
    },
    {
      name: "Quinoasalade",
      desc_nl: "Voedzaam en licht, geeft langdurige energie.",
      ingredients: ["quinoa", "komkommer", "olijfolie"],
      ask_user: [],
      ask_menu: [],
      suitability: "suitable",
      confidence: "high",
    },
    {
      name: "Risotto van de chef",
      desc_nl: "Warm en hartig, makkelijk verteerbaar.",
      ingredients: ["rijst", "bouillon", "ui", "Parmezaan", "boter"],
      ask_user: ["Kan de risotto zonder ui en zonder kaas?"],
      ask_menu: ["È possibile il risotto senza cipolla e senza formaggio?"],
      suitability: "possibly_suitable",
      confidence: "medium",
    },
    {
      name: "Pasta pomodoro",
      desc_nl: "Eenvoudig en licht op tomatenbasis.",
      ingredients: ["pasta", "tomaat", "basilicum"],
      ask_user: ["Is er een glutenvrije pasta mogelijk?"],
      ask_menu: ["È disponibile una pasta senza glutine?"],
      suitability: "possibly_suitable",
      confidence: "medium",
    },
  ],
};

export const mockAnalysisEmpty: MenuAnalysis = {
  menu_lang: "it",
  items: [],
  message: {
    title: "Geen menukaart",
    body_nl: content.texts.errors.notAMenu,
    reason: "not_a_menu",
  },
};
