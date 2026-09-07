"use strict";

// Screen and export share the same completed-game record, never a new sample.
window.IdolmasterResultReport = (() => {
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

  async function createCanvas() {
    const record = getRecord();
    const tokens = getComputedStyle(document.querySelector(".result-report"));
    const colors = Object.fromEntries(["paper", "ink", "muted", "rule", "accent", "wash"].map(key => [key, tokens.getPropertyValue(`--report-${key}`).trim()]));
    colors.text = colors.ink;
    colors.bg = getComputedStyle(document.documentElement).getPropertyValue("--page-bg").trim();
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
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = colors.paper;
    ctx.fillRect(32, 32, width - 64, height - 64);
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, width - 64, height - 64);
    ctx.strokeStyle = colors.rule;
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

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
      ctx.strokeStyle = correct ? colors.ink : colors.accent;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      if (correct) { ctx.moveTo(x - 6, y); ctx.lineTo(x - 1, y + 5); ctx.lineTo(x + 7, y - 5); }
      else { ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5); ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5); }
      ctx.stroke(); ctx.restore();
    }

    text("THE IDOLM@STER", left, 92, 18, 650, colors.muted);
    text(labels.title, left, 138, 34, 650);
    text(record.date, right, 138, 23, 600, colors.ink, "right");
    line(164);
    text("RESULT", left, 211, 18, 650, colors.accent);
    if (record.message) {
      setFittedCanvasFont(ctx, record.message, mainWidth, 650, 46, 28);
      ctx.fillStyle = colors.accent; ctx.textAlign = "left";
      ctx.fillText(record.message, left, 272);
    }
    // Collapse the comment row without changing spacing within the report below it.
    ctx.save();
    ctx.translate(0, -removedMessageSpace);
    text(record.score, left - 7, 450, 184, 650);
    const scoreWidth = ctx.measureText(record.score).width;
    text(labels.unit, left + scoreWidth + 6, 450, 34, 550, colors.muted);
    text(labels.summary, left, 494, 24, 500, colors.muted);
    drawSeal(ctx, right - 65, 401, 58, colors);
    line(528);
    labels.stats.forEach(([label, value], index) => {
      const x = left + index * mainWidth / labels.stats.length;
      text(label, x, 565, 20, 500, colors.muted);
      text(value, x, 606, 29, 600);
    });
    line(632);
    text(labels.palette, left, 679, 23, 600);
    text(labels.paletteRange, right, 679, 19, 500, colors.muted, "right");
    const tileGap = 10;
    const tileWidth = (mainWidth - Math.max(0, record.palette.length - 1) * tileGap) / Math.max(1, record.palette.length);
    record.palette.forEach((answer, index) => {
      const x = left + index * (tileWidth + tileGap);
      drawRoundRect(ctx, x, 701, tileWidth, 46, 3, answer.hex);
      ctx.strokeStyle = colors.rule;
      strokeRoundRect(ctx, x, 701, tileWidth, 46, 3);
      text(String(answer.index).padStart(2, "0"), x + tileWidth / 2 - 7, 778, 17, 550, answer.correct ? colors.muted : colors.accent, "center");
      mark(x + tileWidth / 2 + 15, 772, answer.correct);
    });
    text(labels.lineup, left, 824, 23, 600);
    if (labels.lineupRemainder) text(labels.lineupRemainder, right, 824, 19, 500, colors.muted, "right");
    record.picks.forEach((answer, index) => {
      const y = listTop + index * rowHeight;
      const centerY = y + 48;
      text(String(answer.index).padStart(2, "0"), left, centerY + 8, 24, 650, colors.accent);
      ctx.save();
      ctx.beginPath(); ctx.arc(left + 77, centerY, 29, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = colors.wash; ctx.fillRect(left + 48, centerY - 29, 58, 58);
      if (portraits[index]) {
        const fit = containRect(portraits[index].width, portraits[index].height, left + 48, centerY - 29, 58, 58);
        ctx.drawImage(portraits[index], fit.x, fit.y, fit.width, fit.height);
      }
      ctx.restore();
      ctx.textAlign = "left"; ctx.fillStyle = colors.ink;
      setFittedCanvasFont(ctx, answer.name, mainWidth - 242, 600, 26, 18);
      ctx.fillText(answer.name, left + 130, centerY - 5);
      text(answer.hex, left + 130, centerY + 26, 20, 500, colors.muted);
      text(answer.responseTime, left + 270, centerY + 26, 20, 500, colors.muted);
      text(answer.outcome, right - 28, centerY + 26, 20, 550, answer.correct ? colors.muted : colors.accent, "right");
      mark(right - 7, centerY + 18, answer.correct);
      drawRoundRect(ctx, right - 76, centerY - 26, 76, 29, 3, answer.hex);
      ctx.strokeStyle = colors.rule; strokeRoundRect(ctx, right - 76, centerY - 26, 76, 29, 3);
      line(y + rowHeight, true);
    });
    drawResultSeriesCanvas(ctx, { x: left, y: seriesTop, width: mainWidth, height: seriesHeight, activeSeries: record.series, seriesIconImages: seriesImages, colors, metrics: seriesMetrics });
    line(footerTop);
    text(labels.footer, left, footerTop + 44, 24, 600);
    const stripeX = right - 184;
    record.palette.forEach((answer, index) => {
      ctx.fillStyle = answer.hex;
      ctx.fillRect(stripeX + index * 184 / Math.max(1, record.palette.length), footerTop + 23, 184 / Math.max(1, record.palette.length), 24);
    });
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
    text("PLAY RECORD", stubX, 106, 15, 650, colors.accent, "center");
    ctx.save(); ctx.translate(stubX + 10, 350); ctx.rotate(Math.PI / 2);
    text("IMAGE COLOR QUIZ", 0, 0, 32, 600); ctx.restore();
    record.series.forEach((series, index) => {
      drawSeriesCanvasBadge(ctx, stubX - 24, 726 - removedMessageSpace + index * 58, 48, 38, series, seriesImages[series]);
    });
    drawSeal(ctx, stubX, height - 276, 49, colors);
    text(labels.recorded, stubX, height - 170, 15, 550, colors.accent, "center");
    text(record.date, stubX, height - 137, 17, 600, colors.ink, "center");
    text(record.time, stubX, height - 104, 23, 600, colors.ink, "center");
    return canvas;
  }

  function drawSeal(ctx, x, y, radius, colors) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 24);
    ctx.strokeStyle = colors.accent; ctx.fillStyle = colors.accent; ctx.lineWidth = 2;
    [radius, radius - 6].forEach(r => { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); });
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.font = `650 ${Math.round(radius * .94)}px ${appFontStack}`; ctx.fillText("P", 0, 13);
    ctx.font = `650 ${Math.round(radius * .18)}px ${appFontStack}`; ctx.fillText("COLOR MATCH", 0, radius * .56);
    ctx.restore();
  }

  return { render, createCanvas };
})();
