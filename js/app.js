"use strict";

/*
  js/app.js
  Game state, screens and UI wiring: setup, question flow, timer, scoring and results.
  Reads window.IdolmasterQuizData (data/quiz-data.js) and window.translations (js/lang.js),
  and relies on js/color.js, js/search.js and js/choices.js for the pure logic.
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

const difficultyTiming = Object.freeze({
  easy: Object.freeze({ limitSeconds: 30, maxScore: 500 }),
  normal: Object.freeze({ limitSeconds: 25, maxScore: 1000 }),
  hard: Object.freeze({ limitSeconds: 20, maxScore: 1500 }),
  "very-hard": Object.freeze({ limitSeconds: 15, maxScore: 2000 })
});

const state = {
  questions: [],
  index: 0,
  correct: 0,
  difficulty: "normal",
  series: ["all"],
  resultSeries: [],
  resultCompletedAt: null,
  answerRecords: [],
  questionStartedAt: null,
  countMode: "all",
  requestedQuestionCount: null,
  language: "ko",
  customSeriesFilter: seriesOrder[0] || "allstars",
  customSearchQuery: "",
  customSelectedIds: new Set(),
  currentAnswerFeedback: null,
  currentCombo: 0,
  wrongAnswers: [],
  locked: false
};
const screens = {
  start: document.getElementById("startScreen"),
  quiz: document.getElementById("quizScreen"),
  result: document.getElementById("resultScreen"),
  guide: document.getElementById("guideScreen")
};

const questionCountInput = document.getElementById("questionCount");
const questionCountField = questionCountInput.closest(".number-field");
const customPanel = document.getElementById("customPanel");
const customSeriesFilters = document.getElementById("customSeriesFilters");
const customIdolGrid = document.getElementById("customIdolGrid");
const customSelectedCount = document.getElementById("customSelectedCount");
const customSearchInput = document.getElementById("customSearchInput");
const customSearchClearButton = document.getElementById("customSearchClearButton");
const customSelectVisibleButton = document.getElementById("customSelectVisibleButton");
const customClearVisibleButton = document.getElementById("customClearVisibleButton");
const customResetButton = document.getElementById("customResetButton");
const poolTitle = document.getElementById("poolTitle");
const poolMeta = document.getElementById("poolMeta");
const poolSeriesList = document.getElementById("poolSeriesList");
const startButton = document.getElementById("startButton");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const questionTimer = document.getElementById("questionTimer");
const questionTimeLeft = document.getElementById("questionTimeLeft");
const pointsText = document.getElementById("pointsText");
const comboBadge = document.getElementById("comboBadge");
const scoreText = document.getElementById("scoreText");
const quizDifficultyChip = document.getElementById("quizDifficultyChip");
const quizDifficultyLabel = document.getElementById("quizDifficultyLabel");
const quizDifficultyName = document.getElementById("quizDifficultyName");
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
const resultPreviewBackdrop = document.getElementById("resultPreviewBackdrop");
const resultPreviewCloseButton = document.getElementById("resultPreviewCloseButton");
const resultPreviewTitle = document.getElementById("resultPreviewTitle");
const resultPreviewImage = document.getElementById("resultPreviewImage");
const resultPreviewActionButton = document.getElementById("resultPreviewActionButton");
const wrongNoteSection = document.getElementById("wrongNoteSection");
const wrongNoteTitle = document.getElementById("wrongNoteTitle");
const wrongNoteList = document.getElementById("wrongNoteList");
const wrongNoteExpandButton = document.getElementById("wrongNoteExpandButton");
const wrongNoteModal = document.getElementById("wrongNoteModal");
const wrongNoteBackdrop = document.getElementById("wrongNoteBackdrop");
const wrongNoteCloseButton = document.getElementById("wrongNoteCloseButton");
const wrongNoteModalTitle = document.getElementById("wrongNoteModalTitle");
const wrongNoteModalList = document.getElementById("wrongNoteModalList");
const wrongNoteShareButtons = [
  document.getElementById("wrongNoteShareButton"),
  document.getElementById("wrongNoteModalShareButton")
].filter(Boolean);
const scoreUnit = document.getElementById("scoreUnit");
const homeButton = document.getElementById("homeButton");
const nextButton = document.getElementById("nextButton");
const themeToggle = document.getElementById("themeToggle");
const themeButtons = [themeToggle, document.getElementById("guideThemeToggle")].filter(Boolean);
const languageButtons = [...document.querySelectorAll(".language-button")];
const themeStorageKey = "idolmasterColorQuizTheme";
const languageStorageKey = "idolmasterColorQuizLanguage";
const customFilterButtonCache = new Map();
const customIdolCardCache = new Map();
const customFilterValues = Object.freeze(["all", ...seriesOrder]);
let wrongNoteModalCloseTimer = 0;
let resultPreviewCloseTimer = 0;
let stageGlowTimer = 0;
let stageGlowFadeTimer = 0;
let themeTransitionCleanupFrame = 0;
let themeTransitionCleanupTimer = 0;
let customGridRenderFrame = 0;
let preparedResultBlob = null;
let preparedResultFileName = "";
let preparedResultObjectUrl = "";
let preparedShareKind = "result";
let preparedShareTrigger = null;
let questionImageRequestId = 0;
let questionTimerFrame = 0;
let questionTimeout = 0;
let resultImageRequestId = 0;
let customRenderedSeriesFilter = "";
let customRenderedSearchQuery = "";
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
    faceImage: resolveFaceImagePath(idol),
    hsl,
    hairHex,
    hairHsl: hexToHsl(hairHex)
  };
});
const enrichedIdolByNo = new Map(enrichedIdols.map((idol) => [idol.no, idol]));
const customIdolsBySeries = new Map();
seriesOrder.forEach((series) => {
  const idols = enrichedIdols.filter((idol) => idol.series === series);
  if (series === "sidem") idols.sort((left, right) => left.officialId - right.officialId);
  customIdolsBySeries.set(series, idols);
});
customIdolsBySeries.set("all", seriesOrder.flatMap((series) => customIdolsBySeries.get(series)));

initializeCustomSelection();
syncQuestionCountWithPool();
updatePresetSelection();
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
    renderCustomPanel();
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
    const wasSelected = button.classList.contains("is-selected") && (
      button.dataset.count === "all" ? state.countMode === "all" : state.countMode === "preset"
    );

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
    syncQuestionCountWithPool(poolSize);
    updatePresetSelection();
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
wrongNoteShareButtons.forEach((button) => button.addEventListener("click", shareWrongNoteImage));
resultPreviewBackdrop?.addEventListener("click", closeResultPreviewModal);
resultPreviewCloseButton?.addEventListener("click", closeResultPreviewModal);
resultPreviewActionButton?.addEventListener("click", sharePreparedResultImage);
wrongNoteExpandButton?.addEventListener("click", openWrongNoteModal);
wrongNoteCloseButton?.addEventListener("click", closeWrongNoteModal);
wrongNoteBackdrop?.addEventListener("click", closeWrongNoteModal);
customSelectVisibleButton?.addEventListener("click", () => setCustomSelectionForVisibleIdols(true));
customClearVisibleButton?.addEventListener("click", () => setCustomSelectionForVisibleIdols(false));
customResetButton?.addEventListener("click", clearCustomSelection);
customSearchInput?.addEventListener("input", () => {
  state.customSearchQuery = customSearchInput.value;
  scheduleCustomIdolGridRender();
});
customSearchClearButton?.addEventListener("click", () => {
  state.customSearchQuery = "";
  customSearchInput.value = "";
  cancelScheduledCustomIdolGridRender();
  renderCustomIdolGrid();
  customSearchInput.focus({ preventScroll: true });
});
homeButton.addEventListener("click", resetGame);
nextButton.addEventListener("click", continueAfterFeedback);
document.addEventListener("visibilitychange", tickQuestionTimer);
themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && trapFocusInOpenModal(event)) {
    return;
  }

  // The illustration dialog can sit above the wrong-note dialog; guide.js closes it first.
  if (event.key === "Escape" && window.IdolmasterColorGuide?.getOpenDialog()) {
    return;
  }

  if (event.key === "Escape" && resultPreview && !resultPreview.hidden) {
    closeResultPreviewModal();
    return;
  }

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
  const root = document.documentElement;
  const previousTheme = root.dataset.theme;
  if (previousTheme && previousTheme !== normalizedTheme) {
    suppressThemeTransitionWork();
  }
  root.dataset.theme = normalizedTheme;
  themeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(normalizedTheme === "dark"));
    button.setAttribute("aria-label", normalizedTheme === "dark" ? t("themeToLight") : t("themeToDark"));
    button.title = button.getAttribute("aria-label");
  });

  if (shouldStore) {
    try {
      window.localStorage?.setItem(themeStorageKey, normalizedTheme);
    } catch (error) {
      // The selected theme still applies for the current page.
    }
  }
}

function suppressThemeTransitionWork() {
  const root = document.documentElement;
  root.classList.add("is-theme-switching");

  if (themeTransitionCleanupFrame) {
    cancelAnimationFrame(themeTransitionCleanupFrame);
    themeTransitionCleanupFrame = 0;
  }
  if (themeTransitionCleanupTimer) {
    clearTimeout(themeTransitionCleanupTimer);
    themeTransitionCleanupTimer = 0;
  }

  themeTransitionCleanupFrame = requestAnimationFrame(() => {
    themeTransitionCleanupFrame = requestAnimationFrame(() => {
      themeTransitionCleanupFrame = 0;
      themeTransitionCleanupTimer = window.setTimeout(() => {
        themeTransitionCleanupTimer = 0;
        root.classList.remove("is-theme-switching");
      }, 220);
    });
  });
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
  document.querySelectorAll(".language-toggle").forEach((toggle) => toggle.setAttribute("aria-label", t("languageSelect")));
  setText(".series-panel legend", t("seriesSelect"));
  setText("#customPanelTitle", t("customPanelTitle"));
  setText("#customPanelHint", t("customPanelHint"));
  setText(customSelectVisibleButton, t("customSelectVisible"));
  setText(customClearVisibleButton, t("customClearVisible"));
  setText(customResetButton, t("customReset"));
  customSearchInput?.setAttribute("placeholder", t("customSearchPlaceholder"));
  customSearchInput?.setAttribute("aria-label", t("customSearchPlaceholder"));
  customSearchClearButton?.setAttribute("aria-label", t("customSearchClear"));
  if (customSearchClearButton) customSearchClearButton.textContent = "×";
  customSeriesFilters?.setAttribute("aria-label", t("customSeriesFilterLabel"));
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
  setText("#quizScreen .stat:nth-child(3) span", t("scoreLabel"));
  setText("#questionTimerLabel", t("timeLeft"));
  questionTimer.setAttribute("aria-label", t("timeLeft"));
  updateQuizDifficultyChip();
  setText(".result-main .eyebrow", t("resultEyebrow"));
  setText("#resultMessage", t("result"));
  setText(".result-stat:nth-child(1) > span", t("correctCount"));
  setText(".result-stat:nth-child(2) > span", t("totalQuestions"));
  setText(".result-stat:nth-child(3) > span", t("resultDifficulty"));
  setText(".result-stat:nth-child(4) > span", t("averageTime"));
  setText(".result-stat-series > span", t("series"));
  document.getElementById("resultGroup")?.setAttribute("aria-label", t("series"));
  setText(wrongNoteTitle, t("wrongNoteTitle"));
  setText(wrongNoteModalTitle, t("wrongNoteTitle"));
  setText(wrongNoteExpandButton, t("wrongNoteExpand"));
  wrongNoteCloseButton?.setAttribute("aria-label", t("wrongNoteClose"));
  setText("#saveResultButton", t("saveResult"));
  wrongNoteShareButtons.forEach((button) => setText(button, t("wrongNoteShare")));
  setText("#resetButton", t("backToStart"));
  setText(resultPreviewTitle, t("resultImage"));
  resultPreviewCloseButton?.setAttribute("aria-label", t("wrongNoteClose"));
  setText(resultPreviewActionButton, t("resultPreviewAction"));
  setText(scoreUnit, `/ ${getTimingRules().maxScore}`);
  resultPreviewImage.alt = t("resultImageAlt");
  questionCountField?.querySelector("label")?.setAttribute("data-active-label", t("manualActive"));
  syncCountPresetLabels();
  syncDifficultyLabels();
  syncSeriesOptionLabels();
  customRenderedSeriesFilter = "";
  customRenderedSearchQuery = "";
  renderCustomPanel();
  applyTheme(document.documentElement.dataset.theme || getInitialTheme());
  refreshLocalizedScreen();
  window.IdolmasterColorGuide?.refresh();

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
    updateQuizDifficultyChip();
    updateQuestionTimerDisplay(state.locked ? state.answerRecords.at(-1)?.elapsedMs || 0 : getQuestionElapsedMs(), state.questionStartedAt === null);
    updateSwatchAriaLabels();
    updateComboBadge(false);
    if (state.currentAnswerFeedback) {
      renderAnswerNote(
        state.currentAnswerFeedback.isCorrect,
        state.currentAnswerFeedback.answerHex,
        state.currentAnswerFeedback.selectedHex,
        state.currentAnswerFeedback.timedOut,
        state.currentAnswerFeedback.earnedPoints
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
    if (button.dataset.count === "10") button.textContent = t("countPreset10");
    if (button.dataset.count === "20") button.textContent = t("countPreset20");
    if (button.dataset.count === "all") button.textContent = t("countPresetAll");
  });
}

function syncDifficultyLabels() {
  document.querySelectorAll("input[name='difficulty']").forEach((input) => {
    const label = input.closest(".choice-label");
    const strong = label?.querySelector("strong");
    if (strong) strong.textContent = getDifficultyLabel(input.value);

    const description = label?.querySelector(".difficulty-description");
    if (description) description.textContent = getDifficultyDescription(input.value);

    // The spec badge is drawn from difficultyTiming so the numbers can never drift from the rules.
    const { limitSeconds, maxScore } = getTimingRules(input.value);
    setText(label?.querySelector(".difficulty-spec b"), `${limitSeconds}s`);
    setText(label?.querySelector(".difficulty-spec small"), `MAX ${maxScore}`);
  });
}

function syncSeriesOptionLabels() {
  document.querySelectorAll("input[name='series']").forEach((input) => {
    const label = input.closest(".choice-label");
    if (!label) return;

    const name = label.querySelector(".group-choice-main strong");
    if (name) renderSeriesOptionName(name, input.value);

    const count = getSeriesOptionCount(input.value);
    const directChildren = [...label.children];
    const countElement = directChildren[directChildren.length - 1];
    if (countElement && countElement.tagName === "SPAN") {
      countElement.textContent = formatPeopleCount(count);
    }
  });
}

function renderSeriesOptionName(element, series) {
  const chunks = getSeriesOptionNameChunks(series);
  element.textContent = "";

  if (!chunks.length) {
    element.textContent = getSeriesLabel(series);
    return;
  }

  chunks.forEach((chunk) => {
    const span = document.createElement("span");
    span.className = "series-name-chunk";
    span.textContent = chunk;
    element.appendChild(span);
  });
}

function getSeriesOptionNameChunks(series) {
  if (state.language !== "jp") return [];
  return {
    million: ["ミリオン", "スターズ"],
    cinderella: ["シンデレラ", "ガールズ"],
    shiny: ["シャイニー", "カラーズ"],
    gakuen: ["学園", "アイドル", "マスター"]
  }[series] || [];
}

function getSeriesOptionCount(value) {
  if (value === "all") return enrichedIdols.length;
  if (value === "custom") return state.customSelectedIds.size;
  return enrichedIdols.filter((idol) => idol.series === value).length;
}

function formatPeopleCount(count) {
  if (state.language === "en") return String(count);
  return `${count}${t("peopleSuffix")}`;
}

function startGame() {
  const pool = shuffle(getPool());
  const total = normalizeQuestionCount(pool.length);
  if (total <= 0) return;
  state.questions = pool.slice(0, total);
  state.resultCompletedAt = null;
  state.answerRecords = [];
  state.index = 0;
  state.correct = 0;
  state.currentCombo = 0;
  state.wrongAnswers = [];
  state.difficulty = document.querySelector("input[name='difficulty']:checked").value;
  state.series = getSelectedSeriesValues();
  state.resultSeries = getSeriesValuesFromIdols(state.questions);
  showScreen("quiz");
  updateQuizDifficultyChip();
  renderQuestion();
}

function getTimingRules(difficulty = state.difficulty) {
  return difficultyTiming[difficulty] || difficultyTiming.normal;
}

// Every correct answer is worth the same; the timer only limits, it never discounts.
function getAnswerCredit(isCorrect) {
  return isCorrect ? 1 : 0;
}

function getRunScore(additionalCredit = 0) {
  if (!state.questions.length) return 0;
  const { maxScore } = getTimingRules();
  const credits = state.answerRecords.reduce((sum, answer) => sum + answer.credit, additionalCredit);
  // Round the accumulated score, so every question count can reach the exact cap.
  return Math.round(clamp(credits / state.questions.length, 0, 1) * maxScore);
}

function getAverageResponseSeconds() {
  if (!state.answerRecords.length) return 0;
  return state.answerRecords.reduce((sum, answer) => sum + answer.elapsedMs, 0) / state.answerRecords.length / 1000;
}

function formatResponseTime(seconds) {
  return t("seconds", seconds.toFixed(1));
}

function getQuestionElapsedMs() {
  return state.questionStartedAt === null ? 0 : Math.max(0, performance.now() - state.questionStartedAt);
}

function stopQuestionTimer() {
  window.cancelAnimationFrame(questionTimerFrame);
  window.clearTimeout(questionTimeout);
  questionTimerFrame = 0;
  questionTimeout = 0;
}

function startQuestionTimer(question) {
  if (state.questionStartedAt !== null || state.locked || question !== state.questions[state.index] || !screens.quiz.classList.contains("is-active")) return;
  state.questionStartedAt = performance.now();
  const startedAt = state.questionStartedAt;
  [...swatches.children].forEach(button => { button.disabled = false; });
  const expire = () => {
    if (state.locked || state.questionStartedAt !== startedAt || question !== state.questions[state.index]) return;
    const remaining = getTimingRules().limitSeconds * 1000 - getQuestionElapsedMs();
    if (remaining > 0) questionTimeout = window.setTimeout(expire, remaining);
    else judgeAnswer(null, null, question);
  };
  expire();
  tickQuestionTimer();
}

function tickQuestionTimer() {
  window.cancelAnimationFrame(questionTimerFrame);
  questionTimerFrame = 0;
  if (state.locked || state.questionStartedAt === null || !screens.quiz.classList.contains("is-active")) return;
  const elapsedMs = getQuestionElapsedMs();
  if (elapsedMs >= getTimingRules().limitSeconds * 1000) {
    judgeAnswer(null, null, state.questions[state.index]);
    return;
  }
  updateQuestionTimerDisplay(elapsedMs);
  if (!document.hidden) questionTimerFrame = requestAnimationFrame(tickQuestionTimer);
}

function updateQuestionTimerDisplay(elapsedMs, loading = false) {
  const { limitSeconds } = getTimingRules();
  const remaining = Math.max(0, limitSeconds - elapsedMs / 1000);
  const lastAnswer = state.locked ? state.answerRecords.at(-1) : null;
  const timeText = loading ? "--" : formatResponseTime(Math.ceil(remaining * 10) / 10);
  if (questionTimeLeft.textContent !== timeText) questionTimeLeft.textContent = timeText;
  questionTimer.classList.toggle("is-urgent", remaining <= 5 && !loading && !lastAnswer);
  questionTimer.classList.toggle("is-answered", Boolean(lastAnswer));
  questionTimer.style.setProperty("--time-ratio", String(remaining / limitSeconds));
}

function renderQuestion() {
  stopQuestionTimer();
  state.questionStartedAt = null;
  state.locked = false;
  const question = state.questions[state.index];
  const current = state.index + 1;
  const total = state.questions.length;

  progressText.textContent = `${current} / ${total}`;
  setProgress((current - 1) / total);
  scoreText.textContent = String(state.correct);
  pointsText.textContent = String(getRunScore());
  updateQuestionTimerDisplay(0, true);
  updateQuizDifficultyChip();
  renderQuestionText(question);
  answerNote.innerHTML = "";
  feedback.className = "feedback";
  state.currentAnswerFeedback = null;
  imageFrame.classList.remove("is-shaking");
  imageFrame.style.removeProperty("--reveal-color");
  clearCorrectGlow();
  updateComboBadge(false);
  nextButton.hidden = true;
  nextButton.textContent = t("confirm");

  renderChoices(question);
  setQuestionImage(question);
  preloadUpcomingImages();
  animateQuestionEntry();
}

function animateQuestionEntry() {
  if (!quizStage.animate) return;
  quizStage.getAnimations().forEach((animation) => animation.cancel());
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  quizStage.animate([{ opacity: 0.65 }, { opacity: 1 }], {
    duration: 160,
    easing: "cubic-bezier(0.2, 0.7, 0.2, 1)"
  });
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
  const distractors = generateDistractors(question, state.difficulty, enrichedIdols);
  const choices = shuffleChoices(question, state.difficulty, [
    { hex: question.hex, isAnswer: true },
    ...distractors.map((hex) => ({ hex, isAnswer: false }))
  ]);

  swatches.innerHTML = "";
  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-choice";
    button.disabled = true;
    button.style.background = choice.hex;
    button.style.setProperty("--choice-hex", choice.hex);
    button.dataset.hex = choice.hex.toLowerCase();
    button.setAttribute("aria-label", t("swatchLabel", index + 1));
    button.addEventListener("click", () => judgeAnswer(button, choice, question));
    swatches.appendChild(button);
  });
}

function judgeAnswer(button, choice, question) {
  if (state.locked || state.questionStartedAt === null || question !== state.questions[state.index] || !screens.quiz.classList.contains("is-active")) return;
  const { limitSeconds } = getTimingRules();
  const elapsedMs = Math.min(getQuestionElapsedMs(), limitSeconds * 1000);
  const timedOut = elapsedMs >= limitSeconds * 1000;
  if (!choice && !timedOut) return;
  state.locked = true;
  stopQuestionTimer();

  const isCorrect = !timedOut && Boolean(choice?.isAnswer);
  const selectedHex = timedOut ? null : choice.hex;
  const previousScore = getRunScore();
  state.answerRecords.push({
    idolNo: question.no, isCorrect, timedOut, selectedHex, elapsedMs,
    credit: getAnswerCredit(isCorrect)
  });
  state.answerRecords.at(-1).points = getRunScore() - previousScore;
  updateQuestionTimerDisplay(elapsedMs);
  // Light the illustration's backdrop with the true image color, right or wrong.
  imageFrame.style.setProperty("--reveal-color", question.hex);
  if (isCorrect) {
    state.correct += 1;
    state.currentCombo += 1;
    button.classList.add("is-answer");
    triggerCorrectFeedback(button, question.hex);
  } else {
    state.currentCombo = 0;
    if (!timedOut) button?.classList.add("is-wrong");
    triggerWrongFeedback();
    recordWrongAnswer(question, selectedHex, timedOut);
    const answerButton = [...swatches.children].find((item) => item.dataset.hex === question.hex.toLowerCase());
    if (answerButton) answerButton.classList.add("is-answer");
  }
  updateComboBadge(isCorrect);

  state.currentAnswerFeedback = {
    isCorrect,
    answerHex: question.hex,
    selectedHex,
    timedOut,
    earnedPoints: state.answerRecords.at(-1).points
  };
  renderAnswerNote(isCorrect, question.hex, selectedHex, timedOut, state.currentAnswerFeedback.earnedPoints);

  feedbackMark.textContent = isCorrect ? "O" : "X";
  feedback.className = `feedback is-visible ${isCorrect ? "is-correct" : "is-wrong"}`;
  scoreText.textContent = String(state.correct);
  pointsText.textContent = String(getRunScore());
  setProgress((state.index + 1) / state.questions.length);
  [...swatches.children].forEach((item) => {
    item.disabled = true;
  });
  nextButton.textContent = state.index + 1 >= state.questions.length ? t("viewResult") : t("confirm");
  nextButton.hidden = false;
  nextButton.focus({ preventScroll: true });
}

function renderAnswerNote(isCorrect, answerHex, selectedHex, timedOut = false, earnedPoints = 0) {
  const answer = formatHex(answerHex);
  const selected = selectedHex ? formatHex(selectedHex) : "";
  const statusClass = isCorrect ? "is-correct" : "is-wrong";
  const statusText = timedOut ? t("answerTimeout") : isCorrect ? t("answerCorrect") : t("answerWrong");
  const points = isCorrect ? `<span class="answer-earned-points">${t("pointsWithUnit", earnedPoints)}</span>` : "";
  const selectedLine = isCorrect || timedOut ? "" : `
    <span class="answer-chip is-selected-color">
      <span class="mini-chip" style="background:${selected}"></span>
      ${t("answerSelected")} ${selected}
    </span>
  `;

  answerNote.innerHTML = `
    <div class="answer-result ${statusClass}">${statusText}${points}</div>
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

  if (state.currentCombo < 2) {
    comboBadge.hidden = true;
    comboBadge.textContent = "";
    comboBadge.setAttribute("aria-hidden", "true");
    comboBadge.classList.remove("is-visible", "is-popping");
    return;
  }

  comboBadge.hidden = false;
  comboBadge.textContent = t("comboText", state.currentCombo);
  comboBadge.setAttribute("aria-hidden", "false");
  comboBadge.classList.add("is-visible");

  if (animate) {
    comboBadge.classList.remove("is-popping");
    void comboBadge.offsetWidth;
    comboBadge.classList.add("is-popping");
  }
}

function updateQuizDifficultyChip() {
  if (!quizDifficultyChip) return;

  const difficultyLabel = getDifficultyLabel(state.difficulty);
  setText(quizDifficultyLabel, t("difficulty"));
  setText(quizDifficultyName, difficultyLabel);
  quizDifficultyChip.dataset.difficulty = state.difficulty;
  quizDifficultyChip.setAttribute(
    "aria-label",
    [t("difficulty"), difficultyLabel].filter(Boolean).join(" · ")
  );
}

function triggerCorrectFeedback(button, answerHex) {
  const stage = button.closest(".stage") || quizStage;
  if (!stage) return;

  clearCorrectGlow(stage, imageFrame);

  stage.style.setProperty("--stage-answer-glow", answerHex);
  imageFrame.style.setProperty("--image-answer-glow", answerHex);

  void stage.offsetWidth;
  void imageFrame.offsetWidth;

  stage.classList.add("is-answer-glow-on");
  imageFrame.classList.add("is-answer-glow-on");

  stageGlowFadeTimer = window.setTimeout(() => {
    stage.classList.remove("is-answer-glow-on");
    imageFrame.classList.remove("is-answer-glow-on");
    stage.classList.add("is-answer-glow-fading");
    imageFrame.classList.add("is-answer-glow-fading");
  }, 96);

  stageGlowTimer = window.setTimeout(() => {
    clearCorrectGlow(stage, imageFrame);
  }, 820);
}

function clearCorrectGlow(stage = quizStage, frame = imageFrame) {
  window.clearTimeout(stageGlowTimer);
  window.clearTimeout(stageGlowFadeTimer);
  stage?.classList.remove("is-answer-glow-on", "is-answer-glow-fading", "is-answer-glowing");
  frame?.classList.remove("is-answer-glow-on", "is-answer-glow-fading", "is-answer-glowing");
}

function triggerWrongFeedback() {
  imageFrame.classList.remove("is-shaking");
  void imageFrame.offsetWidth;
  imageFrame.classList.add("is-shaking");

  window.setTimeout(() => {
    imageFrame.classList.remove("is-shaking");
  }, 340);
}

function recordWrongAnswer(question, selectedHex, timedOut = false) {
  state.wrongAnswers.push({
    idol: question,
    image: question.image,
    selectedHex,
    timedOut,
    answerHex: question.hex
  });
}

function setProgress(ratio) {
  progressBar.style.transform = `scaleX(${clamp(ratio, 0, 1)})`;
}

function continueAfterFeedback() {
  if (!state.locked || !state.currentAnswerFeedback) return;
  clearCorrectGlow();
  state.index += 1;
  if (state.index >= state.questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  stopQuestionTimer();
  state.resultCompletedAt ||= new Date().toISOString();
  clearResultPreview();
  renderResultDetails();
  showScreen("result");
}

function renderResultDetails() {
  const total = state.questions.length;
  const score = getRunScore();
  const maxScore = getTimingRules().maxScore;
  const percent = getScorePercent(score, maxScore);
  document.getElementById("scorePercent").textContent = String(score);
  setText(scoreUnit, `/ ${maxScore}`);
  document.getElementById("scoreSummary").textContent = t("correctSummary", state.correct, total);
  document.getElementById("resultCorrect").textContent = t("countWithUnit", state.correct);
  document.getElementById("resultTotal").textContent = t("countWithUnit", total);
  document.getElementById("resultDifficulty").textContent = getDifficultyLabel(state.difficulty);
  setText("#resultAverageTime", formatResponseTime(getAverageResponseSeconds()));
  renderResultSeries(state.resultSeries.length ? state.resultSeries : state.series);
  renderWrongAnswers();
  const resultMessage = document.getElementById("resultMessage");
  resultMessage.textContent = getResultMessage(percent);
  resultMessage.hidden = !resultMessage.textContent;
  resultMessage.classList.toggle("is-perfect", percent >= 80);
  window.IdolmasterResultReport?.render();
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
  // Each card opens the same illustration dialog the color guide uses.
  const card = document.createElement("button");
  card.type = "button";
  card.className = `wrong-note-card ${variant === "modal" ? "is-modal" : ""}`.trim();
  card.setAttribute("aria-haspopup", "dialog");
  card.setAttribute("aria-label", t("guideViewIdol", getIdolDisplayName(item.idol)));
  card.addEventListener("click", () => window.IdolmasterColorGuide?.openIllustration(item.idol, card));

  const thumbnail = document.createElement("img");
  thumbnail.className = "wrong-note-thumb";
  thumbnail.src = item.image;
  thumbnail.alt = t("illustrationAlt", getIdolDisplayName(item.idol));
  thumbnail.loading = "lazy";
  thumbnail.decoding = "async";

  const body = document.createElement("span");
  body.className = "wrong-note-body";

  const name = document.createElement("strong");
  name.className = "wrong-note-name";
  name.textContent = getIdolDisplayName(item.idol);

  const colors = document.createElement("span");
  colors.className = "wrong-note-colors";
  if (item.timedOut) {
    const timeout = document.createElement("span");
    timeout.className = "wrong-color-badge is-timeout";
    timeout.textContent = t("answerTimeout");
    colors.appendChild(timeout);
  } else {
    colors.appendChild(createWrongColorBadge(t("wrongSelected"), item.selectedHex, "is-picked"));
  }
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

function getOpenModal() {
  const guideDialog = window.IdolmasterColorGuide?.getOpenDialog();
  if (guideDialog) return guideDialog;
  if (resultPreview && !resultPreview.hidden) return resultPreview;
  if (wrongNoteModal && !wrongNoteModal.hidden) return wrongNoteModal;
  return null;
}

function getFocusableElements(container) {
  if (!container) return [];
  return [...container.querySelectorAll(
    "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
  )].filter((element) => (
    element.getClientRects().length > 0
    && element.getAttribute("aria-hidden") !== "true"
  ));
}

function trapFocusInOpenModal(event) {
  const modal = getOpenModal();
  if (!modal) return false;

  const focusableElements = getFocusableElements(modal);
  if (!focusableElements.length) {
    event.preventDefault();
    return true;
  }

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (!modal.contains(activeElement)) {
    event.preventDefault();
    first.focus({ preventScroll: true });
    return true;
  }

  if (event.shiftKey && activeElement === first) {
    event.preventDefault();
    last.focus({ preventScroll: true });
    return true;
  }

  if (!event.shiftKey && activeElement === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
    return true;
  }

  return false;
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

// Each shareable image: how to draw it, its file name and the text sent along with it.
const shareImageKinds = Object.freeze({
  result: {
    draw: () => window.IdolmasterResultReport.createCanvas(),
    fileStem: "result",
    getText: () => document.getElementById("scoreSummary").textContent
  },
  wrongNote: {
    draw: () => window.IdolmasterResultReport.createWrongNoteCanvas(),
    fileStem: "missed",
    getText: () => `${t("wrongNoteTitle")} · ${t("correctSummary", state.correct, state.questions.length)}`
  }
});

function saveResultImage() {
  return prepareShareImage("result", saveResultButton);
}

function shareWrongNoteImage(event) {
  return prepareShareImage("wrongNote", event.currentTarget);
}

async function prepareShareImage(kind, trigger) {
  const requestId = ++resultImageRequestId;
  const originalText = trigger.textContent;
  trigger.disabled = true;
  trigger.textContent = t("saving");

  try {
    const canvas = await shareImageKinds[kind].draw();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
    if (!blob) throw new Error(t("resultImageError"));
    if (requestId !== resultImageRequestId || !screens.result.classList.contains("is-active")) return;

    if (preparedResultObjectUrl) URL.revokeObjectURL(preparedResultObjectUrl);
    preparedResultBlob = blob;
    preparedShareKind = kind;
    preparedShareTrigger = trigger;
    preparedResultFileName = getShareFileName(kind);
    preparedResultObjectUrl = URL.createObjectURL(blob);
    resultPreviewImage.src = preparedResultObjectUrl;
    resultPreviewActionButton.disabled = false;
    openResultPreviewModal();
  } catch (error) {
    if (requestId !== resultImageRequestId) return;
    clearResultPreview();
    window.alert(t("resultSaveError"));
  } finally {
    if (requestId === resultImageRequestId) {
      trigger.disabled = false;
      trigger.textContent = originalText;
    }
  }
}

async function sharePreparedResultImage() {
  if (!preparedResultBlob) {
    await prepareShareImage(preparedShareKind, preparedShareTrigger || saveResultButton);
    return;
  }

  const originalText = resultPreviewActionButton.textContent;
  resultPreviewActionButton.disabled = true;
  resultPreviewActionButton.textContent = t("saving");

  try {
    await shareOrDownloadBlob(preparedResultBlob, preparedResultFileName || getShareFileName(preparedShareKind), shareImageKinds[preparedShareKind].getText());
  } catch (error) {
    window.alert(t("resultSaveError"));
  } finally {
    resultPreviewActionButton.disabled = false;
    resultPreviewActionButton.textContent = originalText;
  }
}

async function shareOrDownloadBlob(blob, fileName, text) {
  if (navigator.canShare && window.File) {
    const file = new File([blob], fileName, { type: "image/png" });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: t("shareTitle"), text });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
  }

  downloadBlob(blob, fileName);
}

function getShareFileName(kind) {
  const date = new Date(state.resultCompletedAt || Date.now());
  const dateLabel = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => index ? String(part).padStart(2, "0") : part).join("-");
  return `idolmaster-color-${shareImageKinds[kind].fileStem}-${dateLabel}.png`;
}

function resetShareButtons() {
  saveResultButton.disabled = false;
  saveResultButton.textContent = t("saveResult");
  wrongNoteShareButtons.forEach((button) => {
    button.disabled = false;
    button.textContent = t("wrongNoteShare");
  });
}

function openResultPreviewModal() {
  if (!resultPreview) return;

  window.clearTimeout(resultPreviewCloseTimer);
  resultPreview.hidden = false;
  document.body.classList.add("is-modal-open");
  requestAnimationFrame(() => {
    resultPreview.classList.add("is-open");
    resultPreviewActionButton?.focus({ preventScroll: true });
  });
}

function closeResultPreviewModal() {
  if (!resultPreview || resultPreview.hidden) return;

  resultPreview.classList.remove("is-open");
  if (!wrongNoteModal || wrongNoteModal.hidden) document.body.classList.remove("is-modal-open");
  resultPreviewCloseTimer = window.setTimeout(() => {
    resultPreview.hidden = true;
    const returnTarget = preparedShareTrigger?.isConnected && preparedShareTrigger.getClientRects().length
      ? preparedShareTrigger
      : saveResultButton;
    returnTarget?.focus({ preventScroll: true });
  }, 180);
}

function clearResultPreview() {
  window.clearTimeout(resultPreviewCloseTimer);
  resultPreviewImage.removeAttribute("src");
  if (preparedResultObjectUrl) {
    URL.revokeObjectURL(preparedResultObjectUrl);
    preparedResultObjectUrl = "";
  }
  preparedResultBlob = null;
  preparedResultFileName = "";
  resultPreview.classList.remove("is-open");
  resultPreview.hidden = true;
  if (resultPreviewActionButton) resultPreviewActionButton.disabled = false;
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
  stopQuestionTimer();
  state.questionStartedAt = null;
  state.answerRecords = [];
  resultImageRequestId += 1;
  hideWrongNoteModalImmediately();
  clearCorrectGlow();
  state.questions = [];
  state.index = 0;
  state.correct = 0;
  state.locked = false;
  state.currentAnswerFeedback = null;
  state.currentCombo = 0;
  state.wrongAnswers = [];
  state.resultSeries = [];
  state.resultCompletedAt = null;
  questionImageRequestId += 1;
  characterImage.onload = null;
  characterImage.onerror = null;
  updateComboBadge(false);
  nextButton.hidden = true;
  if (wrongNoteSection) wrongNoteSection.hidden = true;
  if (wrongNoteList) wrongNoteList.innerHTML = "";
  resetShareButtons();
  clearResultPreview();
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

function resolveFaceImagePath(idol) {
  const fileName = IDOL_IMAGE_FILES[idol.no] || idol.image;
  if (fileName.includes("/")) return `assets/idol-faces/${fileName}`;
  return `assets/idol-faces/${idol.series || inferMillionSeries(idol)}/${fileName}`;
}

function createFallbackHairColor(hsl) {
  return hslToHex(hsl.h + 24, clamp(hsl.s - 18, 16, 78), clamp(hsl.l - 14, 18, 72));
}

function initializeCustomSelection() {
  state.customSelectedIds = new Set();
}

function syncSeriesSelection(changedInput) {
  const allInput = document.querySelector("input[name='series'][value='all']");
  const customInput = document.querySelector("input[name='series'][value='custom']");
  const individualInputs = [...document.querySelectorAll("input[name='series']")]
    .filter((input) => input.value !== "all" && input.value !== "custom");

  if (changedInput.value === "custom" && changedInput.checked) {
    allInput.checked = false;
    individualInputs.forEach((input) => {
      input.checked = false;
    });
  } else if (changedInput.value === "all" && changedInput.checked) {
    if (customInput) customInput.checked = false;
    individualInputs.forEach((input) => {
      input.checked = false;
    });
  } else if (changedInput.value !== "all" && changedInput.value !== "custom") {
    allInput.checked = false;
    if (customInput) customInput.checked = false;
    if (individualInputs.every((input) => input.checked)) {
      individualInputs.forEach((input) => {
        input.checked = false;
      });
      allInput.checked = true;
    }
  }

  if (!customInput?.checked && !allInput.checked && !individualInputs.some((input) => input.checked)) {
    allInput.checked = true;
  }

  state.series = getSelectedSeriesValues();
}

function getSelectedSeriesValues() {
  const allInput = document.querySelector("input[name='series'][value='all']");
  const customInput = document.querySelector("input[name='series'][value='custom']");
  if (customInput?.checked) return ["custom"];
  if (allInput?.checked) return ["all"];
  const selected = [...document.querySelectorAll("input[name='series']:checked")]
    .map((input) => input.value)
    .filter((value) => value !== "all" && value !== "custom");
  return selected.length ? selected : ["all"];
}

function getActiveSeriesValues(values = getSelectedSeriesValues()) {
  if (values.includes("custom")) return getSeriesValuesFromIdols(getCustomPool());
  return values.includes("all") ? seriesOrder : values;
}

function getSeriesLabelFromValues(values = getSelectedSeriesValues()) {
  const activeSeries = getActiveSeriesValues(values);
  if (!activeSeries.length) return getSeriesLabel(values.includes("custom") ? "custom" : "all");
  if (values.includes("all") || activeSeries.length === seriesOrder.length) return getSeriesLabel("all");
  return activeSeries.map((value) => getSeriesLabel(value)).join(" + ");
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
  container.dataset.count = String(activeSeries.length);

  if (!activeSeries.length) {
    const empty = document.createElement("div");
    empty.className = `${itemClassName} series-summary-item is-empty`;
    empty.textContent = t("customEmpty");
    container.appendChild(empty);
    return;
  }

  if (itemClassName === "result-series-item") {
    for (let index = 0; index < activeSeries.length; index += 2) {
      const row = document.createElement("div");
      row.className = "result-series-row";
      activeSeries.slice(index, index + 2).forEach((series) => {
        row.appendChild(createSeriesSummaryItem(series, itemClassName));
      });
      container.appendChild(row);
    }
    return;
  }

  activeSeries.forEach((series) => {
    container.appendChild(createSeriesSummaryItem(series, itemClassName));
  });
}

function createSeriesSummaryItem(series, itemClassName) {
    const item = document.createElement("div");
    item.className = `${itemClassName} series-summary-item`;

    const iconBadge = createSeriesIconBadge(series);

    const name = document.createElement("span");
    name.className = itemClassName === "result-series-item" ? "result-series-name" : "pool-series-name";
    if (itemClassName === "result-series-item") renderSeriesOptionName(name, series);
    else name.textContent = getSeriesLabel(series);

    item.append(iconBadge, name);
    return item;
}

function getSeriesBadgeClass(series) {
  return {
    all: "all",
    allstars: "allstars",
    million: "millionstars",
    cinderella: "cinderella",
    shiny: "shinycolors",
    gakuen: "gakuen",
    sidem: "sidem"
  }[series] || series;
}

function createSeriesIconBadge(series, className = "") {
  const iconBadge = document.createElement("span");
  iconBadge.className = `series-logo-badge ${getSeriesBadgeClass(series)} ${className}`.trim();

  if (series === "all") {
    const mark = document.createElement("span");
    mark.className = "all-series-filter-mark";
    mark.setAttribute("aria-hidden", "true");
    iconBadge.appendChild(mark);
    return iconBadge;
  }

  const icon = document.createElement("img");
  icon.className = "series-icon-img";
  icon.src = seriesIcons[series];
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  iconBadge.appendChild(icon);
  return iconBadge;
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

function getDifficultyDescription(difficulty) {
  return getDictionary().difficultyDescriptions?.[difficulty] || translations.ko.difficultyDescriptions?.[difficulty] || "";
}

function getCustomPool() {
  return enrichedIdols.filter((idol) => state.customSelectedIds.has(idol.no));
}

function getSeriesValuesFromIdols(idols) {
  const presentSeries = new Set(idols.map((idol) => idol.series));
  return seriesOrder.filter((series) => presentSeries.has(series));
}

function getCustomVisibleIdols(filter = getValidCustomSeriesFilter(), query = getNormalizedCustomSearchQuery()) {
  const seriesIdols = customIdolsBySeries.get(filter) || customIdolsBySeries.get("all");
  if (!query.normalized) return seriesIdols;
  return seriesIdols.filter((idol) => doesIdolMatchCustomSearch(idol, query));
}

function renderCustomPanel() {
  if (!customPanel || !customIdolGrid || !customSeriesFilters) return;

  const isActive = getSelectedSeriesValues().includes("custom");
  customPanel.hidden = !isActive;
  if (!isActive) {
    cancelScheduledCustomIdolGridRender();
    return;
  }

  state.customSeriesFilter = getValidCustomSeriesFilter();
  if (customSearchInput && customSearchInput.value !== state.customSearchQuery) {
    customSearchInput.value = state.customSearchQuery;
  }
  renderCustomSeriesFilters();
  updateCustomSelectedCount();
  renderCustomIdolGrid();
}

function renderCustomSeriesFilters() {
  if (!customFilterButtonCache.size) {
    customSeriesFilters.innerHTML = "";

    customFilterValues.forEach((series) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "custom-filter-chip";
      button.appendChild(createSeriesIconBadge(series, "custom-filter-icon"));

      button.addEventListener("click", () => {
        if (state.customSeriesFilter === series) return;
        state.customSeriesFilter = series;
        cancelScheduledCustomIdolGridRender();
        renderCustomSeriesFilters();
        renderCustomIdolGrid();
      });

      customFilterButtonCache.set(series, button);
      customSeriesFilters.appendChild(button);
    });
  } else {
    customFilterValues.forEach((series) => {
      const button = customFilterButtonCache.get(series);
      if (button && button.parentElement !== customSeriesFilters) {
        customSeriesFilters.appendChild(button);
      }
    });
  }

  customFilterValues.forEach((series) => {
    const button = customFilterButtonCache.get(series);
    if (!button) return;

    const isSelected = state.customSeriesFilter === series;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
    button.setAttribute("aria-label", getSeriesLabel(series));
    button.title = getSeriesLabel(series);
  });
}

function getValidCustomSeriesFilter() {
  return customFilterValues.includes(state.customSeriesFilter)
    ? state.customSeriesFilter
    : seriesOrder[0];
}

function renderCustomIdolGrid() {
  const filter = getValidCustomSeriesFilter();
  const query = getNormalizedCustomSearchQuery();
  const searchQuery = query.normalized;
  const visibleIdols = getCustomVisibleIdols(filter, query);

  if (customRenderedSeriesFilter !== filter || customRenderedSearchQuery !== searchQuery) {
    const fragment = document.createDocumentFragment();
    if (visibleIdols.length) {
      visibleIdols.forEach((idol) => {
        fragment.appendChild(getCustomIdolCard(idol));
      });
      customIdolGrid.classList.remove("is-empty");
    } else {
      const empty = document.createElement("div");
      empty.className = "custom-empty-state";
      empty.textContent = t("customSearchEmpty");
      fragment.appendChild(empty);
      customIdolGrid.classList.add("is-empty");
    }
    customIdolGrid.replaceChildren(fragment);
    customIdolGrid.scrollTop = 0;
    customRenderedSeriesFilter = filter;
    customRenderedSearchQuery = searchQuery;
  }

  if (customSearchClearButton) customSearchClearButton.hidden = !searchQuery;
  visibleIdols.forEach((idol) => updateCustomIdolCard(getCustomIdolCard(idol), idol));
}

function scheduleCustomIdolGridRender() {
  if (!customPanel || customPanel.hidden) return;
  if (customGridRenderFrame) cancelAnimationFrame(customGridRenderFrame);
  customGridRenderFrame = requestAnimationFrame(() => {
    customGridRenderFrame = 0;
    renderCustomIdolGrid();
  });
}

function cancelScheduledCustomIdolGridRender() {
  if (!customGridRenderFrame) return;
  cancelAnimationFrame(customGridRenderFrame);
  customGridRenderFrame = 0;
}

function getNormalizedCustomSearchQuery() {
  return parseIdolSearchQuery(state.customSearchQuery);
}

function doesIdolMatchCustomSearch(idol, query) {
  return matchesSearchQuery(getCustomSearchHaystack(idol), query);
}

function getCustomSearchHaystack(idol) {
  idol.customSearchHaystack ||= createSearchHaystack([
    idol.name,
    idol.jpName,
    idol.enName,
    idol.englishName,
    idol.slug,
    idol.unit,
    idol.unitKo,
    idol.group,
    idol.attribute,
    idol.hex,
    idol.series === "sidem" ? sidemJapaneseUnitLabels[idol.unit] : "",
    ...Object.values(translations).flatMap((dictionary) => [
      dictionary.seriesLabels?.[idol.series],
      dictionary.attributeLabels?.[idol.attribute]
    ]),
    ...getRomajiAliases(getIdolImageBaseName(idol))
  ]);
  return idol.customSearchHaystack;
}

function getIdolImageBaseName(idol) {
  const fileName = IDOL_IMAGE_FILES[idol.no] || idol.image || "";
  return fileName.split("/").pop().replace(/\.[^.]+$/, "");
}

function getCustomIdolCard(idol) {
  const cacheKey = String(idol.no);
  const cachedCard = customIdolCardCache.get(cacheKey);
  if (cachedCard) return cachedCard;

  const card = document.createElement("button");
  card.type = "button";
  card.className = "custom-idol-card";
  card.dataset.no = cacheKey;

  const avatar = document.createElement("span");
  avatar.className = "custom-idol-avatar";

  const image = document.createElement("img");
  image.src = idol.faceImage;
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  image.setAttribute("aria-hidden", "true");
  avatar.appendChild(image);

  const check = document.createElement("span");
  check.className = "custom-idol-check";
  check.setAttribute("aria-hidden", "true");
  check.textContent = "✓";
  avatar.appendChild(check);

  const name = document.createElement("span");
  name.className = "custom-idol-name";

  card.append(avatar, name);
  card.addEventListener("click", () => toggleCustomIdol(idol.no));
  customIdolCardCache.set(cacheKey, card);
  updateCustomIdolCard(card, idol);
  return card;
}

function updateCustomIdolCard(card, idol) {
  const isSelected = state.customSelectedIds.has(idol.no);
  const displayName = getIdolDisplayName(idol);
  card.classList.toggle("is-selected", isSelected);
  card.setAttribute("aria-pressed", String(isSelected));
  card.setAttribute("aria-label", displayName);
  card.title = displayName;
  card.querySelector(".custom-idol-name").textContent = displayName;
}

function updateVisibleCustomIdolCards() {
  getCustomVisibleIdols().forEach((idol) => {
    const card = customIdolCardCache.get(String(idol.no));
    if (card) updateCustomIdolCard(card, idol);
  });
}

function updateCustomSelectedCount() {
  if (!customSelectedCount) return;
  customSelectedCount.textContent = t("customSelectedCount", state.customSelectedIds.size, enrichedIdols.length);
}

function toggleCustomIdol(no) {
  if (state.customSelectedIds.has(no)) {
    state.customSelectedIds.delete(no);
  } else {
    state.customSelectedIds.add(no);
  }

  const card = customIdolCardCache.get(String(no));
  const idol = enrichedIdolByNo.get(no);
  if (card && idol) updateCustomIdolCard(card, idol);
  refreshCustomSelectionState();
}

function setCustomSelectionForVisibleIdols(isSelected) {
  getCustomVisibleIdols().forEach((idol) => {
    if (isSelected) {
      state.customSelectedIds.add(idol.no);
    } else {
      state.customSelectedIds.delete(idol.no);
    }
  });

  refreshCustomSelectionState();
}

function clearCustomSelection() {
  state.customSelectedIds.clear();
  refreshCustomSelectionState();
}

function refreshCustomSelectionState() {
  syncQuestionCountWithPool();
  updatePresetSelection();
  updateStartSummary();
  updateCustomSelectedCount();
  updateVisibleCustomIdolCards();
}

function getPool() {
  if (getSelectedSeriesValues().includes("custom")) return getCustomPool();
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
  startButton.disabled = poolSize <= 0;
  syncSeriesOptionLabels();
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
  if (poolSize <= 0) return 0;
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
  if (poolSize <= 0) {
    questionCountInput.value = "0";
    return;
  }
  questionCountInput.value = String(clamp(requestedCount, 1, poolSize));
}

function getRequestedQuestionCount(poolSize = getPool().length) {
  const requestedCount = Number(state.requestedQuestionCount);
  if (Number.isFinite(requestedCount)) return Math.trunc(requestedCount);
  return getQuestionCountValue(poolSize);
}

function updatePresetSelection() {
  const poolSize = getPool().length;
  // A short pool changes the displayed preset, not the user's requested count.
  const presetFallsBackToAll = state.countMode === "preset" && state.requestedQuestionCount > poolSize;
  document.querySelectorAll(".count-preset").forEach((button) => {
    const matches = button.dataset.count === "all"
      ? state.countMode === "all" || presetFallsBackToAll
      : state.countMode === "preset" && !presetFallsBackToAll && Number(button.dataset.count) === state.requestedQuestionCount;
    button.classList.toggle("is-selected", matches);
    button.setAttribute("aria-pressed", String(matches));
  });

  questionCountField?.classList.toggle("is-manual", state.countMode === "manual");
  questionCountInput.setAttribute("aria-current", state.countMode === "manual" ? "true" : "false");
}

function setQuestionImage(question) {
  const requestId = ++questionImageRequestId;
  imageFrame.classList.remove("is-missing");
  imageFrame.classList.add("is-loading");
  imageFrame.setAttribute("aria-busy", "true");
  imageFallback.style.background = makeFallbackBackground(question.hex);
  updateQuestionImageText(question);
  const ready = (missing) => {
    if (requestId !== questionImageRequestId) return;
    imageFrame.classList.toggle("is-missing", missing);
    imageFrame.classList.remove("is-loading");
    imageFrame.setAttribute("aria-busy", "false");
    startQuestionTimer(question);
  };
  characterImage.onload = () => ready(false);
  characterImage.onerror = () => ready(true);
  characterImage.src = question.image;
  if (characterImage.complete) ready(!characterImage.naturalWidth);
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
  const explicitName = idol.enName || idol.englishName;
  if (explicitName) return explicitName;

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

function makeFallbackBackground(hex) {
  const { h, s, l } = hexToHsl(hex);
  const darker = hslToHex(h, clamp(s + 8, 15, 95), clamp(l - 18, 16, 58));
  const lighter = hslToHex(h + 18, clamp(s + 4, 18, 95), clamp(l + 12, 42, 82));
  return `linear-gradient(145deg, ${lighter}, ${hex} 48%, ${darker})`;
}

function getScorePercent(score, maxScore) {
  if (!maxScore) return 0;
  return (score / maxScore) * 100;
}

function getResultMessage(percent) {
  return percent >= 80 ? getDictionary().resultMessages.perfect : "";
}
