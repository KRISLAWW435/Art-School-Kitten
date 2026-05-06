import { useGameStore } from "../store/gameStore";
import { DIALOGUE_DATA } from "../data/dialogues";

const PROFANITY_ROOTS = [
  "бля",
  "хуй",
  "пизд",
  "еба",
  "хер",
  "fuck",
  "shit",
  "bitch",
  "asshole",
];
const LEET_MAP: Record<string, string> = {
  "@": "a",
  "0": "o",
  "3": "e",
  "4": "a",
  "1": "i",
  "!": "i",
};

const INTENTS = {
  positive: /^(да|ага|конечно|хочу|давай|угу|ок|хорошо|дa|верно|согласен|давай|ок)/i,
  negative: /^(нет|не|неа|не хочу|ни за что|неа|ненавижу|не надо)/i,
  dont_know: /^(не знаю|хз|затрудняюсь|без понятия|не помню|не уверен)/i,
};

let safetyViolations = 0;

export function processUserMessage(text: string) {
  const store = useGameStore.getState();
  const rawText = text.trim();
  const normalizedText = normalizeText(rawText);
  const ageGroup = store.profile.ageGroup;

  // 1. CHECK ACTIVE CONTEXT FIRST
  if (store.activeContext) {
    const context = store.activeContext;
    const theme = (DIALOGUE_DATA.themes as any)[context.themeId];
    
    if (theme && theme.follow_up && theme.follow_up.context_expectation) {
      const expectation = theme.follow_up.context_expectation;
      const handlers = expectation.response_handlers;
      
      let handlerKey: string | null = null;
      let objectMatch: string | null = null;

      // Determine handler
      if (INTENTS.positive.test(normalizedText)) {
        handlerKey = "positive";
      } else if (INTENTS.negative.test(normalizedText)) {
        handlerKey = "negative";
      } else if (INTENTS.dont_know.test(normalizedText)) {
        handlerKey = "dont_know";
      } else if (expectation.type === "color_find" || expectation.type === "object_find") {
        // Simple noun detection: take the first word or the whole phrase if it's short
        const words = rawText.split(" ").filter(w => w.length > 2);
        if (words.length > 0) {
          handlerKey = "any_object";
          objectMatch = words[words.length - 1]; // Take last word as potential object (e.g. "нашел чашку")
        }
      }

      if (!handlerKey && expectation.type === "mood_reply") {
         // for mood we might want special logic, but let's stick to generic for now
      }

      if (handlerKey && handlers[handlerKey]) {
        const handler = handlers[handlerKey];
        const response = generateResponseFromSlots(handler, ageGroup, objectMatch);
        store.setActiveContext(null); // Clear context on successful match
        simulateTypingAndSend(response);
        store.addMood(3);
        return;
      } else {
        // Irrelevant or no match
        if (handlers.irrelevant) {
          const response = generateResponseFromSlots(handlers.irrelevant, ageGroup);
          // Don't clear context yet, maybe decrement duration
          const newDuration = context.duration - 1;
          if (newDuration <= 0) {
            store.setActiveContext(null);
          } else {
            store.setActiveContext({ ...context, duration: newDuration });
          }
          simulateTypingAndSend(response);
          return;
        }
      }
    }
    
    // If we're here, context didn't handle it. Decrement and continue to regular matching
    const newDuration = context.duration - 1;
    if (newDuration <= 0) {
      store.setActiveContext(null);
    } else {
      store.setActiveContext({ ...context, duration: newDuration });
    }
  }

  if (checkProfanity(normalizedText)) {
    safetyViolations++;
    const reactions = DIALOGUE_DATA.themes.safety.content.reaction as string[];
    let reaction = reactions[0];
    if (safetyViolations === 2) reaction = reactions[1 % reactions.length];
    if (safetyViolations >= 3) reaction = reactions[2 % reactions.length];

    simulateTypingAndSend(reaction);
    store.addMood(-5);
    return;
  }

  // Handle awaiting topic
  if (store.awaitingDialogueTopic) {
    if (
      normalizedText.includes("да") ||
      normalizedText.includes("хочу") ||
      normalizedText.includes("давай")
    ) {
      const topic = store.awaitingDialogueTopic;
      store.setAwaitingDialogueTopic(null); // clear
      triggerTopic(topic, store);
      return;
    } else if (
      normalizedText.includes("нет") ||
      normalizedText.includes("не хочу")
    ) {
      store.setAwaitingDialogueTopic(null); // clear
      simulateTypingAndSend("Хорошо, мяу! О чем тогда поговорим? 😺");
      return;
    }
    // If neither yes nor no, proceed to standard matching, maybe clear topic.
    store.setAwaitingDialogueTopic(null);
  }

  // Check for gibberish
  const isGibberish =
    rawText.length > 5 &&
    (rawText.replace(/[a-zA-Zа-яА-ЯёЁ]/g, "").length / rawText.length > 0.5 ||
      /([а-яА-Яa-zA-Z])\1{4,}/.test(rawText));

  if (isGibberish) {
    const responses = DIALOGUE_DATA.themes.fallback.content.unknown;
    const resp = getRandom(responses);
    checkAndSetAwaitingTopic(resp, store);
    simulateTypingAndSend(resp);
    return;
  }

  // Intent matching
  let matchedTheme = "unknown";
  for (const [theme, data] of Object.entries(DIALOGUE_DATA.themes)) {
    if (
      "keywords" in data &&
      data.keywords.some((kw) => {
        if (normalizedText.includes(kw)) return true;
        // Check if all words of the keyword are in the text
        const words = kw.split(" ");
        if (words.length > 1) {
          const regex = new RegExp(words.join(".*"), "i");
          if (regex.test(normalizedText)) return true;
        }
        return false;
      })
    ) {
      matchedTheme = theme;
      break;
    }
  }

  let response = "";

  if (
    matchedTheme !== "unknown" &&
    matchedTheme !== "fallback" &&
    matchedTheme !== "safety"
  ) {
    const themeObj = (DIALOGUE_DATA.themes as any)[matchedTheme];
    
    if (themeObj.slots) {
      response = generateResponseFromSlots(themeObj, ageGroup);
    } else {
      // LEGACY CONTENT STRUCTURE
      const themeData = themeObj.content;
      // Resolve age group or fallback to '*'
      let ageResponses = themeData["*"];
      if (!ageResponses) {
        if (ageGroup === "5-7" || ageGroup === "8-10" || ageGroup === "11-14") {
          ageResponses =
            themeData[ageGroup] || themeData["5-14"] || themeData["8-10"];
        } else {
          ageResponses =
            themeData[ageGroup] || themeData["15-18+"] || themeData["18+"];
        }
      }
      if (!ageResponses) ageResponses = Object.values(themeData)[0] as string[]; // Ultimate fallback

      response = getRandom(ageResponses as string[]);
    }
    
    // Set active context if theme expects it
    if (themeObj.follow_up && themeObj.follow_up.context_expectation) {
      store.setActiveContext({
        themeId: matchedTheme,
        type: themeObj.follow_up.context_expectation.type,
        duration: themeObj.follow_up.context_expectation.duration || 2
      });
    }

    store.addMood(2);
    store.addFriendship(1);
  } else {
    const fallbackResponses = DIALOGUE_DATA.themes.fallback.content.unknown;
    response = getRandom(fallbackResponses);
  }

  // Personalization
  response = response.replace(/{user_name}/g, store.profile.name || "Друг");

  // JOKE CHANCE (~15%)
  if (
    matchedTheme !== "joke" &&
    matchedTheme !== "safety" &&
    matchedTheme !== "goodbye"
  ) {
    if (Math.random() < 0.15) {
      const jokes = DIALOGUE_DATA.themes.joke.content["*"];
      const rJoke = getRandom(jokes);
      const jokePrefixes = [
        "Шутка-минутка:",
        "Лови шутку! 😸",
        "Кстати, вспомнил смешное! 🎉",
        "А вот и прикол для поднятия настроения: 🐾",
        "Срочные новости! Шутка дня! 😹",
        "Мур-мяу, смешная мысль вслух! ✨",
      ];
      const prefix = getRandom(jokePrefixes);
      response += `\n\n${prefix} ${rJoke}`;
    }
  }

  checkAndSetAwaitingTopic(response, store);
  simulateTypingAndSend(response);
}

