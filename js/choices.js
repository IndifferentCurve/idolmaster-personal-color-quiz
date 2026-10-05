"use strict";

/*
  js/choices.js
  Builds the color choices for a question. Distractors are kept a perceptual (CIELAB)
  distance away from the answer and from each other, tightening with difficulty;
  harder levels add a hair-color trap and, at the top level, real colors of other idols.
*/

// Remembers each question's last order so a replay never shows the identical layout.
const lastChoiceSignatures = new Map();

function shuffleChoices(question, difficulty, choices) {
  const key = `${difficulty}-${question.no}`;
  const lastSignature = lastChoiceSignatures.get(key);
  let shuffled = shuffle(choices);
  let signature = getChoiceSignature(shuffled);
  let attempts = 0;

  while (signature === lastSignature && attempts < 12) {
    shuffled = shuffle(choices);
    signature = getChoiceSignature(shuffled);
    attempts += 1;
  }

  lastChoiceSignatures.set(key, signature);
  return shuffled;
}

function getChoiceSignature(choices) {
  return choices.map((choice) => `${choice.hex.toLowerCase()}${choice.isAnswer ? "!" : ""}`).join("|");
}

// realPool supplies the real image colors that very hard mode borrows as traps.
function generateDistractors(question, difficulty, realPool) {
  const settings = getDifficultyChoiceSettings(difficulty);
  const targetDistractorCount = settings.distractorCount;
  const correctHex = question.hex.toLowerCase();
  const base = question.hsl;
  const distanceRules = getVisualDistanceRules(difficulty, base);
  const colors = new Set();

  const addColor = (hex, relaxation = 0, rulesOverride = distanceRules) => {
    const normalized = hex.toLowerCase();
    if (
      normalized !== correctHex
      && !colors.has(normalized)
      && isVisuallyDistinctChoice(normalized, correctHex, [...colors], rulesOverride, relaxation)
    ) {
      colors.add(normalized);
      return true;
    }
    return false;
  };

  if (settings.useHairTrap) {
    addHairTrapColor(question, addColor, difficulty);
  }

  if (difficulty === "easy") {
    fillGenerated(colors, targetDistractorCount, () => {
      const hue = base.h + randomBetween(70, 290);
      const saturation = randomBetween(52, 88);
      const lightness = randomBetween(34, 76);
      return hslToHex(hue, saturation, lightness);
    }, addColor);
  } else if (difficulty === "normal") {
    fillGenerated(colors, targetDistractorCount, () => {
      const hueShift = randomBetween(30, 44) * randomSign();
      const saturationShift = randomBetween(12, 22) * randomSign();
      const lightnessShift = randomBetween(12, 22) * randomSign();
      return hslToHex(
        base.h + hueShift,
        clamp(base.s + saturationShift, 18, 94),
        clamp(base.l + lightnessShift, 18, 88)
      );
    }, addColor);
  } else if (difficulty === "hard") {
    fillGenerated(colors, targetDistractorCount, () => {
      const mode = ["hue", "tone", "mixed"][Math.floor(Math.random() * 3)];
      const hueShift = randomBetween(14, 24) * randomSign();
      const saturationShift = randomBetween(8, 18) * randomSign();
      const lightnessShift = randomBetween(8, 16) * randomSign();

      if (mode === "hue") {
        return hslToHex(base.h + hueShift, base.s, base.l);
      }

      if (mode === "tone") {
        return hslToHex(
          base.h,
          clamp(base.s + saturationShift, 10, 96),
          clamp(base.l + lightnessShift, 14, 92)
        );
      }

      return hslToHex(
        base.h + hueShift,
        clamp(base.s + saturationShift, 10, 96),
        clamp(base.l + lightnessShift, 14, 92)
      );
    }, addColor);
  } else {
    let realTrapCount = 0;
    const realTrapTarget = 2;
    closestRealColors(question, 8, realPool).forEach((hex) => {
      if (realTrapCount < realTrapTarget && addColor(hex)) {
        realTrapCount += 1;
      }
    });

    fillGenerated(colors, targetDistractorCount, () => {
      const mode = ["hue", "tone", "mixed"][Math.floor(Math.random() * 3)];
      const hueShift = randomBetween(5, 10) * randomSign();
      const saturationShift = randomBetween(5, 10) * randomSign();
      const lightnessShift = randomBetween(5, 10) * randomSign();

      if (mode === "hue") {
        return hslToHex(base.h + hueShift, base.s, base.l);
      }

      if (mode === "tone") {
        return hslToHex(
          base.h,
          clamp(base.s + saturationShift, 8, 96),
          clamp(base.l + lightnessShift, 12, 92)
        );
      }

      return hslToHex(
        base.h + hueShift,
        clamp(base.s + saturationShift, 8, 96),
        clamp(base.l + lightnessShift, 12, 92)
      );
    }, addColor);
  }

  return [...colors].slice(0, targetDistractorCount);
}

