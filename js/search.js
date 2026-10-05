"use strict";

/*
  js/search.js
  Language-tolerant text search: folds width, case, kana and romaji spelling variants
  so "haruka", "はるか", "ハルカ" and "春香" style queries all land on the same idol.
  Query syntax: "+" requires every term, "or" separates alternatives.
*/

const romajiVariantPairs = Object.freeze([
  ["shi", "si"],
  ["sha", "sya"],
  ["shu", "syu"],
  ["sho", "syo"],
  ["chi", "ti"],
  ["cha", "tya"],
  ["chu", "tyu"],
  ["cho", "tyo"],
  ["tsu", "tu"],
  ["fu", "hu"],
  ["ji", "zi"],
  ["ja", "zya"],
  ["ju", "zyu"],
  ["jo", "zyo"]
]);

const romajiKanaMap = Object.freeze({
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
  sha: "しゃ", shu: "しゅ", sho: "しょ",
  sya: "しゃ", syu: "しゅ", syo: "しょ",
  ja: "じゃ", ju: "じゅ", jo: "じょ",
  jya: "じゃ", jyu: "じゅ", jyo: "じょ",
  zya: "じゃ", zyu: "じゅ", zyo: "じょ",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ",
  tya: "ちゃ", tyu: "ちゅ", tyo: "ちょ",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
  mya: "みゃ", myu: "みゅ", myo: "みょ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  fa: "ふぁ", fi: "ふぃ", fe: "ふぇ", fo: "ふぉ",
  va: "ゔぁ", vi: "ゔぃ", vu: "ゔ", ve: "ゔぇ", vo: "ゔぉ",
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  sa: "さ", shi: "し", si: "し", su: "す", se: "せ", so: "そ",
  za: "ざ", ji: "じ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  ta: "た", chi: "ち", ti: "ち", tsu: "つ", tu: "つ", te: "て", to: "と",
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  ha: "は", hi: "ひ", fu: "ふ", hu: "ふ", he: "へ", ho: "ほ",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  ya: "や", yu: "ゆ", yo: "よ",
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  wa: "わ", wi: "うぃ", we: "うぇ", wo: "を"
});

const romajiKanaKeys = Object.freeze(Object.keys(romajiKanaMap).sort((left, right) => right.length - left.length));

function parseIdolSearchQuery(value) {
  const normalized = normalizeSearchText(value);
  // OR separates alternatives; + requires every term within an alternative.
  const alternatives = normalized.split(/(?:^|\s)or(?=\s|$)/u)
    .map((alternative) => alternative.split("+")
      .map((term) => term.trim())
      .filter(Boolean)
      .map((term) => ({
        normalized: term,
        compact: compactSearchText(term),
        // Token forms are prepared once here instead of once per idol compared.
        tokens: term.split(" ").map((token) => ({ normalized: token, compact: compactSearchText(token) }))
      })))
    .filter((terms) => terms.length);
  return { normalized, alternatives };
}

function matchesSearchQuery(haystack, query) {
  if (!query.normalized) return true;
  return query.alternatives.some((terms) => terms.every((term) => (
    haystack.normalized.includes(term.normalized)
    || haystack.compact.includes(term.compact)
    || term.tokens.every((token) => (
      haystack.normalized.includes(token.normalized)
      || haystack.compact.includes(token.compact)
    ))
  )));
}

function createSearchHaystack(values) {
  const normalized = normalizeSearchText(values.filter(Boolean).join(" "));
  return { normalized, compact: compactSearchText(normalized) };
}

// A romanized file name such as "Haruka_Amami" also matches its spelling variants and kana.
function getRomajiAliases(baseName) {
  const aliases = [baseName, baseName.replace(/[_-]+/g, " "), baseName.replace(/[_-]+/g, "")];
  getRomajiSearchVariants(baseName).forEach((variant) => {
    aliases.push(variant);
    const hiragana = romajiToHiragana(variant);
    if (hiragana !== variant) aliases.push(hiragana, hiraganaToKatakana(hiragana));
  });
  return aliases;
}

function getRomajiSearchVariants(value) {
  const base = normalizeRomajiText(value);
  if (!base) return [];

  const variants = new Set([base, compactSearchText(base)]);
  romajiVariantPairs.forEach(([left, right]) => {
    [...variants].forEach((variant) => {
      if (variant.includes(left)) variants.add(replaceAllText(variant, left, right));
      if (variant.includes(right)) variants.add(replaceAllText(variant, right, left));
    });
  });
  return [...variants].filter(Boolean);
}

function normalizeRomajiText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function romajiToHiragana(value) {
  const text = normalizeRomajiText(value);
  let result = "";
  let index = 0;

  while (index < text.length) {
    const char = text[index];
    const next = text[index + 1] || "";

    if (char === " ") {
      result += " ";
      index += 1;
      continue;
    }

    if (!/[a-z]/.test(char)) {
      result += char;
      index += 1;
      continue;
    }

    if (char === next && char !== "n" && isRomajiConsonant(char)) {
      result += "っ";
      index += 1;
      continue;
    }

    if (char === "n" && shouldUseStandaloneN(text, index)) {
      result += "ん";
      index += next === "'" ? 2 : 1;
      continue;
    }

    const key = romajiKanaKeys.find((candidate) => text.startsWith(candidate, index));
    if (key) {
      result += romajiKanaMap[key];
      index += key.length;
      continue;
    }

    result += char;
    index += 1;
  }

  return result.replace(/\s+/g, " ").trim();
}

function shouldUseStandaloneN(text, index) {
  const next = text[index + 1] || "";
  if (!next || next === " " || next === "'") return true;
  return !/[aiueoy]/.test(next);
}

function isRomajiConsonant(char) {
  return /[bcdfghjklmnpqrstvwxyz]/.test(char);
}

function hiraganaToKatakana(value) {
  return String(value || "").replace(/[\u3041-\u3096]/g, (char) => (
    String.fromCharCode(char.charCodeAt(0) + 0x60)
  ));
}

function normalizeSearchText(value) {
  const folded = String(value || "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\u30a1-\u30f6]/g, (char) => (
      String.fromCharCode(char.charCodeAt(0) - 0x60)
    ))
    .replace(/[\u30fc\uff70]/g, "")
    .replace(/[_\-./=]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return folded;
}

function compactSearchText(value) {
  return String(value || "").replace(/\s+/g, "");
}

function replaceAllText(value, search, replacement) {
  return String(value).split(search).join(replacement);
}
