export const content = {
  appName: "Endo2Go",

  dietaryOptions: [
    { value: "omnivore", label: "Alleseter" },
    { value: "vegetarian", label: "Vegetarisch" },
    { value: "vegan", label: "Veganistisch" },
  ],

  languageOptions: [
    { value: "nl", label: "Nederlands" },
    { value: "en", label: "English" },
    { value: "de", label: "Deutsch" },
    { value: "fr", label: "Français" },
    { value: "es", label: "Español" },
    { value: "it", label: "Italiano" },
  ],

  universalExclusions: ["Varkensvlees", "MSG (E-621)", "Kant-en-klaar maaltijden"],

  statusLabels: {
    suitable: { label: "Geschikt", tone: "success" },
    possibly_suitable: { label: "Mogelijk geschikt", tone: "warning" },
  },

  confidenceLabels: {
    high: "hoog",
    medium: "midden",
    low: "laag",
  },

  texts: {
    welcome: {
      title: "Zie in één foto wat je kunt eten",
      subtitle:
        "Fotografeer de menukaart en zie welke gerechten bij jouw endometriose-dieet passen — plus vragen voor de kok.",
      scope:
        "We checken ingrediënten, niet porties of bereiding — bespreek het altijd met de kok.",
    },
    disclaimer:
      "Endo2Go geeft advies, geen medische garantie. Bespreek je keuze met de kok.",
    errors: {
      notAMenu:
        "We herkennen geen menukaart. Maak een wat duidelijkere foto, recht van boven en met genoeg licht.",
      noSuitable:
        "Niets gevonden dat helemaal past. Toch een paar vragen die je aan de kok kunt stellen:",
    },
    waiter: {
      cantEat: "Ik kan niet eten:",
      askPrefix: "Kunt u dit gerecht aanpassen?",
    },
    onboarding: {
      extraNotePrompt: "Nog iets persoonlijks dat we moeten weten?",
    },
  },
} as const;

export const defaultLanguage = "nl";

export interface OnboardingOption {
  id: string;
  label: string;
}
export interface OnboardingStep {
  id: string;
  title: string;
  why: string;
  options: OnboardingOption[];
}

// Guided onboarding steps. Each option id is stored in the profile's
// `selections`; compileSensitivities maps them back to these labels.
export const onboardingSteps: OnboardingStep[] = [
  {
    id: "sugar",
    title: "Suiker & zoetstoffen",
    why: "Suiker werkt ontstekingsbevorderend.",
    options: [
      { id: "sugar_none", label: "Geen toegevoegde suiker" },
      { id: "sugar_hidden", label: "Let op verborgen suiker in sauzen/dressings" },
      {
        id: "sugar_no_artificial",
        label: "Geen kunstmatige zoetstoffen of siropen (agave, ahorn)",
      },
      {
        id: "sugar_natural_sometimes",
        label: "Soms natuurlijk (honing, biologische appel-/perenstroop)",
      },
    ],
  },
  {
    id: "drinks",
    title: "Dranken",
    why: "Cafeïne en alcohol prikkelen de darmen.",
    options: [
      { id: "drinks_no_coffee", label: "Geen koffie / cafeïne" },
      { id: "drinks_no_tea_cola", label: "Geen zwarte/groene/witte thee of cola" },
      { id: "drinks_no_alcohol", label: "Geen alcohol" },
      {
        id: "drinks_plantmilk",
        label: "Plantaardige melk zonder soja (haver, amandel, kokos)",
      },
    ],
  },
  {
    id: "grains",
    title: "Brood, granen & aardappelen",
    why: "Tarwe wordt vermeden; andere granen mogen wel.",
    options: [
      { id: "grain_sourdough_gf", label: "Alleen zuurdesem- of glutenvrij brood" },
      { id: "grain_no_pasta", label: "Geen tarwepasta" },
      { id: "grain_no_couscous", label: "Geen couscous / bulgur" },
      { id: "grain_no_white_rice", label: "Witte rijst vermijd ik" },
      { id: "grain_no_potato", label: "Aardappelen vermijd ik" },
      {
        id: "grain_other_ok",
        label: "Andere granen wél (spelt, boekweit, quinoa, havermout)",
      },
    ],
  },
  {
    id: "meat",
    title: "Vlees, vis & eieren",
    why: "Mager en met mate; vette vis is juist goed.",
    options: [
      { id: "meat_no_pork", label: "Geen varkensvlees" },
      { id: "meat_no_processed", label: "Geen bewerkt vlees" },
      { id: "meat_little", label: "Weinig vlees, geen gehakt" },
      { id: "fish_yes", label: "(Vette) vis eet ik juist" },
      { id: "eggs_max2", label: "Maximaal ~2 eieren per week" },
    ],
  },
  {
    id: "dairyfat",
    title: "Zuivel & vetten",
    why: "Zuivel is persoonsgebonden; transvetten eruit, goede vetten erin.",
    options: [
      { id: "dairy_none", label: "Geen zuivel (melk, kaas, kwark)" },
      { id: "dairy_lactosefree", label: "Alleen lactosevrij / kleine hoeveelheden" },
      { id: "dairy_butter_ok", label: "Roomboter gebruik ik wel" },
      {
        id: "fat_no_fried_margarine",
        label: "Niets gefrituurd, geen margarine/transvetten",
      },
      { id: "fat_good_yes", label: "Goede vetten (avocado, olijfolie) wél" },
    ],
  },
  {
    id: "nuts",
    title: "Noten",
    why: "Pinda's en cashews eruit; andere noten zijn juist goed.",
    options: [
      { id: "nuts_no_peanuts", label: "Geen pinda's" },
      { id: "nuts_min_cashews", label: "Zo min mogelijk cashewnoten" },
      {
        id: "nuts_others_ok",
        label: "Andere noten wél (amandel, walnoot, hazelnoot, pecan)",
      },
    ],
  },
  {
    id: "more",
    title: "Wat eet je juist méér?",
    why: "Versterk je lichaam.",
    options: [
      { id: "more_veg", label: "Veel groente" },
      { id: "more_legumes", label: "Peulvruchten (bonen, linzen, kikkererwten)" },
      { id: "more_fruit", label: "Fruit" },
      { id: "more_seaweed", label: "Zeewier / algen" },
    ],
  },
];