function getDifficultyChoiceSettings(difficulty) {
  if (difficulty === "easy") {
    return { distractorCount: 4, useHairTrap: false };
  }

  return { distractorCount: 5, useHairTrap: true };
}

function addHairTrapColor(question, addColor, difficulty) {
  const hairTrapRules = getHairTrapDistanceRules(difficulty, question.hsl);

  for (let attempt = 0; attempt < 96; attempt += 1) {
    if (addColor(makeHairTrapColor(question, attempt), 0, hairTrapRules)) return true;
  }

  const hair = question.hairHsl || {
    h: question.hsl.h + 34,
    s: clamp(question.hsl.s - 18, 12, 76),
    l: clamp(question.hsl.l - 16, 14, 72)
  };

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const hueShift = randomBetween(16, 34) * randomSign();
    const saturationShift = randomBetween(10, 24) * randomSign();
    const lightnessShift = randomBetween(10, 24) * randomSign();
    const candidate = hslToHex(
      hair.h + hueShift,
      clamp(hair.s + saturationShift, 10, 92),
      clamp(hair.l + lightnessShift, 10, 88)
    );

    if (addColor(candidate, 0, hairTrapRules)) return true;
  }

  return false;
}

function makeHairTrapColor(question, attempt = 0) {
  const hair = question.hairHsl || {
    h: question.hsl.h + 34,
    s: clamp(question.hsl.s - 18, 12, 76),
    l: clamp(question.hsl.l - 16, 14, 72)
  };
  const hueRange = attempt < 16 ? 4 : attempt < 48 ? 12 : 22;
  const toneRange = attempt < 16 ? 6 : attempt < 48 ? 14 : 22;
  let candidate = hslToHex(
    hair.h + randomBetween(-hueRange, hueRange),
    clamp(hair.s + randomBetween(-toneRange, toneRange), 10, 92),
    clamp(hair.l + randomBetween(-toneRange, toneRange), 10, 88)
  );

  if (candidate.toLowerCase() === question.hex.toLowerCase()) {
    candidate = hslToHex(hair.h + 12, clamp(hair.s + 4, 10, 92), clamp(hair.l - 6, 10, 88));
  }

  return candidate;
}

function getHairTrapDistanceRules(difficulty, answerHsl) {
  const rules = getVisualDistanceRules(difficulty, answerHsl);
  if (difficulty === "very-hard") return rules;

  const { minFromAnswer, minBetweenChoices } = rules;
  return { minFromAnswer, minBetweenChoices };
}

function fillGenerated(colors, targetCount, factory, addColor) {
  let guard = 0;
  while (colors.size < targetCount && guard < 120) {
    addColor(factory());
    guard += 1;
  }

  let fallbackGuard = 0;
  while (colors.size < targetCount && fallbackGuard < 220) {
    addColor(hslToHex(Math.random() * 360, randomBetween(36, 86), randomBetween(28, 80)));
    fallbackGuard += 1;
  }

  let relaxedGuard = 0;
  while (colors.size < targetCount && relaxedGuard < 220) {
    addColor(hslToHex(Math.random() * 360, randomBetween(36, 86), randomBetween(28, 80)), 4);
    relaxedGuard += 1;
  }
}