function checkAndSetAwaitingTopic(
  response: string,
  store: ReturnType<typeof useGameStore.getState>,
) {
  if (response.includes("расскажу как работают аниматоры")) {
    store.setAwaitingDialogueTopic("animation_basics");
  } else if (response.includes("узнать про UI/UX")) {
    store.setAwaitingDialogueTopic("design_basics");
  } else if (response.includes("сыграем")) {
    store.setAwaitingDialogueTopic("game_ask"); // We don't have this implemented but just in case
  } else {
    store.setAwaitingDialogueTopic(null);
  }
}

function triggerTopic(
  topic: string,
  store: ReturnType<typeof useGameStore.getState>,
) {
  if (topic === "animation_basics") {
    const themeData = (DIALOGUE_DATA.themes as any)["animation_basics"]
      ?.content;
    if (themeData) {
      const resp = getRandom(themeData["*"] || []);
      simulateTypingAndSend(resp || "Анимация - это круто! 🎥");
      store.addMood(2);
    } else {
      simulateTypingAndSend("Ого, забыл что хотел сказать. Мяу! 😸");
    }
  } else if (topic === "design_basics") {
    const themeData = (DIALOGUE_DATA.themes as any)["design_basics"]?.content;
    if (themeData) {
      const resp = getRandom(themeData["*"] || []);
      simulateTypingAndSend(resp || "Дизайн - это решение проблем! 🎨");
      store.addMood(2);
    } else {
      simulateTypingAndSend("Ого, забыл что хотел сказать. Мяу! 😸");
    }
  } else {
    simulateTypingAndSend("Отлично! Мяу! 🐾");
  }
}

