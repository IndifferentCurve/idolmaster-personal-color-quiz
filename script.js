"use strict";

/*
  script.js
  ?? ?? ??? ??? ??? ?????.
  data.js? ?? ???? window.IdolmasterQuizData? ???? ??? ???.
*/
const {
  IDOLS,
  ADDITIONAL_IDOLS,
  ALL_IDOLS,
  IDOL_IMAGE_FILES,
  HAIR_COLORS,
  ADDITIONAL_HAIR_COLORS,
  seriesOrder,
  seriesLabels,
  seriesIcons,
  attributeLabels,
  difficultyLabels
} = window.IdolmasterQuizData;

const state = {
  questions: [],
  index: 0,
  correct: 0,
  difficulty: "normal",
  series: ["all"],
  countMode: "preset",
  requestedQuestionCount: 5,
  language: "ko",
  currentAnswerFeedback: null,
  currentCombo: 0,
  wrongAnswers: [],
  locked: false
};
const lastChoiceSignatures = new Map();

const screens = {
  start: document.getElementById("startScreen"),
  quiz: document.getElementById("quizScreen"),
  result: document.getElementById("resultScreen")
};

const questionCountInput = document.getElementById("questionCount");
const questionCountField = questionCountInput.closest(".number-field");
const poolTitle = document.getElementById("poolTitle");
const poolMeta = document.getElementById("poolMeta");
const poolSeriesList = document.getElementById("poolSeriesList");
const startButton = document.getElementById("startButton");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const comboBadge = document.getElementById("comboBadge");
const scoreText = document.getElementById("scoreText");
const imageFrame = document.getElementById("imageFrame");
const quizStage = document.querySelector(".stage");
const characterImage = document.getElementById("characterImage");
const imageFallback = document.getElementById("imageFallback");
const fallbackName = document.getElementById("fallbackName");
const characterName = document.getElementById("characterName");
const characterMeta = document.getElementById("characterMeta");
const swatches = document.getElementById("swatches");
const feedback = document.getElementById("feedback");
const feedbackMark = document.getElementById("feedbackMark");
const answerNote = document.getElementById("answerNote");
const resetButton = document.getElementById("resetButton");
const saveResultButton = document.getElementById("saveResultButton");
const resultPreview = document.getElementById("resultPreview");
const resultPreviewImage = document.getElementById("resultPreviewImage");
const wrongNoteSection = document.getElementById("wrongNoteSection");
const wrongNoteTitle = document.getElementById("wrongNoteTitle");
const wrongNoteList = document.getElementById("wrongNoteList");
const wrongNoteExpandButton = document.getElementById("wrongNoteExpandButton");
const wrongNoteModal = document.getElementById("wrongNoteModal");
const wrongNoteBackdrop = document.getElementById("wrongNoteBackdrop");
const wrongNoteCloseButton = document.getElementById("wrongNoteCloseButton");
const wrongNoteModalTitle = document.getElementById("wrongNoteModalTitle");
const wrongNoteModalList = document.getElementById("wrongNoteModalList");
const scoreUnit = document.getElementById("scoreUnit");
const homeButton = document.getElementById("homeButton");
const nextButton = document.getElementById("nextButton");
const themeToggle = document.getElementById("themeToggle");
const languageButtons = [...document.querySelectorAll(".language-button")];
const themeStorageKey = "idolmasterColorQuizTheme";
const languageStorageKey = "idolmasterColorQuizLanguage";
const appFontStack = "Pretendard, 'Noto Sans KR', Inter, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
let wrongNoteModalCloseTimer = 0;
let stageGlowTimer = 0;
const sidemJapaneseUnitLabels = Object.freeze({
  Jupiter: "Jupiter",
  "DRAMATIC STARS": "DRAMATIC STARS",
  Altessimo: "Altessimo",
  Beit: "Beit",
  W: "W",
  FRAME: "FRAME",
  Sai: "彩",
  "High×Joker": "High×Joker",
  "Shinsoku Ikkon": "神速一魂",
  "Café Parade": "Café Parade",
  Mofumofuen: "もふもふえん",
  "S.E.M": "S.E.M",
  "THE Kogado": "THE 虎牙道",
  "F-LAGS": "F-LAGS",
  Legenders: "Legenders",
  "C.FIRST": "C.FIRST"
});
const languageMeta = {
  ko: { htmlLang: "ko" },
  jp: { htmlLang: "ja" },
  en: { htmlLang: "en" }
};
const translations = window.translations;
if (!translations) {
  throw new Error("lang.js must be loaded before script.js");
}

const enrichedIdols = ALL_IDOLS.map((idol) => {
  const series = idol.series || inferMillionSeries(idol);
  const hsl = hexToHsl(idol.hex);
  const hairHex = HAIR_COLORS[idol.no] || ADDITIONAL_HAIR_COLORS[idol.no] || createFallbackHairColor(hsl);
  return {
    ...idol,
    series,
    image: resolveImagePath(idol),
    hsl,
    hairHex,
    hairHsl: hexToHsl(hairHex)
  };
});

applyTheme(getInitialTheme());
applyLanguage(getInitialLanguage());

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.language, true);
  });
});

document.querySelectorAll("input[name='series']").forEach((input) => {
  input.addEventListener("change", () => {
    syncSeriesSelection(input);
    syncQuestionCountWithPool();
    updatePresetSelection();
    updateStartSummary();
  });
});

document.querySelectorAll("input[name='difficulty']").forEach((input) => {
  input.addEventListener("change", () => {
    state.difficulty = input.value;
    updateStartSummary();
  });
});

document.querySelectorAll(".count-preset").forEach((button) => {
  button.addEventListener("click", () => {
    const poolSize = getPool().length;
    const wasSelected = button.classList.contains("is-selected");

    if (wasSelected) {
      const currentValue = getQuestionCountValue(poolSize);
      state.countMode = "manual";
      state.requestedQuestionCount = currentValue;
      questionCountInput.value = String(currentValue);
      updatePresetSelection();
      updateStartSummary();
      return;
    }

    const nextValue = button.dataset.count === "all" ? poolSize : Number(button.dataset.count);
    state.countMode = button.dataset.count === "all" ? "all" : "preset";
    state.requestedQuestionCount = button.dataset.count === "all" ? null : nextValue;
    questionCountInput.value = String(Math.min(nextValue, poolSize));
    updatePresetSelection(button);
    updateStartSummary();
  });
});

questionCountInput.addEventListener("input", () => {
  const poolSize = getPool().length;
  const numericValue = questionCountInput.value.replace(/\D/g, "");
  if (questionCountInput.value !== numericValue) {
    questionCountInput.value = numericValue;
  }
  state.countMode = "manual";
  state.requestedQuestionCount = numericValue === "" ? null : Math.trunc(Number(numericValue));
  questionCountInput.max = String(poolSize);
  updatePresetSelection();
  updateStartSummary();
});

