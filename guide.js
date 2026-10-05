"use strict";

// The guide reads the canonical quiz data, but never changes quiz selections or scores.
window.IdolmasterColorGuide = (() => {
  const screen = document.getElementById("guideScreen");
  const entry = document.getElementById("guideOpenButton");
  const back = document.getElementById("guideBackButton");
  const title = document.getElementById("guideTitle");
  const filters = document.getElementById("guideFilters");
  const search = document.getElementById("guideSearchInput");
  const clear = document.getElementById("guideSearchClearButton");
  const seriesTitle = document.getElementById("guideSeriesTitle");
  const count = document.getElementById("guideCount");
  const grid = document.getElementById("guideGrid");
  const empty = document.getElementById("guideEmpty");
  const status = document.getElementById("guideStatus");
  const sourceLabel = document.getElementById("guideHexSourceLabel");
  const dialog = document.getElementById("guideImageModal");
  const dialogClose = document.getElementById("guideImageCloseButton");
  const dialogTitle = document.getElementById("guideImageTitle");
  const dialogMeta = document.getElementById("guideImageMeta");
  const dialogImage = document.getElementById("guideFullImage");
  const dialogStage = document.getElementById("guideImageStage");
  const dialogStatus = document.getElementById("guideImageStatus");
  const dialogSwatch = document.getElementById("guideImageSwatch");
  const dialogCopy = document.getElementById("guideImageCopyButton");
  const dialogCopyStatus = document.getElementById("guideImageCopyStatus");
  const cards = new Map();
  const filterButtons = new Map();
  let selectedSeries = "all";
  let renderFrame = 0;
  let copyTimer = 0;
  let copiedButton = null;
  let copyRequest = 0;
  let renderedKey = "";
  let previewIdol = null;
  let previewTrigger = null;
  let imageRequest = 0;
  let dialogCloseTimer = 0;
  let inertScreen = null;

  ["all", ...seriesOrder].forEach((series) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "custom-filter-chip";
    button.dataset.series = series;
    button.appendChild(createSeriesIconBadge(series, "custom-filter-icon"));
    button.addEventListener("click", () => {
      if (selectedSeries === series) return;
      selectedSeries = series;
      render();
    });
    filterButtons.set(series, button);
    filters.appendChild(button);
  });

  entry.addEventListener("click", () => {
    showScreen("guide");
    render();
    title.focus({ preventScroll: true });
  });
  back.addEventListener("click", () => {
    cancelAnimationFrame(renderFrame);
    renderFrame = 0;
    resetCopyFeedback();
    showScreen("start");
    entry.focus({ preventScroll: true });
  });
  search.addEventListener("input", () => {
    cancelAnimationFrame(renderFrame);
    renderFrame = requestAnimationFrame(() => {
      renderFrame = 0;
      render();
    });
  });
  clear.addEventListener("click", () => {
    search.value = "";
    render();
    search.focus({ preventScroll: true });
  });
  grid.addEventListener("click", (event) => {
    const opener = event.target.closest(".guide-idol-open");
    if (opener && grid.contains(opener)) {
      openIllustration(enrichedIdolByNo.get(Number(opener.dataset.no)), opener);
      return;
    }
    const button = event.target.closest(".guide-copy");
    if (button && grid.contains(button)) copyColor(button);
  });
  dialogCopy.addEventListener("click", () => copyColor(dialogCopy));
  dialogClose.addEventListener("click", closeIllustration);
  document.getElementById("guideImageBackdrop").addEventListener("click", closeIllustration);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialog.hidden) {
      event.preventDefault();
      closeIllustration();
    }
  });

  function localizeIllustration() {
    if (!previewIdol) return;
    const name = getIdolDisplayName(previewIdol);
    dialogTitle.textContent = name;
    dialogMeta.textContent = getQuestionMetaText(previewIdol);
    dialogImage.alt = t("illustrationAlt", name);
    dialogClose.setAttribute("aria-label", t("wrongNoteClose"));
    dialogClose.title = t("wrongNoteClose");
    dialogCopy.setAttribute("aria-label", t("guideCopy", name, dialogCopy.dataset.hex));
    dialogCopy.title = dialogCopy.getAttribute("aria-label");
    dialogStatus.textContent = dialogStage.classList.contains("is-error")
      ? t("guideImageError") : t("guideImageLoading");
  }

  function openIllustration(idol, trigger) {
    if (!idol) return;
    clearTimeout(dialogCloseTimer);
    resetCopyFeedback();
    previewIdol = idol;
    previewTrigger = trigger;
    const request = ++imageRequest;
    dialogImage.hidden = true;
    dialogStatus.hidden = false;
    dialogStage.classList.remove("is-error");
    dialogStage.setAttribute("aria-busy", "true");
    dialogSwatch.style.backgroundColor = idol.hex;
    dialogCopy.dataset.hex = formatHex(idol.hex);
    dialogCopy.querySelector("code").textContent = dialogCopy.dataset.hex;
    localizeIllustration();
    dialog.hidden = false;
    document.body.classList.add("is-modal-open");
    dialogClose.focus({ preventScroll: true });
    // The dialog also opens from the result screen, so freeze whichever screen is showing.
    inertScreen = document.querySelector(".screen.is-active");
    if (inertScreen) inertScreen.inert = true;
    requestAnimationFrame(() => {
      if (request === imageRequest) dialog.classList.add("is-open");
    });
    // Full illustrations are requested only on demand; thumbnails keep their lazy loading.
    dialogImage.onload = () => {
      if (request !== imageRequest) return;
      dialogImage.hidden = false;
      dialogStatus.hidden = true;
      dialogStage.setAttribute("aria-busy", "false");
    };
    dialogImage.onerror = () => {
      if (request !== imageRequest) return;
      dialogStage.classList.add("is-error");
      dialogStage.setAttribute("aria-busy", "false");
      dialogStatus.textContent = t("guideImageError");
    };
    dialogImage.src = idol.image;
  }

  function closeIllustration() {
    if (dialog.hidden || !previewIdol) return;
    ++imageRequest;
    previewIdol = null;
    resetCopyFeedback();
    dialog.classList.remove("is-open");
    dialogImage.onload = null;
    dialogImage.onerror = null;
    dialogCloseTimer = window.setTimeout(() => {
      dialog.hidden = true;
      dialogImage.removeAttribute("src");
      // Keep the page locked when the dialog sat on top of another open dialog.
      if (!document.querySelector("#wrongNoteModal:not([hidden]), #resultPreview:not([hidden])")) {
        document.body.classList.remove("is-modal-open");
      }
      if (inertScreen) inertScreen.inert = false;
      inertScreen = null;
      const target = previewTrigger?.isConnected ? previewTrigger : search;
      target.focus({ preventScroll: true });
      previewTrigger = null;
    }, 180);
  }

  function resetCopyFeedback() {
    copyRequest += 1;
    clearTimeout(copyTimer);
    copyTimer = 0;
    if (copiedButton) {
      copiedButton.classList.remove("is-copied");
      copiedButton.title = copiedButton.getAttribute("aria-label");
      copiedButton = null;
    }
    status.textContent = "";
    dialogCopyStatus.textContent = "";
  }

  async function copyColor(button) {
    resetCopyFeedback();
    const request = copyRequest;
    const hex = button.dataset.hex;
    const copyStatus = button === dialogCopy ? dialogCopyStatus : status;
    const isStale = () => request !== copyRequest
      || (button === dialogCopy ? dialog.hidden : !screen.classList.contains("is-active"));
    try {
      await navigator.clipboard.writeText(hex);
      if (isStale()) return;
      copiedButton = button;
      button.classList.add("is-copied");
      button.title = t("guideCopied", hex);
      copyStatus.textContent = t("guideCopied", hex);
      copyTimer = window.setTimeout(resetCopyFeedback, 1800);
    } catch (error) {
      if (isStale()) return;
      const range = document.createRange();
      range.selectNodeContents(button.querySelector("code"));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyStatus.textContent = t("guideCopyFailed");
    }
  }

  function createCard(idol) {
    const card = document.createElement("li");
    card.className = "guide-card";
    card.dataset.no = idol.no;
    const header = document.createElement("button");
    header.type = "button";
    header.className = "guide-card-heading guide-idol-open";
    header.dataset.no = idol.no;
    const avatar = document.createElement("span");
    avatar.className = "guide-avatar";
    avatar.setAttribute("aria-hidden", "true");
    const image = document.createElement("img");
    image.src = idol.faceImage;
    image.alt = "";
    image.width = 64;
    image.height = 64;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      image.hidden = true;
      avatar.classList.add("is-missing");
    }, { once: true });
    avatar.appendChild(image);
    const identity = document.createElement("span");
    identity.className = "guide-identity";
    const name = document.createElement("strong");
    name.className = "guide-idol-name";
    const meta = document.createElement("span");
    meta.className = "guide-idol-meta";
    const series = document.createElement("span");
    series.className = "guide-card-series";
    identity.append(name, meta, series);
    header.append(avatar, identity);
    const color = document.createElement("div");
    color.className = "guide-color";
    color.style.backgroundColor = idol.hex;
    color.setAttribute("aria-hidden", "true");
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "guide-copy";
    copy.dataset.hex = formatHex(idol.hex);
    const code = document.createElement("code");
    code.textContent = copy.dataset.hex;
    copy.appendChild(code);
    card.append(header, color, copy);
    return { card, header, avatar, name, meta, series, copy };
  }

  function localizeCard(parts, idol) {
    if (parts.language === state.language) return;
    const name = getIdolDisplayName(idol);
    parts.name.textContent = name;
    parts.header.setAttribute("aria-label", t("guideViewIdol", name));
    parts.header.title = t("guideViewIdol", name);
    parts.header.setAttribute("aria-haspopup", "dialog");
    parts.meta.textContent = getQuestionMetaText(idol);
    parts.series.textContent = getSeriesLabel(idol.series);
    parts.avatar.dataset.initial = [...name][0];
    parts.copy.setAttribute("aria-label", t("guideCopy", name, parts.copy.dataset.hex));
    parts.copy.title = parts.copy.getAttribute("aria-label");
    parts.language = state.language;
  }

  function render() {
    if (!screen.classList.contains("is-active")) return;
    const query = parseIdolSearchQuery(search.value);
    const key = `${selectedSeries}|${query.normalized}|${state.language}`;
    clear.hidden = search.value.length === 0;
    if (key === renderedKey) return;
    resetCopyFeedback();
    const idols = getCustomVisibleIdols(selectedSeries, query);
    const fragment = document.createDocumentFragment();
    idols.forEach((idol) => {
      if (!cards.has(idol.no)) cards.set(idol.no, createCard(idol));
      const parts = cards.get(idol.no);
      localizeCard(parts, idol);
      fragment.appendChild(parts.card);
    });
    grid.replaceChildren(fragment);
    grid.hidden = idols.length === 0;
    empty.hidden = idols.length !== 0;
    seriesTitle.textContent = getSeriesLabel(selectedSeries);
    count.textContent = t("guideCount", idols.length);
    filterButtons.forEach((button, series) => {
      button.classList.toggle("is-selected", selectedSeries === series);
      button.setAttribute("aria-pressed", String(selectedSeries === series));
    });
    renderedKey = key;
  }

  function refresh() {
    resetCopyFeedback();
    entry.textContent = t("guideEntry");
    back.textContent = t("guideBack");
    title.textContent = t("guideTitle");
    sourceLabel.textContent = t("guideHexSource");
    localizeIllustration();
    filters.setAttribute("aria-label", t("guideFilters"));
    search.placeholder = t("customSearchPlaceholder");
    search.setAttribute("aria-label", t("customSearchPlaceholder"));
    clear.setAttribute("aria-label", t("customSearchClear"));
    empty.textContent = t("customSearchEmpty");
    filterButtons.forEach((button, series) => {
      button.title = getSeriesLabel(series);
      button.setAttribute("aria-label", getSeriesLabel(series));
    });
    render();
  }

  refresh();
  return { refresh, openIllustration, getOpenDialog: () => dialog.hidden ? null : dialog };
})();
