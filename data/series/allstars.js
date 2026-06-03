"use strict";

/*
  data/series/allstars.js
  765PRO ALLSTARS quiz data. This file registers only one series.
*/
(() => {
  const idols = [
    { no: 1, series: "allstars", attribute: "Princess", group: "765PRO ALLSTARS", jpName: "天海 春香", name: "아마미 하루카", hex: "#e22b30", image: "allstars/Haruka_Amami.webp" },
    { no: 2, series: "allstars", attribute: "Fairy", group: "765PRO ALLSTARS", jpName: "如月 千早", name: "키사라기 치하야", hex: "#2743d2", image: "allstars/Chihaya_Kisaragi.webp" },
    { no: 3, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "星井 美希", name: "호시이 미키", hex: "#b4e04b", image: "allstars/Miki_Hoshii.webp" },
    { no: 4, series: "allstars", attribute: "Princess", group: "765PRO ALLSTARS", jpName: "萩原 雪歩", name: "하기와라 유키호", hex: "#d3dde9", image: "allstars/Yukiho_Hagiwara.webp" },
    { no: 5, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "高槻 やよい", name: "타카츠키 야요이", hex: "#f39939", image: "allstars/Yayoi_Takatsuki.webp" },
    { no: 6, series: "allstars", attribute: "Princess", group: "765PRO ALLSTARS", jpName: "菊地 真", name: "키쿠치 마코토", hex: "#515558", image: "allstars/Makoto_Kikuchi.webp" },
    { no: 7, series: "allstars", attribute: "Fairy", group: "765PRO ALLSTARS", jpName: "水瀬 伊織", name: "미나세 이오리", hex: "#fd99e1", image: "allstars/Iori_Minase.webp" },
    { no: 8, series: "allstars", attribute: "Fairy", group: "765PRO ALLSTARS", jpName: "四条 貴音", name: "시죠 타카네", hex: "#a6126a", image: "allstars/Takane_Shijou.webp" },
    { no: 9, series: "allstars", attribute: "Fairy", group: "765PRO ALLSTARS", jpName: "秋月 律子", name: "아키즈키 리츠코", hex: "#01a860", image: "allstars/Ritsuko_Akizuki.webp" },
    { no: 10, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "三浦 あずさ", name: "미우라 아즈사", hex: "#9238be", image: "allstars/Azusa_Miura.webp" },
    { no: 11, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "双海 亜美", name: "후타미 아미", hex: "#ffe43f", image: "allstars/Ami_Futami.webp" },
    { no: 12, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "双海 真美", name: "후타미 마미", hex: "#ffe43f", image: "allstars/Mami_Futami.webp" },
    { no: 13, series: "allstars", attribute: "Princess", group: "765PRO ALLSTARS", jpName: "我那覇 響", name: "가나하 히비키", hex: "#01adb9", image: "allstars/Hibiki_Ganaha.webp" }
  ];

  const imageFiles = {
    1: "allstars/Haruka_Amami.webp",
    2: "allstars/Chihaya_Kisaragi.webp",
    3: "allstars/Miki_Hoshii.webp",
    4: "allstars/Yukiho_Hagiwara.webp",
    5: "allstars/Yayoi_Takatsuki.webp",
    6: "allstars/Makoto_Kikuchi.webp",
    7: "allstars/Iori_Minase.webp",
    8: "allstars/Takane_Shijou.webp",
    9: "allstars/Ritsuko_Akizuki.webp",
    10: "allstars/Azusa_Miura.webp",
    11: "allstars/Ami_Futami.webp",
    12: "allstars/Mami_Futami.webp",
    13: "allstars/Hibiki_Ganaha.webp"
  };

  const hairColors = {
    1: "#8E5049",
    2: "#28355A",
    3: "#F2E48E",
    4: "#C8925E",
    5: "#D88445",
    6: "#3D3C46",
    7: "#9A6643",
    8: "#D9D8E6",
    9: "#8A6043",
    10: "#303A6C",
    11: "#A17542",
    12: "#A17542",
    13: "#242633"
  };

  window.IdolmasterQuizSeriesData = window.IdolmasterQuizSeriesData || {};
  window.IdolmasterQuizSeriesData.allstars = Object.freeze({
    idols: Object.freeze(idols),
    imageFiles: Object.freeze(imageFiles),
    hairColors: Object.freeze(hairColors)
  });
})();