questionCountInput.addEventListener("blur", () => {
  normalizeQuestionCount();
});

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);
saveResultButton.addEventListener("click", saveResultImage);
wrongNoteExpandButton?.addEventListener("click", openWrongNoteModal);
wrongNoteCloseButton?.addEventListener("click", closeWrongNoteModal);
wrongNoteBackdrop?.addEventListener("click", closeWrongNoteModal);
homeButton.addEventListener("click", resetGame);
nextButton.addEventListener("click", continueAfterFeedback);
themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme, true);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && wrongNoteModal && !wrongNoteModal.hidden) {
    closeWrongNoteModal();
  }
});

updateStartSummary();

function getInitialTheme() {
  try {
    const storedTheme = window.localStorage?.getItem(themeStorageKey);
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  } catch (error) {
    // Local storage can be unavailable in restricted browser contexts.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function getInitialLanguage() {
  try {
    const storedLanguage = window.localStorage?.getItem(languageStorageKey);
    if (storedLanguage === "kr") {
      window.localStorage?.setItem(languageStorageKey, "ko");
      return "ko";
    }
    if (storedLanguage === "ko" || storedLanguage === "jp" || storedLanguage === "en") return storedLanguage;
  } catch (error) {
    // Local storage can be unavailable in restricted browser contexts.
  }

  const browserLanguage = navigator.language?.toLowerCase() || "";
  if (browserLanguage.startsWith("ja")) return "jp";
  if (browserLanguage.startsWith("en")) return "en";
  return "ko";
}

function applyTheme(theme, shouldStore = false) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = normalizedTheme;
  themeToggle.setAttribute("aria-pressed", String(normalizedTheme === "dark"));
  themeToggle.setAttribute("aria-label", normalizedTheme === "dark" ? t("themeToLight") : t("themeToDark"));

  if (shouldStore) {
    try {
      window.localStorage?.setItem(themeStorageKey, normalizedTheme);
    } catch (error) {
      // The selected theme still applies for the current page.
    }
  }
}

function applyLanguage(language, shouldStore = false) {
  const normalizedLanguage = normalizeLanguage(language);
  state.language = normalizedLanguage;
  document.documentElement.lang = languageMeta[normalizedLanguage].htmlLang;
  document.title = t("documentTitle");
  const languageLabels = getDictionary(normalizedLanguage).languageNames || {};

  languageButtons.forEach((button) => {
    const isSelected = button.dataset.language === normalizedLanguage;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
    button.setAttribute("aria-label", languageLabels[normalizeLanguage(button.dataset.language)] || button.dataset.language);
  });

  setText("#brandTitle", t("brandTitle"));
  setText("#mainTitle", t("heading"));
  document.querySelector(".language-toggle")?.setAttribute("aria-label", t("languageSelect"));
  setText(".series-panel legend", t("seriesSelect"));
  setText("#countTitle", t("questionCount"));
  setText(".number-field label", t("manualInput"));
  setText("fieldset.panel:not(.series-panel) legend", t("difficulty"));
  setText(".pool-kicker", t("selectedSeries"));
  poolSeriesList?.setAttribute("aria-label", t("selectedSeries"));
  setText("#startButton", t("start"));
  setText("#sourceNoteTitle", t("sourceTitle"));
  setText("#hexSourceLabel", t("hexSource"));
  setText("#imageSourceLabel", t("imageSource"));
  document.querySelector(".source-note")?.setAttribute("aria-label", t("sourceNote"));
  setText("#homeButton", t("previous"));
  homeButton.setAttribute("aria-label", t("backHomeLabel"));
  setText("#quizScreen .stat:first-child span", t("question"));
  setText("#quizScreen .stat:nth-child(2) span", t("correct"));
  setText(".result-main .eyebrow", t("resultEyebrow"));
  setText("#resultMessage", t("result"));
  setText(".result-side .panel-title", t("record"));
  setText(".result-stat:nth-child(1) > span", t("correctCount"));
  setText(".result-stat:nth-child(2) > span", t("totalQuestions"));
  setText(".result-stat:nth-child(3) > span", t("resultDifficulty"));
  setText(".result-stat-series > span", t("series"));
  document.getElementById("resultGroup")?.setAttribute("aria-label", t("series"));
  setText(wrongNoteTitle, t("wrongNoteTitle"));
  setText(wrongNoteModalTitle, t("wrongNoteTitle"));
  setText(wrongNoteExpandButton, t("wrongNoteExpand"));
  wrongNoteCloseButton?.setAttribute("aria-label", t("wrongNoteClose"));
  setText("#saveResultButton", t("saveResult"));
  setText("#resetButton", t("backToStart"));
  setText("#resultPreview span", t("resultImage"));
  setText(scoreUnit, t("scoreUnit"));
  resultPreviewImage.alt = t("resultImageAlt");
  questionCountField?.querySelector("label")?.setAttribute("data-active-label", t("manualActive"));
  syncCountPresetLabels();
  syncDifficultyLabels();
  syncSeriesOptionLabels();
  applyTheme(document.documentElement.dataset.theme || getInitialTheme());
  refreshLocalizedScreen();

  if (shouldStore) {
    try {
      window.localStorage?.setItem(languageStorageKey, normalizedLanguage);
    } catch (error) {
      // The selected language still applies for the current page.
    }
  }
}

function refreshLocalizedScreen() {
  updateStartSummary();

  if (screens.quiz.classList.contains("is-active") && state.questions.length) {
    const question = state.questions[state.index];
    renderQuestionText(question);
    updateQuestionImageText(question);
    updateSwatchAriaLabels();
    updateComboBadge(false);
    if (state.currentAnswerFeedback) {
      renderAnswerNote(
        state.currentAnswerFeedback.isCorrect,
        state.currentAnswerFeedback.answerHex,
        state.currentAnswerFeedback.selectedHex
      );
      nextButton.textContent = state.index + 1 >= state.questions.length ? t("viewResult") : t("confirm");
    } else {
      nextButton.textContent = t("confirm");
    }
  }

  if (screens.result.classList.contains("is-active") && state.questions.length) {
    renderResultDetails();
    if (wrongNoteModal && !wrongNoteModal.hidden) {
      renderWrongAnswerList(wrongNoteModalList, "modal");
    }
  }
}

function setText(selectorOrElement, text) {
  const element = typeof selectorOrElement === "string"
    ? document.querySelector(selectorOrElement)
    : selectorOrElement;
  if (element) element.textContent = text;
}

