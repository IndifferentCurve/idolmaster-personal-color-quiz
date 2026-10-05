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

  function drawResultSeriesCanvas(ctx, options) {
    const { x, y, width, height, activeSeries, seriesIconImages, colors } = options;
    const metrics = options.metrics || getSeriesCanvasLayout(ctx, activeSeries, width, height);

    ctx.fillStyle = colors.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `450 ${metrics.titleFontSize}px ${appFontStack}`;
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
    const badgeSize = { width: metrics.badgeWidth, height: metrics.badgeHeight };
    const badgeX = x + metrics.padX;
    const badgeY = y + (height - badgeSize.height) / 2;
    drawSeriesCanvasBadge(ctx, badgeX, badgeY, badgeSize.width, badgeSize.height, series, iconImage);

    ctx.fillStyle = colors.text;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = `550 ${metrics.fontSize}px ${appFontStack}`;
    ctx.fillText(getSeriesLabel(series), badgeX + badgeSize.width + metrics.badgeGap, y + height / 2 + 1);
  }

  function getSeriesCanvasPillWidth(ctx, series, metrics) {
    ctx.font = `550 ${metrics.fontSize}px ${appFontStack}`;
    return Math.ceil(metrics.padX + metrics.badgeWidth + metrics.badgeGap + ctx.measureText(getSeriesLabel(series)).width + metrics.padX);
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

  async function createCanvas() {
    const record = getRecord();
    const colors = getCanvasColors();
    const labels = {
      title: t("reportTitle"), palette: t("reportPalette"), lineup: t("reportLineup"),
      paletteRange: t("reportRange", record.palette.length, record.total),
      lineupRemainder: record.lineupRemainder,
      summary: t("correctSummary", record.correct, record.total), unit: `/ ${record.maxScore}`,
      recorded: t("reportRecorded"), footer: t("canvasFooter"),
      stats: [[t("correctCount"), t("countWithUnit", record.correct)], [t("totalQuestions"), t("countWithUnit", record.total)], [t("resultDifficulty"), record.difficulty], [t("averageTime"), record.averageTime]]
    };
    if (document.fonts?.ready) await document.fonts.ready;
    if (document.fonts?.load) {
      await document.fonts.load(`600 28px ${appFontStack}`, [record.message, ...Object.values(labels).flat(2), ...record.picks.map(item => item.name)].join(" "));
    }
    const portraits = await Promise.all(record.picks.map(item => loadImage(item.idol.faceImage)));
    const seriesImages = await loadSeriesIconImages(record.series);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 1080, left = 80, right = 816, mainWidth = right - left, tearX = 868;
    const seriesMetrics = { fontSize: 24, titleFontSize: 24, titleBaseline: 30, pillHeight: 44, rowGap: 12, gap: 14, padX: 10, badgeWidth: 36, badgeHeight: 28, badgeGap: 10, listTop: 54, bottomPadding: 18 };
    seriesMetrics.rows = makeSeriesPillRows(ctx, record.series, mainWidth - 48, seriesMetrics);
    const seriesHeight = 54 + seriesMetrics.rows.length * 44 + Math.max(0, seriesMetrics.rows.length - 1) * 12 + 18;
    const listTop = 828, rowHeight = 90;
    const seriesTop = listTop + record.picks.length * rowHeight + 38;
    const footerTop = seriesTop + seriesHeight + 32;
    const removedMessageSpace = record.message ? 0 : 64;
    const height = footerTop + 144 - removedMessageSpace;
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawPaperCard(ctx, width, height, colors);

    function text(value, x, y, size = 24, weight = 500, color = colors.ink, align = "left") {
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = "alphabetic";
      ctx.font = `${weight} ${size}px ${appFontStack}`;
      ctx.fillText(String(value), x, y);
    }
    function line(y, dashed = false) {
      ctx.save();
      ctx.strokeStyle = colors.rule;
      ctx.lineWidth = 1;
      ctx.setLineDash(dashed ? [3, 6] : []);
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
      ctx.restore();
    }
    function mark(x, y, correct) {
      ctx.save();
      ctx.strokeStyle = correct ? colors.positive : colors.accent;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      if (correct) { ctx.moveTo(x - 6, y); ctx.lineTo(x - 1, y + 5); ctx.lineTo(x + 7, y - 5); }
      else { ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5); ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5); }
      ctx.stroke(); ctx.restore();
    }

    text("THE IDOLM@STER", left, 92, 18, 750, colors.muted);
    text(labels.title, left, 138, 36, 800);
    text(record.date, right, 138, 23, 600, colors.muted, "right");
    line(164);
    text("RESULT", left, 211, 18, 800, colors.accent);
    if (record.message) {
      setFittedCanvasFont(ctx, record.message, mainWidth, 800, 46, 28);
      ctx.fillStyle = colors.accent; ctx.textAlign = "left";
      ctx.fillText(record.message, left, 272);
    }
    // Collapse the comment row without changing spacing within the report below it.
    ctx.save();
    ctx.translate(0, -removedMessageSpace);
    text(record.score, left - 7, 450, 184, 800);
    const scoreWidth = ctx.measureText(record.score).width;
    text(labels.unit, left + scoreWidth + 6, 450, 34, 550, colors.muted);
    text(labels.summary, left, 494, 24, 500, colors.muted);
    drawSeal(ctx, right - 65, 401, 58, colors);
    line(528);
    labels.stats.forEach(([label, value], index) => {
      const x = left + index * mainWidth / labels.stats.length;
      text(label, x, 565, 20, 500, colors.muted);
      text(value, x, 606, 29, 800);
    });
    line(632);
    text(labels.palette, left, 679, 23, 800);
    text(labels.paletteRange, right, 679, 19, 500, colors.muted, "right");
    const tileGap = 10;
    const tileWidth = (mainWidth - Math.max(0, record.palette.length - 1) * tileGap) / Math.max(1, record.palette.length);
    record.palette.forEach((answer, index) => {
      const x = left + index * (tileWidth + tileGap);
      drawRoundRect(ctx, x, 701, tileWidth, 46, 10, answer.hex);
      ctx.strokeStyle = colors.rule;
      strokeRoundRect(ctx, x, 701, tileWidth, 46, 10);
      text(String(answer.index).padStart(2, "0"), x + tileWidth / 2 - 7, 778, 17, 550, answer.correct ? colors.muted : colors.accent, "center");
      mark(x + tileWidth / 2 + 15, 772, answer.correct);
    });
    text(labels.lineup, left, 824, 23, 800);
    if (labels.lineupRemainder) text(labels.lineupRemainder, right, 824, 19, 500, colors.muted, "right");
    record.picks.forEach((answer, index) => {
      const y = listTop + index * rowHeight;
      const centerY = y + 48;
      text(String(answer.index).padStart(2, "0"), left, centerY + 8, 22, 600, colors.muted);
      ctx.save();
      ctx.beginPath(); ctx.arc(left + 77, centerY, 29, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = colors.wash; ctx.fillRect(left + 48, centerY - 29, 58, 58);
      if (portraits[index]) {
        const fit = containRect(portraits[index].width, portraits[index].height, left + 48, centerY - 29, 58, 58);
        ctx.drawImage(portraits[index], fit.x, fit.y, fit.width, fit.height);
      }
      ctx.restore();
      ctx.textAlign = "left"; ctx.fillStyle = colors.ink;
      setFittedCanvasFont(ctx, answer.name, mainWidth - 242, 750, 26, 18);
      ctx.fillText(answer.name, left + 130, centerY - 5);
      text(answer.hex, left + 130, centerY + 26, 20, 500, colors.muted);
      text(answer.responseTime, left + 270, centerY + 26, 20, 500, colors.muted);
      text(answer.outcome, right - 28, centerY + 26, 20, 550, answer.correct ? colors.muted : colors.accent, "right");
      mark(right - 7, centerY + 18, answer.correct);
      drawRoundRect(ctx, right - 76, centerY - 26, 76, 29, 8, answer.hex);
      ctx.strokeStyle = colors.rule; strokeRoundRect(ctx, right - 76, centerY - 26, 76, 29, 8);
      line(y + rowHeight, true);
    });
    drawResultSeriesCanvas(ctx, { x: left, y: seriesTop, width: mainWidth, height: seriesHeight, activeSeries: record.series, seriesIconImages: seriesImages, colors, metrics: seriesMetrics });
    line(footerTop);
    text(labels.footer, left, footerTop + 44, 24, 800);
    const stripeX = right - 184;
    ctx.save();
    addRoundRectPath(ctx, stripeX, footerTop + 23, 184, 24, 12);
    ctx.clip();
    record.palette.forEach((answer, index) => {
      ctx.fillStyle = answer.hex;
      ctx.fillRect(stripeX + index * 184 / Math.max(1, record.palette.length), footerTop + 23, 184 / Math.max(1, record.palette.length) + 1, 24);
    });
    ctx.restore();
    drawCanvasRepository(ctx, repositoryLabel, left + mainWidth / 2, footerTop + 88, colors);
    ctx.restore();

    // A narrow perforated stub gives the export its collectible-ticket silhouette.
    ctx.save();
    ctx.strokeStyle = colors.rule; ctx.setLineDash([4, 9]);
    ctx.beginPath(); ctx.moveTo(tearX, 48); ctx.lineTo(tearX, height - 48); ctx.stroke(); ctx.restore();
    for (let y = 72; y < height - 64; y += 42) {
      ctx.fillStyle = colors.paper; ctx.strokeStyle = colors.rule;
      ctx.beginPath(); ctx.arc(tearX, y, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    const stubX = (tearX + width - 32) / 2;
    text("PLAY RECORD", stubX, 106, 15, 800, colors.accent, "center");
    ctx.save(); ctx.translate(stubX + 10, 350); ctx.rotate(Math.PI / 2);
    text("IMAGE COLOR QUIZ", 0, 0, 29, 800); ctx.restore();
    record.series.forEach((series, index) => {
      drawSeriesCanvasBadge(ctx, stubX - 24, 726 - removedMessageSpace + index * 58, 48, 38, series, seriesImages[series]);
    });
    drawSeal(ctx, stubX, height - 276, 49, colors);
    text(labels.recorded, stubX, height - 170, 15, 550, colors.accent, "center");
    text(record.date, stubX, height - 137, 17, 600, colors.ink, "center");
    text(record.time, stubX, height - 104, 23, 600, colors.ink, "center");
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