function normalizeText(text: string) {
  let t = text.toLowerCase();
  for (const [leet, normal] of Object.entries(LEET_MAP)) {
    t = t.replace(new RegExp(`\\${leet}`, "g"), normal);
  }
  return t;
}

function checkProfanity(text: string) {
  return PROFANITY_ROOTS.some((root) => text.includes(root));
}

function getRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateResponseFromSlots(themeObj: any, ageGroup: string, object?: string | null): string {
  const slots = themeObj.slots;
  if (!slots) return "";
  
  const parts: string[] = [];
  const slotOrder = ["interjection", "feeling", "content", "follow_up"];

  for (const slotName of slotOrder) {
    const slotData = slots[slotName];
    if (!slotData || !slotData.variants) continue;

    let variants = slotData.variants[ageGroup];
    
    // Fallback for age groups
    if (!variants || variants.length === 0) {
      if (ageGroup === "5-7" || ageGroup === "8-10" || ageGroup === "11-14") {
        variants = slotData.variants["8-10"] || slotData.variants["5-7"] || slotData.variants["11-14"] || slotData.variants["*"];
      } else {
        variants = slotData.variants["18+"] || slotData.variants["15-17"] || slotData.variants["15-18+"] || slotData.variants["*"];
      }
    }

    // Ultimate fallback
    if (!variants || variants.length === 0) {
      const allGroups = Object.values(slotData.variants) as string[][];
      if (allGroups.length > 0) variants = allGroups[0];
    }

    if (variants && variants.length > 0) {
      let variant = getRandom(variants);
      if (object) {
        variant = variant.replace(/{object}/g, object);
      }
      parts.push(variant);
    }
  }
  return parts.join(" ");
}

function simulateTypingAndSend(text: string) {
  const store = useGameStore.getState();
  const chars = text.split("");
  let currentText = "";
  let i = 0;

  store.updateTypingMessage(""); // Start typing indicator

  const interval = setInterval(() => {
    currentText += chars[i];
    store.updateTypingMessage(currentText);
    i++;

    if (i >= chars.length) {
      clearInterval(interval);
      store.removeTypingMessage();
      store.addMessage({ sender: "randy", text: currentText });
    }
  }, 40); // 40ms per character
}