function normalizeLanguage(language) {
  const normalized = language === "kr" ? "ko" : language;
  return translations[normalized] ? normalized : "ko";
}

function getDictionary(language = state.language) {
  return translations[normalizeLanguage(language)] || translations.ko;
}

function t(key, ...args) {
  const dictionary = getDictionary();
  const value = dictionary[key] ?? translations.ko[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function syncCountPresetLabels() {
  document.querySelectorAll(".count-preset").forEach((button) => {
    if (button.dataset.count === "5") button.textContent = t("countPreset5");
    if (button.dataset.count === "10") button.textContent = t("countPreset10");
    if (button.dataset.count === "all") button.textContent = t("countPresetAll");
  });
}

function syncDifficultyLabels() {
  document.querySelectorAll("input[name='difficulty']").forEach((input) => {
    const strong = input.closest(".choice-label")?.querySelector("strong");
    if (strong) strong.textContent = getDifficultyLabel(input.value);
  });
}

function syncSeriesOptionLabels() {
  document.querySelectorAll("input[name='series']").forEach((input) => {
    const label = input.closest(".choice-label");
    if (!label) return;

    const name = label.querySelector(".group-choice-main strong");
    if (name) name.textContent = getSeriesLabel(input.value);

    const count = input.value === "all"
      ? enrichedIdols.length
      : enrichedIdols.filter((idol) => idol.series === input.value).length;
    const directChildren = [...label.children];
    const countElement = directChildren[directChildren.length - 1];
    if (countElement && countElement.tagName === "SPAN") {
      countElement.textContent = formatPeopleCount(count);
    }
  });
}

function formatPeopleCount(count) {
  if (state.language === "en") return String(count);
  return `${count}${t("peopleSuffix")}`;
}

function startGame() {
  const pool = shuffle(getPool());
  const total = normalizeQuestionCount(pool.length);
  state.questions = pool.slice(0, total);
  state.index = 0;
  state.correct = 0;
  state.currentCombo = 0;
  state.wrongAnswers = [];
  state.difficulty = document.querySelector("input[name='difficulty']:checked").value;
  state.series = getSelectedSeriesValues();
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  state.locked = false;
  const question = state.questions[state.index];
  const current = state.index + 1;
  const total = state.questions.length;

  progressText.textContent = `${current} / ${total}`;
  setProgress((current - 1) / total);
  scoreText.textContent = String(state.correct);
  renderQuestionText(question);
  answerNote.innerHTML = "";
  feedback.className = "feedback";
  state.currentAnswerFeedback = null;
  imageFrame.classList.remove("is-shaking");
  imageFrame.classList.remove("is-answer-glowing");
  quizStage?.classList.remove("is-answer-glowing");
  updateComboBadge(false);
  nextButton.hidden = true;
  nextButton.textContent = t("confirm");

  setQuestionImage(question);
  renderChoices(question);
  preloadUpcomingImages();
}

function renderQuestionText(question) {
  characterName.textContent = getIdolDisplayName(question);
  characterMeta.textContent = getQuestionMetaText(question);
}

function getQuestionMetaText(idol) {
  const parts = [getIdolMetaName(idol)];

  if (idol.series === "sidem") {
    parts.push(getIdolUnitName(idol));
  }

  parts.push(getAttributeLabel(idol.attribute));
  return parts.filter(Boolean).join(" · ");
}

function getIdolUnitName(idol) {
  if (state.language === "ko") return idol.unitKo || idol.unit;
  if (state.language === "jp") return sidemJapaneseUnitLabels[idol.unit] || idol.unit || idol.unitKo;
  return idol.unit || idol.unitKo;
}

function renderChoices(question) {
  const distractors = generateDistractors(question, state.difficulty);
  const choices = shuffleChoices(question, state.difficulty, [
    { hex: question.hex, isAnswer: true },
    ...distractors.map((hex) => ({ hex, isAnswer: false }))
  ]);

  swatches.innerHTML = "";
  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-choice";
    button.style.background = choice.hex;
    button.style.setProperty("--choice-hex", choice.hex);
    button.dataset.hex = choice.hex.toLowerCase();
    button.setAttribute("aria-label", t("swatchLabel", index + 1));
    button.addEventListener("click", () => judgeAnswer(button, choice, question));
    swatches.appendChild(button);
  });
}

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

function judgeAnswer(button, choice, question) {
  if (state.locked) return;
  state.locked = true;

  const isCorrect = choice.isAnswer;
  if (isCorrect) {
    state.correct += 1;
    state.currentCombo += 1;
    button.classList.add("is-answer");
    triggerCorrectFeedback(button, question.hex);
  } else {
    state.currentCombo = 0;
    button.classList.add("is-wrong");
    triggerWrongFeedback();
    recordWrongAnswer(question, choice.hex);
    const answerButton = [...swatches.children].find((item) => item.dataset.hex === question.hex.toLowerCase());
    if (answerButton) answerButton.classList.add("is-answer");
  }
  updateComboBadge(isCorrect);

  state.currentAnswerFeedback = {
    isCorrect,
    answerHex: question.hex,
    selectedHex: choice.hex
  };
  renderAnswerNote(isCorrect, question.hex, choice.hex);

  feedbackMark.textContent = isCorrect ? "O" : "X";
  feedback.className = `feedback is-visible ${isCorrect ? "is-correct" : "is-wrong"}`;
  scoreText.textContent = String(state.correct);
  setProgress((state.index + 1) / state.questions.length);
  [...swatches.children].forEach((item) => {
    item.disabled = true;
  });
  nextButton.textContent = state.index + 1 >= state.questions.length ? t("viewResult") : t("confirm");
  nextButton.hidden = false;
  nextButton.focus({ preventScroll: true });
}

function renderAnswerNote(isCorrect, answerHex, selectedHex) {
  const answer = formatHex(answerHex);
  const selected = formatHex(selectedHex);
  const statusClass = isCorrect ? "is-correct" : "is-wrong";
  const statusText = isCorrect ? t("answerCorrect") : t("answerWrong");
  const selectedLine = isCorrect ? "" : `
    <span class="answer-chip is-selected-color">
      <span class="mini-chip" style="background:${selected}"></span>
      ${t("answerSelected")} ${selected}
    </span>
  `;

  answerNote.innerHTML = `
    <div class="answer-result ${statusClass}">${statusText}</div>
    <div class="answer-note-lines">
      ${selectedLine}
      <span class="answer-chip is-answer-color">
        <span class="mini-chip" style="background:${answer}"></span>
        ${t("answerAnswer")} ${answer}
      </span>
    </div>
  `;
}

