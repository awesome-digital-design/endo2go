// Gemini JSON schema describing the MenuAnalysis shape returned by the model.
// Mirrors src/types/domain.ts (MenuAnalysis). Uses Gemini's uppercase type names
// and `propertyOrdering` so the model emits fields in a stable order.

export const responseSchema = {
  type: "OBJECT",
  properties: {
    menu_lang: { type: "STRING" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          desc_nl: { type: "STRING" },
          ingredients: { type: "ARRAY", items: { type: "STRING" } },
          ask_user: { type: "ARRAY", items: { type: "STRING" } },
          ask_menu: { type: "ARRAY", items: { type: "STRING" } },
          suitability: {
            type: "STRING",
            enum: ["suitable", "possibly_suitable"],
          },
          confidence: {
            type: "STRING",
            enum: ["high", "medium", "low"],
          },
        },
        required: [
          "name",
          "desc_nl",
          "ingredients",
          "ask_user",
          "ask_menu",
          "suitability",
          "confidence",
        ],
        propertyOrdering: [
          "name",
          "desc_nl",
          "ingredients",
          "ask_user",
          "ask_menu",
          "suitability",
          "confidence",
        ],
      },
    },
    message: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        body_nl: { type: "STRING" },
        reason: {
          type: "STRING",
          enum: ["not_a_menu", "no_suitable_dishes"],
        },
      },
      required: ["title", "body_nl", "reason"],
      propertyOrdering: ["title", "body_nl", "reason"],
    },
  },
  // `message` is intentionally absent here: it is optional and only present
  // for the edge cases (not a menu / nothing suitable).
  required: ["menu_lang", "items"],
  propertyOrdering: ["menu_lang", "items", "message"],
} as const;