function closestRealColors(question, count, realPool) {
  const correctHex = question.hex.toLowerCase();
  const ranked = realPool
    .filter((idol) => idol.no !== question.no && idol.hex.toLowerCase() !== correctHex)
    .map((idol) => ({
      idol,
      hueGap: hueDistance(question.hsl.h, idol.hsl.h),
      toneGap: Math.abs(question.hsl.s - idol.hsl.s) + Math.abs(question.hsl.l - idol.hsl.l)
    }))
    .sort((a, b) => a.hueGap - b.hueGap || a.toneGap - b.toneGap);
  const picked = ranked.slice(0, 1);

  if (count > 1) {
    picked.push(...shuffle(ranked.slice(1, 6)).slice(0, count - 1));
  }

  return picked.map(({ idol }) => idol.hex);
}

function getVisualDistanceRules(difficulty, answerHsl = null) {
  let rules;

  if (difficulty === "easy") {
    rules = { minFromAnswer: 30, minBetweenChoices: 16 };
  } else if (difficulty === "normal") {
    rules = { minFromAnswer: 22, minBetweenChoices: 13 };
  } else if (difficulty === "hard") {
    rules = { minFromAnswer: 18, minBetweenChoices: 11, maxFromAnswer: 66 };
  } else {
    rules = { minFromAnswer: 12, minBetweenChoices: 9, maxFromAnswer: 40 };
  }

  return applyPrimaryColorDifficultyRelief(rules, difficulty, answerHsl);
}

function applyPrimaryColorDifficultyRelief(rules, difficulty, answerHsl) {
  if (difficulty === "easy" || !isVividPrimaryColor(answerHsl)) return rules;

  const reliefByDifficulty = {
    normal: { minFromAnswer: 5, minBetweenChoices: 3 },
    hard: { minFromAnswer: 3, minBetweenChoices: 2, maxFromAnswer: 6 },
    "very-hard": { minFromAnswer: 2, minBetweenChoices: 1, maxFromAnswer: 4 }
  };
  const relief = reliefByDifficulty[difficulty] || reliefByDifficulty["very-hard"];
  const adjusted = {
    ...rules,
    minFromAnswer: rules.minFromAnswer + relief.minFromAnswer,
    minBetweenChoices: rules.minBetweenChoices + relief.minBetweenChoices
  };

  if (rules.maxFromAnswer) {
    adjusted.maxFromAnswer = rules.maxFromAnswer + (relief.maxFromAnswer || 0);
  }

  return adjusted;
}

function isVividPrimaryColor(hsl) {
  if (!hsl || hsl.s < 62 || hsl.l < 24 || hsl.l > 82) return false;

  const primaryHues = [0, 60, 120, 180, 240, 300];
  return primaryHues.some((primaryHue) => hueDistance(hsl.h, primaryHue) <= 18);
}

function isVisuallyDistinctChoice(candidateHex, correctHex, selectedHexes, rules, relaxation = 0) {
  const minFromAnswer = Math.max(10, rules.minFromAnswer - relaxation);
  const minBetweenChoices = Math.max(7, rules.minBetweenChoices - relaxation);
  const distanceFromAnswer = perceptualColorDistance(candidateHex, correctHex);

  if (distanceFromAnswer < minFromAnswer) {
    return false;
  }

  if (rules.maxFromAnswer && distanceFromAnswer > rules.maxFromAnswer + relaxation * 2) {
    return false;
  }

  return selectedHexes.every((hex) => perceptualColorDistance(candidateHex, hex) >= minBetweenChoices);
}