function updateComboBadge(animate = false) {
  if (!comboBadge) return;
  comboBadge.hidden = false;

  if (state.currentCombo < 2) {
    comboBadge.textContent = "";
    comboBadge.setAttribute("aria-hidden", "true");
    comboBadge.classList.remove("is-visible", "is-popping");
    return;
  }

  comboBadge.textContent = t("comboText", state.currentCombo);
  comboBadge.setAttribute("aria-hidden", "false");
  comboBadge.classList.add("is-visible");

  if (animate) {
    comboBadge.classList.remove("is-popping");
    void comboBadge.offsetWidth;
    comboBadge.classList.add("is-popping");
  }
}

function triggerCorrectFeedback(button, answerHex) {
  const stage = button.closest(".stage") || quizStage;
  if (!stage) return;

  window.clearTimeout(stageGlowTimer);
  stage.style.setProperty("--stage-answer-glow", answerHex);
  stage.classList.remove("is-answer-glowing");
  void stage.offsetWidth;
  stage.classList.add("is-answer-glowing");

  imageFrame.style.setProperty("--image-answer-glow", answerHex);
  imageFrame.classList.remove("is-answer-glowing");
  void imageFrame.offsetWidth;
  imageFrame.classList.add("is-answer-glowing");

  stageGlowTimer = window.setTimeout(() => {
    stage.classList.remove("is-answer-glowing");
    imageFrame.classList.remove("is-answer-glowing");
  }, 1180);
}

function triggerWrongFeedback() {
  imageFrame.classList.remove("is-shaking");
  void imageFrame.offsetWidth;
  imageFrame.classList.add("is-shaking");

  window.setTimeout(() => {
    imageFrame.classList.remove("is-shaking");
  }, 340);
}

function recordWrongAnswer(question, selectedHex) {
  state.wrongAnswers.push({
    idol: question,
    image: question.image,
    selectedHex,
    answerHex: question.hex
  });
}

function formatHex(hex) {
  return String(hex).trim().toUpperCase();
}

function setProgress(ratio) {
  progressBar.style.transform = `scaleX(${clamp(ratio, 0, 1)})`;
}

function continueAfterFeedback() {
  if (!state.locked) return;
  state.index += 1;
  if (state.index >= state.questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  renderResultDetails();
  showScreen("result");
}

function renderResultDetails() {
  const total = state.questions.length;
  const percent = total ? Math.round((state.correct / total) * 100) : 0;
  document.getElementById("scorePercent").textContent = String(percent);
  setText(scoreUnit, t("scoreUnit"));
  document.getElementById("scoreSummary").textContent = t("correctSummary", state.correct, total);
  document.getElementById("resultCorrect").textContent = t("countWithUnit", state.correct);
  document.getElementById("resultTotal").textContent = t("countWithUnit", total);
  document.getElementById("resultDifficulty").textContent = getDifficultyLabel(state.difficulty);
  renderResultSeries(state.series);
  renderWrongAnswers();
  const resultMessage = document.getElementById("resultMessage");
  resultMessage.textContent = getResultMessage(percent);
  resultMessage.classList.toggle("is-perfect", percent === 100);
}

function renderWrongAnswers() {
  if (!wrongNoteSection || !wrongNoteList) return;

  wrongNoteSection.hidden = state.wrongAnswers.length === 0;
  if (wrongNoteExpandButton) wrongNoteExpandButton.hidden = state.wrongAnswers.length === 0;
  renderWrongAnswerList(wrongNoteList, "compact");
  if (!state.wrongAnswers.length) {
    hideWrongNoteModalImmediately();
    return;
  }
}

function renderWrongAnswerList(target, variant = "compact") {
  if (!target) return;
  target.innerHTML = "";

  state.wrongAnswers.forEach((item) => {
    target.appendChild(createWrongAnswerCard(item, variant));
  });
}

function createWrongAnswerCard(item, variant = "compact") {
  const card = document.createElement("article");
  card.className = `wrong-note-card ${variant === "modal" ? "is-modal" : ""}`.trim();

  const thumbnail = document.createElement("img");
  thumbnail.className = "wrong-note-thumb";
  thumbnail.src = item.image;
  thumbnail.alt = t("illustrationAlt", getIdolDisplayName(item.idol));
  thumbnail.loading = "lazy";
  thumbnail.decoding = "async";

  const body = document.createElement("div");
  body.className = "wrong-note-body";

  const name = document.createElement("strong");
  name.className = "wrong-note-name";
  name.textContent = getIdolDisplayName(item.idol);

  const colors = document.createElement("div");
  colors.className = "wrong-note-colors";
  colors.appendChild(createWrongColorBadge(t("wrongSelected"), item.selectedHex, "is-picked"));
  colors.appendChild(createWrongColorBadge(t("wrongAnswer"), item.answerHex, "is-correct"));

  body.append(name, colors);
  card.append(thumbnail, body);
  return card;
}

function createWrongColorBadge(label, hex, className) {
  const formattedHex = formatHex(hex);
  const badge = document.createElement("span");
  badge.className = `wrong-color-badge ${className}`;

  const chip = document.createElement("span");
  chip.className = "mini-chip";
  chip.style.background = formattedHex;

  const text = document.createElement("span");
  text.textContent = `${label} ${formattedHex}`;

  badge.append(chip, text);
  return badge;
}

function openWrongNoteModal() {
  if (!wrongNoteModal || !wrongNoteModalList || !state.wrongAnswers.length) return;

  window.clearTimeout(wrongNoteModalCloseTimer);
  renderWrongAnswerList(wrongNoteModalList, "modal");
  wrongNoteModal.hidden = false;
  document.body.classList.add("is-modal-open");
  requestAnimationFrame(() => {
    wrongNoteModal.classList.add("is-open");
    wrongNoteCloseButton?.focus({ preventScroll: true });
  });
}

function closeWrongNoteModal() {
  if (!wrongNoteModal || wrongNoteModal.hidden) return;

  wrongNoteModal.classList.remove("is-open");
  document.body.classList.remove("is-modal-open");
  wrongNoteModalCloseTimer = window.setTimeout(() => {
    wrongNoteModal.hidden = true;
    wrongNoteModalList.innerHTML = "";
    wrongNoteExpandButton?.focus({ preventScroll: true });
  }, 180);
}

function hideWrongNoteModalImmediately() {
  window.clearTimeout(wrongNoteModalCloseTimer);
  document.body.classList.remove("is-modal-open");
  if (wrongNoteModal) {
    wrongNoteModal.classList.remove("is-open");
    wrongNoteModal.hidden = true;
  }
  if (wrongNoteModalList) wrongNoteModalList.innerHTML = "";
}

async function saveResultImage() {
  const originalText = saveResultButton.textContent;
  saveResultButton.disabled = true;
  saveResultButton.textContent = t("saving");

  try {
    const canvas = await createResultCanvas();
    const dataUrl = canvas.toDataURL("image/png");
    resultPreviewImage.src = dataUrl;
    resultPreview.hidden = false;

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
    if (!blob) throw new Error(t("resultImageError"));

    const fileName = `idolmaster-color-result-${new Date().toISOString().slice(0, 10)}.png`;
    let shared = false;

    if (navigator.canShare && window.File) {
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: t("shareTitle"),
            text: document.getElementById("scoreSummary").textContent
          });
          shared = true;
        } catch (error) {
          shared = false;
        }
      }
    }

    if (!shared) {
      downloadBlob(blob, fileName);
    }
  } catch (error) {
    window.alert(t("resultSaveError"));
  } finally {
    saveResultButton.disabled = false;
    saveResultButton.textContent = originalText;
  }
}

