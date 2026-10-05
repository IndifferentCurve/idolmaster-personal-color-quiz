"use strict";

// Presentation-only flourishes layered on top of script.js: hero numbers,
// the drifting swatch ribbon and number-key color picks. Game state is never changed here.
(() => {
  const heroStats = document.getElementById("heroStats");
  const ribbonTrack = document.querySelector("#swatchRibbon .swatch-ribbon-track");
  const ribbonIdols = shuffle(enrichedIdols).slice(0, 26);

  const statValues = {
    idols: enrichedIdols.length,
    series: seriesOrder.length,
    levels: Object.keys(difficultyTiming).length
  };
  heroStats?.querySelectorAll("[data-stat]").forEach((element) => {
    const value = statValues[element.dataset.stat];
    if (value !== undefined) element.textContent = String(value);
  });

  // Chips open the same illustration dialog as the color guide.
  // The second, loop-only copy stays out of the tab order and the accessibility tree.
  function createRibbonChip(idol, isLoopCopy = false) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "ribbon-chip";
    chip.setAttribute("aria-haspopup", "dialog");
    chip.setAttribute("aria-label", t("guideViewIdol", getIdolDisplayName(idol)));
    if (isLoopCopy) {
      chip.tabIndex = -1;
      chip.setAttribute("aria-hidden", "true");
    }
    chip.addEventListener("click", () => window.IdolmasterColorGuide?.openIllustration(idol, chip));
    const color = document.createElement("span");
    color.className = "ribbon-chip-color";
    color.style.backgroundColor = idol.hex;
    const meta = document.createElement("span");
    meta.className = "ribbon-chip-meta";
    const name = document.createElement("b");
    name.textContent = getIdolDisplayName(idol);
    const hex = document.createElement("code");
    hex.textContent = formatHex(idol.hex);
    meta.append(name, hex);
    chip.append(color, meta);
    return chip;
  }

  function renderRibbon() {
    if (!ribbonTrack) return;
    // The list is rendered twice so the -50% marquee loop has no seam.
    ribbonTrack.replaceChildren(
      ...ribbonIdols.map((idol) => createRibbonChip(idol)),
      ...ribbonIdols.map((idol) => createRibbonChip(idol, true))
    );
  }

  renderRibbon();
  // applyLanguage() always rewrites <html lang>, so it doubles as a language-change signal.
  new MutationObserver(renderRibbon).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (!screens.quiz.classList.contains("is-active") || getOpenModal()) return;
    if (event.target instanceof Element && event.target.closest("input, textarea, select")) return;
    if (!/^[1-9]$/.test(event.key)) return;
    const choice = swatches.children[Number(event.key) - 1];
    if (!choice || choice.disabled) return;
    event.preventDefault();
    choice.click();
  });
})();
