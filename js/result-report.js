"use strict";

/*
  js/result-report.js
  Renders the on-screen color report and draws the shareable PNG version of it.
  Screen and export share the same completed-game record, never a new sample.
*/
window.IdolmasterResultReport = (() => {
  // Large games can miss hundreds; past this many rows the image gets a "N more" line instead.
  const WRONG_NOTE_CANVAS_LIMIT = 30;
  const spectrumStops = ["#f34f6d", "#f39800", "#ffc30b", "#0fbe94", "#2681c8", "#7ac7ff", "#ff7db7", "#f34f6d"];

  // ───── Canvas drawing helpers (private to the export) ─────
  const appFontStack = "'Quiz Sans', 'Noto Sans KR', 'Noto Sans JP', 'Segoe UI', sans-serif";

  const repositoryLabel = "IndifferentCurve/idolmaster-personal-color-quiz";

  const githubMarkPath = "M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.36 6.84 9.72.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 12 6.96c.85 0 1.71.12 2.51.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.71 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.58.69.48A10.2 10.2 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z";

  function drawCanvasRepository(ctx, label, centerX, baselineY, colors) {
    const iconSize = 20;
    const gap = 8;
    ctx.save();
    ctx.font = `450 18px ${appFontStack}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const textWidth = ctx.measureText(label).width;
    const startX = centerX - (iconSize + gap + textWidth) / 2;
    const iconY = baselineY - iconSize + 3;

    ctx.fillStyle = colors.muted;
    if (typeof Path2D !== "undefined") {
      const iconPath = new Path2D(githubMarkPath);
      ctx.save();
      ctx.translate(startX, iconY);
      ctx.scale(iconSize / 24, iconSize / 24);
      ctx.fill(iconPath);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(startX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillText(label, startX + iconSize + gap, baselineY);
    ctx.restore();
  }

  function drawSeriesCanvasBadge(ctx, x, y, width, height, series, iconImage) {
    const colors = getSeriesCanvasColors(series);
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, colors.from);
    gradient.addColorStop(1, colors.to);

    drawRoundRect(ctx, x, y, width, height, 6, gradient);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.34)";
    ctx.lineWidth = 1;
    strokeRoundRect(ctx, x + 0.5, y + 0.5, width - 1, height - 1, 6);
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

  function getRecord() {
    const answers = state.questions.map((idol, index) => {
      const answer = state.answerRecords[index];
      return {
        idol, index: index + 1, name: getIdolDisplayName(idol), hex: formatHex(idol.hex),
        correct: Boolean(answer?.isCorrect),
        outcome: t(answer?.timedOut ? "answerTimeout" : answer?.isCorrect ? "answerCorrect" : "answerWrong"),
        responseTime: formatResponseTime((answer?.elapsedMs || 0) / 1000)
      };
    });
    const score = getRunScore();
    const maxScore = getTimingRules().maxScore;
    const date = new Date(state.resultCompletedAt || Date.now());
    const pad = (number) => String(number).padStart(2, "0");
    const picks = answers.slice(0, 4);
    return {
      answers, palette: answers.slice(0, 10), picks,
      lineupRemainder: answers.length > picks.length ? t("reportMoreIdols", answers.length - picks.length) : "",
      total: answers.length, correct: state.correct,
      score: String(score), maxScore,
      averageTime: formatResponseTime(getAverageResponseSeconds()),
      message: getResultMessage(getScorePercent(score, maxScore)),
      difficulty: getDifficultyLabel(state.difficulty),
      series: state.resultSeries.length ? [...state.resultSeries] : getActiveSeriesValues(state.series),
      date: `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`,
      time: `${pad(date.getHours())}:${pad(date.getMinutes())}`, iso: date.toISOString()
    };
  }

  function render() {
    const record = getRecord();
    setText("#reportTitle", t("reportTitle"));
    setText("#reportDate", record.date);
    const date = document.getElementById("reportDate");
    date.dateTime = record.iso;
    date.title = `${t("reportRecorded")} ${record.date} ${record.time}`;
    setText("#reportPaletteTitle", t("reportPalette"));
    setText("#reportLineupTitle", t("reportLineup"));
    setText("#reportPaletteRange", t("reportRange", record.palette.length, record.total));
    setText("#reportLineupRange", record.lineupRemainder);
    document.getElementById("reportLineupRange").hidden = !record.lineupRemainder;

    const palette = document.getElementById("reportPalette");
    palette.style.setProperty("--palette-desktop-columns", Math.max(1, record.palette.length));
    palette.style.setProperty("--palette-mobile-columns", record.palette.length > 5 ? Math.ceil(record.palette.length / 2) : Math.max(1, record.palette.length));
    palette.replaceChildren(...record.palette.map((answer) => {
      const item = document.createElement("li");
      item.className = `report-token${answer.correct ? "" : " is-missed"}`;
      item.setAttribute("aria-label", t("reportAnswerLabel", answer.index, answer.name, answer.hex, answer.outcome));
      item.title = item.getAttribute("aria-label");
      const swatch = document.createElement("span");
      swatch.className = "report-token-color";
      swatch.style.backgroundColor = answer.hex;
      const label = document.createElement("span");
      label.className = "report-token-label";
      label.textContent = String(answer.index).padStart(2, "0");
      const mark = document.createElement("span");
      mark.className = "report-answer-mark";
      label.appendChild(mark);
      item.append(swatch, label);
      [...item.children].forEach((child) => child.setAttribute("aria-hidden", "true"));
      return item;
    }));

    document.getElementById("reportPicks").replaceChildren(...record.picks.map((answer) => {
      const item = document.createElement("li");
      item.className = `report-pick${answer.correct ? "" : " is-missed"}`;
      const number = document.createElement("span");
      number.className = "report-pick-number";
      number.textContent = String(answer.index).padStart(2, "0");
      const avatar = document.createElement("span");
      avatar.className = "report-pick-avatar";
      avatar.style.setProperty("--pick-color", answer.hex);
      const image = document.createElement("img");
      image.src = answer.idol.faceImage;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => { image.hidden = true; }, { once: true });
      avatar.appendChild(image);
      const body = document.createElement("div");
      body.className = "report-pick-body";
      const name = document.createElement("strong");
      name.textContent = answer.name;
      const meta = document.createElement("div");
      meta.className = "report-pick-meta";
      const hex = document.createElement("code");
      hex.textContent = answer.hex;
      const status = document.createElement("span");
      status.className = "report-pick-status";
      status.textContent = answer.outcome;
      const time = document.createElement("span");
      time.textContent = answer.responseTime;
      meta.append(hex, status, time);
      body.append(name, meta);
      const swatch = document.createElement("span");
      swatch.className = "report-pick-color";
      swatch.style.backgroundColor = answer.hex;
      swatch.setAttribute("aria-hidden", "true");
      item.append(number, avatar, body, swatch);
      return item;
    }));
  }

  // Theme tokens shared by both exports, so the images follow light or dark mode.
  function getCanvasColors() {
    const tokens = getComputedStyle(document.querySelector(".result-report"));
    const colors = Object.fromEntries(["paper", "ink", "muted", "rule", "accent", "wash"].map(key => [key, tokens.getPropertyValue(`--report-${key}`).trim()]));
    colors.text = colors.ink;
    const rootTokens = getComputedStyle(document.documentElement);
    colors.bg = rootTokens.getPropertyValue("--page-bg").trim();
    colors.positive = rootTokens.getPropertyValue("--positive").trim() || colors.ink;
    return colors;
  }

  // Rounded paper card with the same spectrum band as the on-screen report.
  function drawPaperCard(ctx, width, height, colors) {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.shadowColor = "rgba(17, 17, 20, 0.14)";
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 10;
    drawRoundRect(ctx, 32, 32, width - 64, height - 64, 40, colors.paper);
    ctx.restore();
    ctx.save();
    addRoundRectPath(ctx, 32, 32, width - 64, height - 64, 40);
    ctx.clip();
    const band = ctx.createLinearGradient(32, 0, width - 32, 0);
    spectrumStops.forEach((color, index) => band.addColorStop(index / (spectrumStops.length - 1), color));
    ctx.fillStyle = band;
    ctx.fillRect(32, 32, width - 64, 8);
    ctx.restore();
    ctx.strokeStyle = colors.rule;
    ctx.lineWidth = 1;
    strokeRoundRect(ctx, 32.5, 32.5, width - 65, height - 65, 40);
  }

  // A shareable list of every missed question: each miss is a card that sets
  // my pick against the real image color in one split chip.
  async function createWrongNoteCanvas() {
    const record = getRecord();
    const misses = state.wrongAnswers;
    const shown = misses.slice(0, WRONG_NOTE_CANVAS_LIMIT);
    const remainder = misses.length - shown.length;
    const colors = getCanvasColors();
    const names = shown.map((item) => getIdolDisplayName(item.idol));
    const labels = {
      title: t("wrongNoteTitle"),
      summary: `${t("correctSummary", record.correct, record.total)} · ${record.difficulty} · ${record.date}`,
      picked: t("wrongSelected"),
      answer: t("wrongAnswer"),
      timeout: t("answerTimeout"),
      more: remainder > 0 ? t("reportMoreIdols", remainder) : "",
      footer: t("canvasFooter")
    };
    if (document.fonts?.ready) await document.fonts.ready;
    if (document.fonts?.load) {
      await document.fonts.load(`700 28px ${appFontStack}`, [...Object.values(labels), ...names].join(" "));
    }
    const portraits = await Promise.all(shown.map((item) => loadImage(item.idol.faceImage)));

    const width = 1080, left = 80, right = width - 80;
    const listTop = 268, cardHeight = 132, cardGap = 14;
    const listHeight = shown.length * cardHeight + Math.max(0, shown.length - 1) * cardGap;
    const moreHeight = labels.more ? 68 : 0;
    const footerTop = listTop + listHeight + moreHeight + 40;
    const height = footerTop + 140;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawPaperCard(ctx, width, height, colors);

    const text = (value, x, y, size, weight, color = colors.ink, align = "left") => {
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = "alphabetic";
      ctx.font = `${weight} ${size}px ${appFontStack}`;
      ctx.fillText(String(value), x, y);
    };
    const rule = (y) => {
      ctx.save();
      ctx.strokeStyle = colors.rule;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
      ctx.restore();
    };

    // Header: title on the left, the miss count as the headline number on the right.
    text("THE IDOLM@STER", left, 100, 18, 750, colors.muted);
    text(labels.title, left, 160, 46, 800);
    text(labels.summary, left, 206, 21, 550, colors.muted);
    text(String(misses.length), right, 176, 84, 800, colors.accent, "right");
    text("MISSED", right, 210, 15, 800, colors.muted, "right");
    rule(236);

    // The comparison chip: left half is my pick, right half the answer, an arrow between.
    const chipWidth = 300, chipHeight = 56;
    const drawComparison = (x, y, item) => {
      const half = chipWidth / 2;
      ctx.save();
      addRoundRectPath(ctx, x, y, chipWidth, chipHeight, 16);
      ctx.clip();
      ctx.fillStyle = item.timedOut ? colors.paper : item.selectedHex;
      ctx.fillRect(x, y, half, chipHeight);
      ctx.fillStyle = item.answerHex;
      ctx.fillRect(x + half, y, half, chipHeight);
      ctx.restore();
      if (item.timedOut) {
        ctx.save();
        ctx.strokeStyle = colors.accent; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(x + half, y + 1); ctx.lineTo(x + 16, y + 1);
        ctx.quadraticCurveTo(x + 1, y + 1, x + 1, y + 16); ctx.lineTo(x + 1, y + chipHeight - 16);
        ctx.quadraticCurveTo(x + 1, y + chipHeight - 1, x + 16, y + chipHeight - 1); ctx.lineTo(x + half, y + chipHeight - 1);
        ctx.stroke();
        ctx.restore();
        text(labels.timeout, x + half / 2 - 8, y + chipHeight / 2 + 6, 16, 750, colors.accent, "center");
      }
      ctx.strokeStyle = colors.rule; ctx.lineWidth = 1;
      strokeRoundRect(ctx, x + 0.5, y + 0.5, chipWidth - 1, chipHeight - 1, 16);

      const cx = x + half, cy = y + chipHeight / 2;
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.18)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 17, 0, Math.PI * 2);
      ctx.fillStyle = colors.paper; ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = colors.ink; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy);
      ctx.moveTo(cx + 1, cy - 5); ctx.lineTo(cx + 6, cy); ctx.lineTo(cx + 1, cy + 5);
      ctx.stroke();
      ctx.restore();

      text(labels.picked, x, y - 10, 15, 650, colors.muted);
      text(labels.answer, x + chipWidth, y - 10, 15, 750, colors.ink, "right");
      if (!item.timedOut) text(formatHex(item.selectedHex), x, y + chipHeight + 24, 16, 600, colors.muted);
      text(formatHex(item.answerHex), x + chipWidth, y + chipHeight + 24, 16, 750, colors.ink, "right");
    };

    shown.forEach((item, index) => {
      const top = listTop + index * (cardHeight + cardGap);
      const cy = top + cardHeight / 2;
      drawRoundRect(ctx, left, top, right - left, cardHeight, 26, colors.wash);

      text(String(index + 1).padStart(2, "0"), left + 28, cy + 7, 19, 650, colors.muted);

      // Avatar ringed in the color the player should have picked.
      const ax = left + 112;
      ctx.beginPath(); ctx.arc(ax, cy, 45, 0, Math.PI * 2);
      ctx.fillStyle = item.answerHex; ctx.fill();
      ctx.beginPath(); ctx.arc(ax, cy, 41, 0, Math.PI * 2);
      ctx.fillStyle = colors.paper; ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.arc(ax, cy, 38, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = colors.wash; ctx.fillRect(ax - 38, cy - 38, 76, 76);
      if (portraits[index]) {
        const fit = containRect(portraits[index].width, portraits[index].height, ax - 38, cy - 38, 76, 76);
        ctx.drawImage(portraits[index], fit.x, fit.y, fit.width, fit.height);
      }
      ctx.restore();

      const chipX = right - 28 - chipWidth;
      const nameX = ax + 66;
      ctx.fillStyle = colors.ink; ctx.textAlign = "left";
      setFittedCanvasFont(ctx, names[index], chipX - 32 - nameX, 750, 30, 19);
      ctx.fillText(names[index], nameX, cy - 2);
      text(getSeriesLabel(item.idol.series), nameX, cy + 30, 18, 550, colors.muted);

      drawComparison(chipX, cy - chipHeight / 2 - 4, item);
    });

    if (labels.more) text(labels.more, width / 2, listTop + listHeight + 50, 22, 650, colors.muted, "center");

    // Footer: the colors that were missed, as a strip, beside the quiz name.
    rule(footerTop);
    text(labels.footer, left, footerTop + 50, 24, 800);
    const stripWidth = 220, stripX = right - stripWidth;
    ctx.save();
    addRoundRectPath(ctx, stripX, footerTop + 30, stripWidth, 24, 12);
    ctx.clip();
    shown.forEach((item, index) => {
      ctx.fillStyle = item.answerHex;
      ctx.fillRect(stripX + index * stripWidth / shown.length, footerTop + 30, stripWidth / shown.length + 1, 24);
    });
    ctx.restore();
    drawCanvasRepository(ctx, repositoryLabel, width / 2, footerTop + 100, colors);
    return canvas;
  }

  // The shareable result card, laid out top to bottom with a running y cursor.
  async function createCanvas() {
    const record = getRecord();
    const colors = getCanvasColors();
    const labels = {
      title: t("reportTitle"), palette: t("reportPalette"), lineup: t("reportLineup"),
      paletteRange: t("reportRange", record.palette.length, record.total),
      lineupRemainder: record.lineupRemainder,
      summary: t("correctSummary", record.correct, record.total), unit: `/ ${record.maxScore}`,
      meta: `${record.difficulty} · ${record.date} ${record.time}`, footer: t("canvasFooter"), series: t("series"),
      stats: [[t("correctCount"), t("countWithUnit", record.correct)], [t("totalQuestions"), t("countWithUnit", record.total)], [t("resultDifficulty"), record.difficulty], [t("averageTime"), record.averageTime]]
    };
    if (document.fonts?.ready) await document.fonts.ready;
    if (document.fonts?.load) {
      await document.fonts.load(`700 28px ${appFontStack}`, [record.message, ...Object.values(labels).flat(2), ...record.picks.map(item => item.name), ...record.series.map(getSeriesLabel)].join(" "));
    }
    const portraits = await Promise.all(record.picks.map(item => loadImage(item.idol.faceImage)));
    const seriesImages = await loadSeriesIconImages(record.series);

    const width = 1080, left = 80, right = width - 80, inner = right - left;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const seriesStats = getSeriesAccuracy(record.series);
    const seriesColumns = seriesStats.length > 1 ? 2 : 1;
    const seriesRows = Math.ceil(seriesStats.length / seriesColumns);
    const seriesCardHeight = 96, seriesGap = 12;
    const seriesHeight = 22 + seriesRows * seriesCardHeight + Math.max(0, seriesRows - 1) * seriesGap;

    // Vertical plan, so the canvas height is known before drawing.
    const cardHeight = 112, cardGap = 12;
    const layout = {};
    let y = 236;
    layout.message = record.message ? (y += 72) : 0;
    layout.score = (y += 196);
    layout.summary = (y += 48);
    layout.bar = (y += 28);
    layout.stats = (y += 54);
    layout.paletteTitle = (y += 110 + 66);
    layout.tiles = (y += 22);
    layout.lineupTitle = (y += 84 + 36 + 62);
    layout.cards = (y += 22);
    y += record.picks.length * cardHeight + Math.max(0, record.picks.length - 1) * cardGap;
    layout.seriesTitle = (y += 62);
    layout.series = (y += 22);
    layout.footer = (y += seriesHeight + 34);
    const height = y + 140;

    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawPaperCard(ctx, width, height, colors);

    const text = (value, x, ty, size = 24, weight = 500, color = colors.ink, align = "left") => {
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = "alphabetic";
      ctx.font = `${weight} ${size}px ${appFontStack}`;
      ctx.fillText(String(value), x, ty);
    };
    const rule = (ry) => {
      ctx.save();
      ctx.strokeStyle = colors.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, ry); ctx.lineTo(right, ry); ctx.stroke();
      ctx.restore();
    };
    const mark = (x, my, correct) => {
      ctx.save();
      ctx.strokeStyle = correct ? colors.positive : colors.accent;
      ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      if (correct) { ctx.moveTo(x - 6, my); ctx.lineTo(x - 1, my + 5); ctx.lineTo(x + 7, my - 5); }
      else { ctx.moveTo(x - 5, my - 5); ctx.lineTo(x + 5, my + 5); ctx.moveTo(x + 5, my - 5); ctx.lineTo(x - 5, my + 5); }
      ctx.stroke(); ctx.restore();
    };
    const spectrum = (x0, x1) => {
      const gradient = ctx.createLinearGradient(x0, 0, x1, 0);
      spectrumStops.forEach((color, index) => gradient.addColorStop(index / (spectrumStops.length - 1), color));
      return gradient;
    };

    // Header, matching the missed-colors card.
    text("THE IDOLM@STER", left, 100, 18, 750, colors.muted);
    text(labels.title, left, 160, 46, 800);
    text(labels.meta, left, 206, 21, 550, colors.muted);
    drawSeal(ctx, right - 60, 150, 58, colors);
    rule(236);

    if (record.message) {
      ctx.fillStyle = spectrum(left, left + 520);
      ctx.textAlign = "left";
      setFittedCanvasFont(ctx, record.message, inner, 800, 46, 28);
      ctx.fillText(record.message, left, layout.message);
    }

    // Score, then how far along the maximum it got.
    text(record.score, left - 8, layout.score, 196, 800);
    ctx.font = `800 196px ${appFontStack}`;
    const scoreWidth = ctx.measureText(record.score).width;
    text(labels.unit, left + scoreWidth + 8, layout.score, 34, 600, colors.muted);
    text(labels.summary, left, layout.summary, 24, 600, colors.muted);
    drawRoundRect(ctx, left, layout.bar, inner, 14, 7, colors.wash);
    const ratio = clamp(Number(record.score) / record.maxScore, 0, 1);
    if (ratio > 0) drawRoundRect(ctx, left, layout.bar, Math.max(14, inner * ratio), 14, 7, spectrum(left, right));

    // Four stat tiles.
    const tileGap = 12, statWidth = (inner - tileGap * 3) / 4;
    labels.stats.forEach(([label, value], index) => {
      const x = left + index * (statWidth + tileGap);
      drawRoundRect(ctx, x, layout.stats, statWidth, 110, 22, colors.wash);
      text(label, x + 22, layout.stats + 40, 18, 550, colors.muted);
      ctx.fillStyle = colors.ink; ctx.textAlign = "left";
      setFittedCanvasFont(ctx, value, statWidth - 44, 800, 32, 20);
      ctx.fillText(value, x + 22, layout.stats + 86);
    });

    // The colors of this game, as tall tiles with a pass/miss mark.
    text(labels.palette, left, layout.paletteTitle, 24, 800);
    text(labels.paletteRange, right, layout.paletteTitle, 19, 550, colors.muted, "right");
    const swatchGap = 10;
    const swatchWidth = (inner - Math.max(0, record.palette.length - 1) * swatchGap) / Math.max(1, record.palette.length);
    record.palette.forEach((answer, index) => {
      const x = left + index * (swatchWidth + swatchGap);
      drawRoundRect(ctx, x, layout.tiles, swatchWidth, 84, 16, answer.hex);
      ctx.strokeStyle = colors.rule; ctx.lineWidth = 1;
      strokeRoundRect(ctx, x + 0.5, layout.tiles + 0.5, swatchWidth - 1, 83, 16);
      text(String(answer.index).padStart(2, "0"), x + swatchWidth / 2 - 8, layout.tiles + 118, 17, 650, answer.correct ? colors.muted : colors.accent, "center");
      mark(x + swatchWidth / 2 + 16, layout.tiles + 112, answer.correct);
    });

    // Idol lineup: cards with the avatar ringed in that idol's image color.
    text(labels.lineup, left, layout.lineupTitle, 24, 800);
    if (labels.lineupRemainder) text(labels.lineupRemainder, right, layout.lineupTitle, 19, 550, colors.muted, "right");
    record.picks.forEach((answer, index) => {
      const top = layout.cards + index * (cardHeight + cardGap);
      const cy = top + cardHeight / 2;
      drawRoundRect(ctx, left, top, inner, cardHeight, 26, colors.wash);
      text(String(answer.index).padStart(2, "0"), left + 28, cy + 7, 19, 650, colors.muted);

      const ax = left + 104;
      ctx.beginPath(); ctx.arc(ax, cy, 40, 0, Math.PI * 2); ctx.fillStyle = answer.hex; ctx.fill();
      ctx.beginPath(); ctx.arc(ax, cy, 36, 0, Math.PI * 2); ctx.fillStyle = colors.paper; ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.arc(ax, cy, 33, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = colors.wash; ctx.fillRect(ax - 33, cy - 33, 66, 66);
      if (portraits[index]) {
        const fit = containRect(portraits[index].width, portraits[index].height, ax - 33, cy - 33, 66, 66);
        ctx.drawImage(portraits[index], fit.x, fit.y, fit.width, fit.height);
      }
      ctx.restore();

      const chipWidth = 132, chipX = right - 24 - chipWidth;
      const nameX = ax + 60;
      ctx.fillStyle = colors.ink; ctx.textAlign = "left";
      setFittedCanvasFont(ctx, answer.name, chipX - 28 - nameX, 750, 28, 18);
      ctx.fillText(answer.name, nameX, cy - 4);
      text(`${answer.hex}   ${answer.responseTime}`, nameX, cy + 28, 18, 550, colors.muted);

      drawRoundRect(ctx, chipX, cy - 34, chipWidth, 40, 14, answer.hex);
      ctx.strokeStyle = colors.rule; ctx.lineWidth = 1;
      strokeRoundRect(ctx, chipX + 0.5, cy - 33.5, chipWidth - 1, 39, 14);
      text(answer.outcome, right - 24 - 24, cy + 32, 17, 700, answer.correct ? colors.muted : colors.accent, "right");
      mark(right - 24 - 8, cy + 26, answer.correct);
    });

    // Accuracy per series: badge, name, percent and count, with a bar in the series color.
    text(labels.series, left, layout.seriesTitle, 24, 800);
    const seriesWidth = (inner - (seriesColumns - 1) * seriesGap) / seriesColumns;
    seriesStats.forEach((stat, index) => {
      const x = left + (index % seriesColumns) * (seriesWidth + seriesGap);
      const top = layout.series + Math.floor(index / seriesColumns) * (seriesCardHeight + seriesGap);
      drawRoundRect(ctx, x, top, seriesWidth, seriesCardHeight, 22, colors.wash);
      drawSeriesCanvasBadge(ctx, x + 20, top + 18, 40, 32, stat.series, seriesImages[stat.series]);

      const percent = stat.total ? `${Math.round(stat.ratio * 100)}%` : "–";
      const count = `${stat.correct}/${stat.total}`;
      ctx.font = `600 18px ${appFontStack}`;
      const countWidth = ctx.measureText(count).width;
      ctx.font = `800 30px ${appFontStack}`;
      const percentWidth = ctx.measureText(percent).width;
      text(count, x + seriesWidth - 20, top + 44, 18, 600, colors.muted, "right");
      text(percent, x + seriesWidth - 30 - countWidth, top + 45, 30, 800, colors.ink, "right");
      ctx.fillStyle = colors.ink; ctx.textAlign = "left";
      setFittedCanvasFont(ctx, getSeriesLabel(stat.series), seriesWidth - 112 - countWidth - percentWidth, 700, 22, 15);
      ctx.fillText(getSeriesLabel(stat.series), x + 72, top + 42);

      const barX = x + 20, barY = top + 66, barWidth = seriesWidth - 40;
      drawRoundRect(ctx, barX, barY, barWidth, 10, 5, colors.paper);
      if (stat.ratio > 0) {
        const tone = getSeriesCanvasColors(stat.series);
        const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        gradient.addColorStop(0, tone.from);
        gradient.addColorStop(1, tone.to);
        drawRoundRect(ctx, barX, barY, Math.max(10, barWidth * stat.ratio), 10, 5, gradient);
      }
    });

    // Footer: quiz name, this game's colors as a strip, and the repository.
    rule(layout.footer);
    text(labels.footer, left, layout.footer + 50, 24, 800);
    const stripWidth = 220, stripX = right - stripWidth;
    ctx.save();
    addRoundRectPath(ctx, stripX, layout.footer + 30, stripWidth, 24, 12);
    ctx.clip();
    record.palette.forEach((answer, index) => {
      ctx.fillStyle = answer.hex;
      ctx.fillRect(stripX + index * stripWidth / Math.max(1, record.palette.length), layout.footer + 30, stripWidth / Math.max(1, record.palette.length) + 1, 24);
    });
    ctx.restore();
    drawCanvasRepository(ctx, repositoryLabel, width / 2, layout.footer + 100, colors);
    return canvas;
  }

  // A spectrum-ringed seal; older canvases without conic gradients fall back to the accent.
  function drawSeal(ctx, x, y, radius, colors) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 22);
    let ring = colors.accent;
    if (typeof ctx.createConicGradient === "function") {
      ring = ctx.createConicGradient(Math.PI * 1.1, 0, 0);
      spectrumStops.forEach((color, index) => ring.addColorStop(index / (spectrumStops.length - 1), color));
    }
    ctx.strokeStyle = ring; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = colors.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, radius - 9, 0, Math.PI * 2); ctx.stroke();
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = colors.ink;
    ctx.font = `800 ${Math.round(radius * .94)}px ${appFontStack}`; ctx.fillText("P", 0, 13);
    ctx.fillStyle = colors.muted;
    ctx.font = `800 ${Math.round(radius * .17)}px ${appFontStack}`; ctx.fillText("COLOR MATCH", 0, radius * .56);
    ctx.restore();
  }

  return { render, createCanvas, createWrongNoteCanvas };
})();