async function createResultCanvas() {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement("canvas");
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const isDark = document.documentElement.dataset.theme === "dark";
  const colors = {
    bg: isDark ? "#111118" : "#f4f5f7",
    card: isDark ? "#1a1a24" : "#ffffff",
    chip: isDark ? "#232330" : "#eceef3",
    chipSoft: isDark ? "#20202b" : "#f0f2f6",
    pill: isDark ? "#2a2a36" : "#ffffff",
    text: isDark ? "#f4f6fb" : "#171821",
    muted: isDark ? "#a4a8b6" : "#6d7180",
    accent: "#8db7ff",
    accentStrong: "#6f9ff2",
    perfect: "#b00020",
    shadow: isDark ? "rgba(0, 0, 0, 0.28)" : "rgba(25, 26, 35, 0.1)"
  };

  const percent = document.getElementById("scorePercent").textContent;
  const message = document.getElementById("resultMessage").textContent;
  const isPerfect = document.getElementById("resultMessage").classList.contains("is-perfect");
  const activeSeries = getActiveSeriesValues(state.series);
  const seriesIconImages = await loadSeriesIconImages(activeSeries);
  const stats = [
    [t("correctCount"), document.getElementById("resultCorrect").textContent],
    [t("totalQuestions"), document.getElementById("resultTotal").textContent],
    [t("resultDifficulty"), document.getElementById("resultDifficulty").textContent]
  ];

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  ctx.shadowColor = colors.shadow;
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 20;
  drawRoundRect(ctx, 96, 96, 888, 888, 48, colors.card);
  ctx.restore();

  ctx.fillStyle = colors.muted;
  ctx.font = `800 30px ${appFontStack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("THE IDOLM@STER", size / 2, 158);

  ctx.fillStyle = isPerfect ? colors.perfect : colors.text;
  setFittedCanvasFont(ctx, message, 760, isPerfect ? 900 : 850, 74, 50);
  drawTrackedCenteredText(ctx, message, size / 2, 270, message.length <= 4 ? -4 : -1.5);

  drawScoreLine(ctx, percent, t("scoreUnit"), size / 2, 468, colors);

  ctx.fillStyle = colors.muted;
  ctx.font = `800 34px ${appFontStack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(document.getElementById("scoreSummary").textContent, size / 2, 548);

  const statsX = 140;
  const statsY = 594;
  const statsWidth = 800;
  const statsGap = 20;
  const statCardWidth = (statsWidth - statsGap * 2) / 3;
  stats.forEach(([label, value], index) => {
    const x = statsX + index * (statCardWidth + statsGap);
    drawCanvasStatCard(ctx, x, statsY, statCardWidth, 112, label, value, colors);
  });

  drawResultSeriesCanvas(ctx, {
    x: 140,
    y: 724,
    width: 800,
    height: 204,
    activeSeries,
    seriesIconImages,
    colors
  });

  ctx.textAlign = "center";
  ctx.fillStyle = colors.muted;
  ctx.font = `700 24px ${appFontStack}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(t("canvasFooter"), size / 2, 958);
  return canvas;
}

function drawScoreLine(ctx, score, suffix, centerX, baselineY, colors) {
  const numberFont = `900 188px ${appFontStack}`;
  const suffixFont = `900 58px ${appFontStack}`;
  const gap = 18;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = numberFont;
  const scoreWidth = ctx.measureText(score).width;
  ctx.font = suffixFont;
  const suffixWidth = ctx.measureText(suffix).width;
  const startX = centerX - (scoreWidth + gap + suffixWidth) / 2;

  ctx.font = numberFont;
  ctx.fillStyle = colors.accent;
  ctx.fillText(score, startX, baselineY);

  ctx.font = suffixFont;
  ctx.fillStyle = colors.text;
  ctx.fillText(suffix, startX + scoreWidth + gap, baselineY);
}

function drawCanvasStatCard(ctx, x, y, width, height, label, value, colors) {
  drawRoundRect(ctx, x, y, width, height, 24, colors.chip);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = colors.muted;
  ctx.font = `800 25px ${appFontStack}`;
  ctx.fillText(label, x + width / 2, y + 44);

  ctx.fillStyle = colors.text;
  ctx.font = `900 39px ${appFontStack}`;
  ctx.fillText(value, x + width / 2, y + 89);
}

function drawResultSeriesCanvas(ctx, options) {
  const { x, y, width, height, activeSeries, seriesIconImages, colors } = options;
  drawRoundRect(ctx, x, y, width, height, 28, colors.chipSoft);

  const metrics = getSeriesCanvasLayout(ctx, activeSeries, width, height);

  ctx.fillStyle = colors.muted;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `800 ${metrics.titleFontSize}px ${appFontStack}`;
  ctx.fillText(t("series"), x + width / 2, y + metrics.titleBaseline);

  const rows = metrics.rows;
  const totalRowsHeight = rows.length * metrics.pillHeight + Math.max(0, rows.length - 1) * metrics.rowGap;
  const availableHeight = height - metrics.listTop - metrics.bottomPadding;
  const listTop = y + metrics.listTop + Math.max(0, (availableHeight - totalRowsHeight) / 2);

  rows.forEach((row, rowIndex) => {
    const rowWidth = row.reduce((sum, series, index) => (
      sum + getSeriesCanvasPillWidth(ctx, series, metrics) + (index > 0 ? metrics.gap : 0)
    ), 0);
    let cursorX = x + (width - rowWidth) / 2;
    const pillY = listTop + rowIndex * (metrics.pillHeight + metrics.rowGap);

    row.forEach((series) => {
      const pillWidth = getSeriesCanvasPillWidth(ctx, series, metrics);
      drawSeriesCanvasPill(ctx, cursorX, pillY, pillWidth, metrics.pillHeight, series, seriesIconImages[series], colors, metrics);
      cursorX += pillWidth + metrics.gap;
    });
  });
}

function getSeriesCanvasLayout(ctx, seriesValues, width, height) {
  const variants = [
    { fontSize: 28, titleFontSize: 26, pillHeight: 52, rowGap: 16, gap: 16, padX: 18, badgeWidth: 42, badgeHeight: 32, badgeGap: 12, listTop: 74, bottomPadding: 24 },
    { fontSize: 26, titleFontSize: 25, pillHeight: 48, rowGap: 12, gap: 12, padX: 16, badgeWidth: 38, badgeHeight: 30, badgeGap: 10, listTop: 70, bottomPadding: 22 },
    { fontSize: 24, titleFontSize: 24, pillHeight: 44, rowGap: 10, gap: 10, padX: 14, badgeWidth: 34, badgeHeight: 28, badgeGap: 9, listTop: 66, bottomPadding: 22 },
    { fontSize: 22, titleFontSize: 23, pillHeight: 40, rowGap: 8, gap: 8, padX: 12, badgeWidth: 31, badgeHeight: 25, badgeGap: 8, listTop: 62, bottomPadding: 18 },
    { fontSize: 20, titleFontSize: 22, pillHeight: 36, rowGap: 6, gap: 8, padX: 10, badgeWidth: 29, badgeHeight: 23, badgeGap: 7, listTop: 56, bottomPadding: 16 },
    { fontSize: 18, titleFontSize: 21, pillHeight: 34, rowGap: 5, gap: 7, padX: 9, badgeWidth: 27, badgeHeight: 22, badgeGap: 6, listTop: 54, bottomPadding: 14 }
  ];
  const maxWidth = width - 48;

  for (const metrics of variants) {
    const rows = makeSeriesPillRows(ctx, seriesValues, maxWidth, metrics);
    const rowsHeight = rows.length * metrics.pillHeight + Math.max(0, rows.length - 1) * metrics.rowGap;
    if (rowsHeight <= height - metrics.listTop - metrics.bottomPadding) {
      return {
        ...metrics,
        titleBaseline: Math.min(44, metrics.listTop - 24),
        rows
      };
    }
  }

  const fallback = variants[variants.length - 1];
  return {
    ...fallback,
    titleBaseline: Math.min(44, fallback.listTop - 24),
    rows: makeSeriesPillRows(ctx, seriesValues, maxWidth, fallback)
  };
}

function makeSeriesPillRows(ctx, seriesValues, maxWidth, metrics) {
  const preferredRows = makePreferredSeriesRows(seriesValues);
  if (preferredRows && preferredRows.every((row) => getSeriesCanvasRowWidth(ctx, row, metrics) <= maxWidth)) {
    return preferredRows;
  }

  const rows = [];
  let row = [];
  let rowWidth = 0;

  seriesValues.forEach((series) => {
    const pillWidth = getSeriesCanvasPillWidth(ctx, series, metrics);
    const nextWidth = rowWidth + (row.length ? metrics.gap : 0) + pillWidth;
    if (row.length && nextWidth > maxWidth) {
      rows.push(row);
      row = [series];
      rowWidth = pillWidth;
      return;
    }

    row.push(series);
    rowWidth = nextWidth;
  });

  if (row.length) rows.push(row);
  return rows.length ? rows : [[]];
}

function makePreferredSeriesRows(seriesValues) {
  if (seriesValues.length === 4) {
    return [seriesValues.slice(0, 2), seriesValues.slice(2, 4)];
  }

  if (seriesValues.length === 5) {
    return [seriesValues.slice(0, 3), seriesValues.slice(3, 5)];
  }

  if (seriesValues.length === 6) {
    return [seriesValues.slice(0, 3), seriesValues.slice(3, 6)];
  }

  return null;
}

function getSeriesCanvasRowWidth(ctx, row, metrics) {
  return row.reduce((sum, series, index) => (
    sum + getSeriesCanvasPillWidth(ctx, series, metrics) + (index > 0 ? metrics.gap : 0)
  ), 0);
}

function drawSeriesCanvasPill(ctx, x, y, width, height, series, iconImage, colors, metrics) {
  ctx.save();
  ctx.shadowColor = "rgba(20, 24, 40, 0.08)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  drawRoundRect(ctx, x, y, width, height, 18, colors.pill);
  ctx.restore();

  const badgeSize = { width: metrics.badgeWidth, height: metrics.badgeHeight };
  const badgeX = x + metrics.padX;
  const badgeY = y + (height - badgeSize.height) / 2;
  drawSeriesCanvasBadge(ctx, badgeX, badgeY, badgeSize.width, badgeSize.height, series, iconImage);

  ctx.fillStyle = colors.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${metrics.fontSize}px ${appFontStack}`;
  ctx.fillText(getSeriesLabel(series), badgeX + badgeSize.width + metrics.badgeGap, y + height / 2 + 1);
}

function getSeriesCanvasPillWidth(ctx, series, metrics) {
  ctx.font = `900 ${metrics.fontSize}px ${appFontStack}`;
  return Math.ceil(metrics.padX + metrics.badgeWidth + metrics.badgeGap + ctx.measureText(getSeriesLabel(series)).width + metrics.padX);
}

function drawSeriesCanvasBadge(ctx, x, y, width, height, series, iconImage) {
  const colors = getSeriesCanvasColors(series);
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, colors.from);
  gradient.addColorStop(1, colors.to);

  ctx.save();
  ctx.shadowColor = "rgba(20, 24, 40, 0.12)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  drawRoundRect(ctx, x, y, width, height, 10, gradient);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.34)";
  ctx.lineWidth = 1;
  strokeRoundRect(ctx, x + 0.5, y + 0.5, width - 1, height - 1, 10);
  ctx.restore();

  if (iconImage) {
    const fit = containRect(iconImage.width, iconImage.height, x + 5, y + 4, width - 10, height - 8);
    ctx.drawImage(iconImage, fit.x, fit.y, fit.width, fit.height);
    return;
  }

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `900 13px ${appFontStack}`;
  ctx.fillText(getSeriesFallbackMark(series), x + width / 2, y + height / 2 + 5);
}

