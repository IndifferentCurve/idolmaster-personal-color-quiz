"use strict";

/*
  data/series/gakuen.js
  Gakuen Idolmaster quiz data. This file registers only one series.
*/
(() => {
  const idols = [
    { no: 2001, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "花海 咲季", name: "하나미 사키", hex: "#e30f25", image: "gakuen/Saki_Hanami.webp" },
    { no: 2002, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "月村 手毬", name: "츠키무라 테마리", hex: "#0c7bbb", image: "gakuen/Temari_Tsukimura.webp" },
    { no: 2003, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "藤田 ことね", name: "후지타 코토네", hex: "#f8c112", image: "gakuen/Kotone_Fujita.webp" },
    { no: 2004, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "有村 麻央", name: "아리무라 마오", hex: "#7f1184", image: "gakuen/Mao_Arimura.webp" },
    { no: 2005, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "葛城 リーリヤ", name: "카츠라기 릴리야", hex: "#eafdff", image: "gakuen/Lilja_Katsuragi.webp" },
    { no: 2006, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "倉本 千奈", name: "쿠라모토 치나", hex: "#f68b1f", image: "gakuen/China_Kuramoto.webp" },
    { no: 2007, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "紫雲 清夏", name: "시운 스미카", hex: "#7cfc00", image: "gakuen/Sumika_Shiun.webp" },
    { no: 2008, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "篠澤 広", name: "시노사와 히로", hex: "#00afcc", image: "gakuen/Hiro_Shinosawa.webp" },
    { no: 2009, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "姫崎 莉波", name: "히메사키 리나미", hex: "#f6adc6", image: "gakuen/Rinami_Himesaki.webp" },
    { no: 2010, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "花海 佑芽", name: "하나미 우메", hex: "#ea533a", image: "gakuen/Ume_Hanami.webp" },
    { no: 2011, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "秦谷 美鈴", name: "하타야 미스즈", hex: "#7a99cf", image: "gakuen/Misuzu_Hataya.webp" },
    { no: 2012, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "十王 星南", name: "주오 세나", hex: "#f6ae54", image: "gakuen/Sena_Juo.webp" },
    { no: 2013, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "雨夜 燕", name: "아마야 츠바메", hex: "#7b68ee", image: "gakuen/Tsubame_Amaya.webp" }
  ];

  const imageFiles = {
    2001: "gakuen/Saki_Hanami.webp",
    2002: "gakuen/Temari_Tsukimura.webp",
    2003: "gakuen/Kotone_Fujita.webp",
    2004: "gakuen/Mao_Arimura.webp",
    2005: "gakuen/Lilja_Katsuragi.webp",
    2006: "gakuen/China_Kuramoto.webp",
    2007: "gakuen/Sumika_Shiun.webp",
    2008: "gakuen/Hiro_Shinosawa.webp",
    2009: "gakuen/Rinami_Himesaki.webp",
    2010: "gakuen/Ume_Hanami.webp",
    2011: "gakuen/Misuzu_Hataya.webp",
    2012: "gakuen/Sena_Juo.webp",
    2013: "gakuen/Tsubame_Amaya.webp"
  };

  const hairColors = {
    2001: "#CF7E7E",
    2002: "#5F6E73",
    2003: "#E7C95E",
    2004: "#D5A9B1",
    2005: "#E6DBDB",
    2006: "#887B70",
    2007: "#E7A25B",
    2008: "#EBDFCC",
    2009: "#D3A495",
    2010: "#B47A63",
    2011: "#5E577D",
    2012: "#FFF1DC",
    2013: "#83818D"
  };

  window.IdolmasterQuizSeriesData = window.IdolmasterQuizSeriesData || {};
  window.IdolmasterQuizSeriesData.gakuen = Object.freeze({
    idols: Object.freeze(idols),
    imageFiles: Object.freeze(imageFiles),
    hairColors: Object.freeze(hairColors)
  });
})();
