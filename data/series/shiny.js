"use strict";

/*
  data/series/shiny.js
  Shiny Colors quiz data. This file registers only one series.
*/
(() => {
  const idols = [
    { no: 1001, series: "shiny", attribute: "illumination STARS", group: "SHINY COLORS", jpName: "櫻木 真乃", name: "사쿠라기 마노", hex: "#ffbad6", image: "shiny/Mano_Sakuragi.webp" },
    { no: 1002, series: "shiny", attribute: "illumination STARS", group: "SHINY COLORS", jpName: "風野 灯織", name: "카자노 히오리", hex: "#144384", image: "shiny/Hiori_Kazano.webp" },
    { no: 1003, series: "shiny", attribute: "illumination STARS", group: "SHINY COLORS", jpName: "八宮 めぐる", name: "하치미야 메구루", hex: "#ffe012", image: "shiny/Meguru_Hachimiya.webp" },
    { no: 1004, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "月岡 恋鐘", name: "츠키오카 코가네", hex: "#f84cad", image: "shiny/Kogane_Tsukioka.webp" },
    { no: 1005, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "田中 摩美々", name: "타나카 마미미", hex: "#a846fb", image: "shiny/Mamimi_Tanaka.webp" },
    { no: 1006, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "白瀬 咲耶", name: "시라세 사쿠야", hex: "#006047", image: "shiny/Sakuya_Shirase.webp" },
    { no: 1007, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "三峰 結華", name: "미츠미네 유이카", hex: "#3b91c4", image: "shiny/Yuika_Mitsumine.webp" },
    { no: 1008, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "幽谷 霧子", name: "유코쿠 키리코", hex: "#d9f2ff", image: "shiny/Kiriko_Yukoku.webp" },
    { no: 1009, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "小宮 果穂", name: "코미야 카호", hex: "#e5461c", image: "shiny/Kaho_Komiya.webp" },
    { no: 1010, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "園田 智代子", name: "소노다 치요코", hex: "#f93b90", image: "shiny/Chiyoko_Sonoda.webp" },
    { no: 1011, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "西城 樹里", name: "사이죠 쥬리", hex: "#ffc602", image: "shiny/Juri_Saijo.webp" },
    { no: 1012, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "杜野 凛世", name: "모리노 린제", hex: "#89c3eb", image: "shiny/Rinze_Morino.webp" },
    { no: 1013, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "有栖川 夏葉", name: "아리스가와 나츠하", hex: "#90e667", image: "shiny/Natsuha_Arisugawa.webp" },
    { no: 1014, series: "shiny", attribute: "ALSTROEMERIA", group: "SHINY COLORS", jpName: "大崎 甘奈", name: "오사키 아마나", hex: "#f54275", image: "shiny/Amana_Osaki.webp" },
    { no: 1015, series: "shiny", attribute: "ALSTROEMERIA", group: "SHINY COLORS", jpName: "大崎 甜花", name: "오사키 텐카", hex: "#e75bec", image: "shiny/Tenka_Osaki.webp" },
    { no: 1016, series: "shiny", attribute: "ALSTROEMERIA", group: "SHINY COLORS", jpName: "桑山 千雪", name: "쿠와야마 치유키", hex: "#fafafa", image: "shiny/Chiyuki_Kuwayama.webp" },
    { no: 1017, series: "shiny", attribute: "Straylight", group: "SHINY COLORS", jpName: "芹沢 あさひ", name: "세리자와 아사히", hex: "#f30100", image: "shiny/Asahi_Serizawa.webp" },
    { no: 1018, series: "shiny", attribute: "Straylight", group: "SHINY COLORS", jpName: "黛 冬優子", name: "마유즈미 후유코", hex: "#5aff19", image: "shiny/Fuyuko_Mayuzumi.webp" },
    { no: 1019, series: "shiny", attribute: "Straylight", group: "SHINY COLORS", jpName: "和泉 愛依", name: "이즈미 메이", hex: "#ff00ff", image: "shiny/Mei_Izumi.webp" },
    { no: 1020, series: "shiny", attribute: "noctchill", group: "SHINY COLORS", jpName: "浅倉 透", name: "아사쿠라 토오루", hex: "#50d0d0", image: "shiny/Toru_Asakura.webp" },
    { no: 1021, series: "shiny", attribute: "noctchill", group: "SHINY COLORS", jpName: "樋口 円香", name: "히구치 마도카", hex: "#be1e3e", image: "shiny/Madoka_Higuchi.webp" },
    { no: 1022, series: "shiny", attribute: "noctchill", group: "SHINY COLORS", jpName: "福丸 小糸", name: "후쿠마루 코이토", hex: "#7967c3", image: "shiny/Koito_Fukumaru.webp" },
    { no: 1023, series: "shiny", attribute: "noctchill", group: "SHINY COLORS", jpName: "市川 雛菜", name: "이치카와 히나나", hex: "#ffc639", image: "shiny/Hinana_Ichikawa.webp" },
    { no: 1024, series: "shiny", attribute: "SHHis", group: "SHINY COLORS", jpName: "七草 にちか", name: "나나쿠사 니치카", hex: "#a6cdb6", image: "shiny/Nichika_Nanakusa.webp" },
    { no: 1025, series: "shiny", attribute: "SHHis", group: "SHINY COLORS", jpName: "緋田 美琴", name: "아케타 미코토", hex: "#760f10", image: "shiny/Mikoto_Aketa.webp" },
    { no: 1026, series: "shiny", attribute: "CoMETIK", group: "SHINY COLORS", jpName: "斑鳩 ルカ", name: "이카루가 루카", hex: "#35281f", image: "shiny/Luca_Ikaruga.webp" },
    { no: 1027, series: "shiny", attribute: "CoMETIK", group: "SHINY COLORS", jpName: "鈴木 羽那", name: "스즈키 하나", hex: "#e0b5d3", image: "shiny/Hana_Suzuki.webp" },
    { no: 1028, series: "shiny", attribute: "CoMETIK", group: "SHINY COLORS", jpName: "郁田 はるき", name: "이쿠타 하루키", hex: "#ead7a4", image: "shiny/Haruki_Ikuta.webp" }
  ];

  const imageFiles = {
    1001: "shiny/Mano_Sakuragi.webp",
    1002: "shiny/Hiori_Kazano.webp",
    1003: "shiny/Meguru_Hachimiya.webp",
    1004: "shiny/Kogane_Tsukioka.webp",
    1005: "shiny/Mamimi_Tanaka.webp",
    1006: "shiny/Sakuya_Shirase.webp",
    1007: "shiny/Yuika_Mitsumine.webp",
    1008: "shiny/Kiriko_Yukoku.webp",
    1009: "shiny/Kaho_Komiya.webp",
    1010: "shiny/Chiyoko_Sonoda.webp",
    1011: "shiny/Juri_Saijo.webp",
    1012: "shiny/Rinze_Morino.webp",
    1013: "shiny/Natsuha_Arisugawa.webp",
    1014: "shiny/Amana_Osaki.webp",
    1015: "shiny/Tenka_Osaki.webp",
    1016: "shiny/Chiyuki_Kuwayama.webp",
    1017: "shiny/Asahi_Serizawa.webp",
    1018: "shiny/Fuyuko_Mayuzumi.webp",
    1019: "shiny/Mei_Izumi.webp",
    1020: "shiny/Toru_Asakura.webp",
    1021: "shiny/Madoka_Higuchi.webp",
    1022: "shiny/Koito_Fukumaru.webp",
    1023: "shiny/Hinana_Ichikawa.webp",
    1024: "shiny/Nichika_Nanakusa.webp",
    1025: "shiny/Mikoto_Aketa.webp",
    1026: "shiny/Luca_Ikaruga.webp",
    1027: "shiny/Hana_Suzuki.webp",
    1028: "shiny/Haruki_Ikuta.webp"
  };

  const hairColors = {
    1001: "#C99F8E",
    1002: "#31363C",
    1003: "#F8E699",
    1004: "#967B7B",
    1005: "#4A3458",
    1006: "#433846",
    1007: "#3B3344",
    1008: "#B7AAB0",
    1009: "#CA797E",
    1010: "#866662",
    1011: "#F8DC9D",
    1012: "#535977",
    1013: "#EF9B8A",
    1014: "#9A5A5C",
    1015: "#A76868",
    1016: "#7C684E",
    1017: "#E1D0C7",
    1018: "#4D4D5C",
    1019: "#89502E",
    1020: "#A1869D",
    1021: "#98353E",
    1022: "#4D4A66",
    1023: "#D0AF9A",
    1024: "#919172",
    1025: "#985143",
    1026: "#403939",
    1027: "#B3B9EC",
    1028: "#E2BBB7"
  };

  window.IdolmasterQuizSeriesData = window.IdolmasterQuizSeriesData || {};
  window.IdolmasterQuizSeriesData.shiny = Object.freeze({
    idols: Object.freeze(idols),
    imageFiles: Object.freeze(imageFiles),
    hairColors: Object.freeze(hairColors)
  });
})();