function getSeriesCanvasColors(series) {
  return {
    allstars: { from: "#ff7894", to: "#f34f6d" },
    million: { from: "#ffdc64", to: "#ffc30b" },
    cinderella: { from: "#5aaee8", to: "#2681c8" },
    shiny: { from: "#ff7db7", to: "#7ac7ff" },
    gakuen: { from: "#ffc052", to: "#f39800" },
    sidem: { from: "#5be5c8", to: "#0fbe94" }
  }[series] || { from: "#8db7ff", to: "#6f9ff2" };
}

function getSeriesFallbackMark(series) {
  return {
    allstars: "AS",
    million: "MS",
    cinderella: "CG",
    shiny: "SC",
    gakuen: "G",
    sidem: "SM"
  }[series] || "@";
}

function containRect(sourceWidth, sourceHeight, x, y, width, height) {
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const fittedWidth = sourceWidth * scale;
  const fittedHeight = sourceHeight * scale;
  return {
    x: x + (width - fittedWidth) / 2,
    y: y + (height - fittedHeight) / 2,
    width: fittedWidth,
    height: fittedHeight
  };
}

function loadSeriesIconImages(seriesValues) {
  return Promise.all(seriesValues.map((series) => loadImage(seriesIcons[series])))
    .then((images) => seriesValues.reduce((map, series, index) => {
      map[series] = images[index];
      return map;
    }, {}));
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function setFittedCanvasFont(ctx, text, maxWidth, weight, startSize, minSize) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${appFontStack}`;
    if (ctx.measureText(text).width <= maxWidth || size <= minSize) break;
    size -= 2;
  } while (size > minSize);
  return size;
}

function drawTrackedCenteredText(ctx, text, centerX, baselineY, tracking) {
  const characters = [...text];
  if (characters.length <= 1) {
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, centerX, baselineY);
    return;
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const widths = characters.map((character) => ctx.measureText(character).width);
  const textWidth = widths.reduce((sum, width) => sum + width, 0) + tracking * (characters.length - 1);
  let cursorX = centerX - textWidth / 2;

  characters.forEach((character, index) => {
    ctx.fillText(character, cursorX, baselineY);
    cursorX += widths[index] + tracking;
  });
}

function drawRoundRect(ctx, x, y, width, height, radius, fillStyle) {
  addRoundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeRoundRect(ctx, x, y, width, height, radius) {
  addRoundRectPath(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function addRoundRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function resetGame() {
  hideWrongNoteModalImmediately();
  state.questions = [];
  state.index = 0;
  state.correct = 0;
  state.locked = false;
  state.currentAnswerFeedback = null;
  state.currentCombo = 0;
  state.wrongAnswers = [];
  updateComboBadge(false);
  nextButton.hidden = true;
  if (wrongNoteSection) wrongNoteSection.hidden = true;
  if (wrongNoteList) wrongNoteList.innerHTML = "";
  resultPreview.hidden = true;
  resultPreviewImage.removeAttribute("src");
  showScreen("start");
  updateStartSummary();
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function inferMillionSeries(idol) {
  return idol.group === "765PRO ALLSTARS" ? "allstars" : "million";
}

function resolveImagePath(idol) {
  const fileName = IDOL_IMAGE_FILES[idol.no] || idol.image;
  if (fileName.includes("/")) return `assets/idols/${fileName}`;
  return `assets/idols/${idol.series || inferMillionSeries(idol)}/${fileName}`;
}

function createFallbackHairColor(hsl) {
  return hslToHex(hsl.h + 24, clamp(hsl.s - 18, 16, 78), clamp(hsl.l - 14, 18, 72));
}

function syncSeriesSelection(changedInput) {
  const allInput = document.querySelector("input[name='series'][value='all']");
  const individualInputs = [...document.querySelectorAll("input[name='series']")]
    .filter((input) => input.value !== "all");

  if (changedInput.value === "all" && changedInput.checked) {
    individualInputs.forEach((input) => {
      input.checked = false;
    });
  } else if (changedInput.value !== "all") {
    allInput.checked = false;
    if (individualInputs.every((input) => input.checked)) {
      individualInputs.forEach((input) => {
        input.checked = false;
      });
      allInput.checked = true;
    }
  }

  if (!allInput.checked && !individualInputs.some((input) => input.checked)) {
    allInput.checked = true;
  }

  state.series = getSelectedSeriesValues();
}

function getSelectedSeriesValues() {
  const allInput = document.querySelector("input[name='series'][value='all']");
  if (allInput?.checked) return ["all"];
  const selected = [...document.querySelectorAll("input[name='series']:checked")]
    .map((input) => input.value)
    .filter((value) => value !== "all");
  return selected.length ? selected : ["all"];
}

function getActiveSeriesValues(values = getSelectedSeriesValues()) {
  return values.includes("all") ? seriesOrder : values;
}

function getSeriesLabelFromValues(values = getSelectedSeriesValues()) {
  if (values.includes("all") || values.length === seriesOrder.length) return getSeriesLabel("all");
  return values.map((value) => getSeriesLabel(value)).join(" + ");
}

function renderStartSeries(values = getSelectedSeriesValues()) {
  renderSeriesItems(poolSeriesList, values, "pool-series-item");
}

function renderResultSeries(values = getSelectedSeriesValues()) {
  const resultGroup = document.getElementById("resultGroup");
  renderSeriesItems(resultGroup, values, "result-series-item");
}

function renderSeriesItems(container, values, itemClassName) {
  const activeSeries = getActiveSeriesValues(values);
  container.innerHTML = "";
  container.dataset.summary = getSeriesLabelFromValues(values);

  activeSeries.forEach((series) => {
    const item = document.createElement("div");
    item.className = `${itemClassName} series-summary-item`;

    const iconBadge = document.createElement("span");
    iconBadge.className = `series-logo-badge ${getSeriesBadgeClass(series)}`;

    const icon = document.createElement("img");
    icon.className = "series-icon-img";
    icon.src = seriesIcons[series];
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    iconBadge.appendChild(icon);

    const name = document.createElement("span");
    name.className = itemClassName === "result-series-item" ? "result-series-name" : "pool-series-name";
    name.textContent = getSeriesLabel(series);

    item.append(iconBadge, name);
    container.appendChild(item);
  });
}

function getSeriesBadgeClass(series) {
  return {
    allstars: "allstars",
    million: "millionstars",
    cinderella: "cinderella",
    shiny: "shinycolors",
    gakuen: "gakuen",
    sidem: "sidem"
  }[series] || series;
}

function getAttributeLabel(attribute) {
  return getDictionary().attributeLabels?.[attribute] || attributeLabels[attribute] || attribute;
}

function getSeriesLabel(series) {
  return getDictionary().seriesLabels?.[series] || seriesLabels[series] || series;
}

function getDifficultyLabel(difficulty) {
  return getDictionary().difficultyLabels?.[difficulty] || difficultyLabels[difficulty] || difficulty;
}

function getPool() {
  const activeSeries = getActiveSeriesValues();
  return enrichedIdols.filter((idol) => activeSeries.includes(idol.series));
}

function updateStartSummary() {
  const poolSize = getPool().length;
  const difficulty = document.querySelector("input[name='difficulty']:checked")?.value || state.difficulty;
  const count = getQuestionCountValue(poolSize);
  questionCountInput.max = String(poolSize);
  renderStartSeries();
  poolTitle.textContent = t("totalPeople", poolSize);
  poolMeta.textContent = t("poolMeta", count, getDifficultyLabel(difficulty));
}

function normalizeQuestionCount(poolSize = getPool().length) {
  const count = getQuestionCountValue(poolSize);
  questionCountInput.max = String(poolSize);
  questionCountInput.value = String(count);
  updatePresetSelection();
  updateStartSummary();
  return count;
}

function getQuestionCountValue(poolSize = getPool().length) {
  const rawValue = Number(questionCountInput.value);
  if (questionCountInput.value.trim() === "" || !Number.isFinite(rawValue)) return 1;
  return clamp(Math.trunc(rawValue), 1, poolSize);
}

function syncQuestionCountWithPool(poolSize = getPool().length) {
  questionCountInput.max = String(poolSize);

  if (state.countMode === "all") {
    questionCountInput.value = String(poolSize);
    return;
  }

  const requestedCount = getRequestedQuestionCount(poolSize);
  questionCountInput.value = String(clamp(requestedCount, 1, poolSize));
}

function getRequestedQuestionCount(poolSize = getPool().length) {
  const requestedCount = Number(state.requestedQuestionCount);
  if (Number.isFinite(requestedCount)) return Math.trunc(requestedCount);
  return getQuestionCountValue(poolSize);
}

function updatePresetSelection(activeButton = null) {
  const poolSize = getPool().length;
  const value = Number(questionCountInput.value);
  document.querySelectorAll(".count-preset").forEach((button) => {
    let matches = false;

    if (activeButton) {
      matches = button === activeButton;
    } else if (button.dataset.count === "all") {
      matches = state.countMode === "all" && value === poolSize;
    } else {
      matches = state.countMode === "preset" && Number(button.dataset.count) === value;
    }

    button.classList.toggle("is-selected", matches);
  });

  questionCountField?.classList.toggle("is-manual", state.countMode === "manual");
  questionCountInput.setAttribute("aria-current", state.countMode === "manual" ? "true" : "false");
}

function setQuestionImage(question) {
  imageFrame.classList.remove("is-missing");
  imageFallback.style.background = makeFallbackBackground(question.hex);
  updateQuestionImageText(question);
  characterImage.onload = () => imageFrame.classList.remove("is-missing");
  characterImage.onerror = () => imageFrame.classList.add("is-missing");
  characterImage.src = question.image;
}

function updateQuestionImageText(question) {
  const displayName = getIdolDisplayName(question);
  fallbackName.textContent = displayName;
  characterImage.alt = t("illustrationAlt", displayName);
}

function updateSwatchAriaLabels() {
  [...swatches.children].forEach((button, index) => {
    button.setAttribute("aria-label", t("swatchLabel", index + 1));
  });
}

function getIdolDisplayName(idol) {
  if (state.language === "jp") return idol.jpName || idol.name;
  if (state.language === "en") return getRomanizedIdolName(idol);
  return idol.name;
}

function getIdolMetaName(idol) {
  if (state.language === "jp") return getRomanizedIdolName(idol);
  if (state.language === "en") return idol.jpName || idol.name;
  return idol.jpName || idol.name;
}

function getRomanizedIdolName(idol) {
  const fileName = String(idol.image || "").split("/").pop()?.replace(/\.[^.]+$/, "") || "";
  const readableName = fileName
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
  return readableName || idol.name || idol.jpName;
}

function preloadUpcomingImages() {
  state.questions.slice(state.index + 1, state.index + 3).forEach((question) => {
    const image = new Image();
    image.decoding = "async";
    image.src = question.image;
  });
}

function generateDistractors(question, difficulty) {
  const settings = getDifficultyChoiceSettings(difficulty);
  const targetDistractorCount = settings.distractorCount;
  const correctHex = question.hex.toLowerCase();
  const base = question.hsl;
  const distanceRules = getVisualDistanceRules(difficulty);
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
    closestRealColors(question, 8).forEach((hex) => {
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
  const hairTrapRules = getHairTrapDistanceRules(difficulty);

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

function getHairTrapDistanceRules(difficulty) {
  const { minFromAnswer, minBetweenChoices } = getVisualDistanceRules(difficulty);
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

function closestRealColors(question, count) {
  const correctHex = question.hex.toLowerCase();
  const ranked = enrichedIdols
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

function getVisualDistanceRules(difficulty) {
  if (difficulty === "easy") {
    return { minFromAnswer: 30, minBetweenChoices: 16 };
  }

  if (difficulty === "normal") {
    return { minFromAnswer: 22, minBetweenChoices: 13 };
  }

  if (difficulty === "hard") {
    return { minFromAnswer: 16, minBetweenChoices: 10, maxFromAnswer: 62 };
  }

  return { minFromAnswer: 11, minBetweenChoices: 8, maxFromAnswer: 36 };
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

function perceptualColorDistance(hexA, hexB) {
  const a = rgbToLab(hexToRgb(hexA));
  const b = rgbToLab(hexToRgb(hexB));
  return Math.hypot(a.l - b.l, a.a - b.a, a.b - b.b);
}

function rgbToLab({ r, g, b }) {
  const linearR = srgbToLinear(r / 255);
  const linearG = srgbToLinear(g / 255);
  const linearB = srgbToLinear(b / 255);

  const x = (0.4124 * linearR + 0.3576 * linearG + 0.1805 * linearB) / 0.95047;
  const y = (0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB);
  const z = (0.0193 * linearR + 0.1192 * linearG + 0.9505 * linearB) / 1.08883;

  const fx = labPivot(x);
  const fy = labPivot(y);
  const fz = labPivot(z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

function srgbToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function labPivot(value) {
  return value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "").trim();
  const value = parseInt(normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (max === g) h = (b - r) / d + 2;
    if (max === b) h = (r - g) / d + 4;
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(value) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
}

function hueDistance(a, b) {
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
}

function makeFallbackBackground(hex) {
  const { h, s, l } = hexToHsl(hex);
  const darker = hslToHex(h, clamp(s + 8, 15, 95), clamp(l - 18, 16, 58));
  const lighter = hslToHex(h + 18, clamp(s + 4, 18, 95), clamp(l + 12, 42, 82));
  return `linear-gradient(145deg, ${lighter}, ${hex} 48%, ${darker})`;
}

function getResultMessage(percent) {
  const messages = getDictionary().resultMessages;
  if (percent === 100) return messages.perfect;
  if (percent >= 80) return messages.great;
  if (percent >= 60) return messages.good;
  if (percent >= 40) return messages.fair;
  if (percent >= 11) return messages.low;
  return messages.zero;
}

function shuffle(items) {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInteger(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function randomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}
