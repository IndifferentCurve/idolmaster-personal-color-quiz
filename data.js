"use strict";

/*
  data.js
  Quiz data is grouped by series first, then by idol number.
  Million Live numbers follow the split idol asset manifests:
  ALLSTARS uses 1-13 and MILLION STARS uses 14-52.
  Image paths are relative to assets/idols/.
  Compatibility exports at the bottom keep script.js stable.
*/
(() => {
  const ALLSTARS_IDOLS = [
    { no: 1, series: "allstars", attribute: "Princess", group: "765PRO ALLSTARS", jpName: "天海 春香", name: "아마미 하루카", hex: "#e22b30", image: "allstars/Haruka_Amami.png" },
    { no: 2, series: "allstars", attribute: "Fairy", group: "765PRO ALLSTARS", jpName: "如月 千早", name: "키사라기 치하야", hex: "#2743d2", image: "allstars/Chihaya_Kisaragi.png" },
    { no: 3, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "星井 美希", name: "호시이 미키", hex: "#b4e04b", image: "allstars/Miki_Hoshii.png" },
    { no: 4, series: "allstars", attribute: "Princess", group: "765PRO ALLSTARS", jpName: "萩原 雪歩", name: "하기와라 유키호", hex: "#d3dde9", image: "allstars/Yukiho_Hagiwara.png" },
    { no: 5, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "高槻 やよい", name: "타카츠키 야요이", hex: "#f39939", image: "allstars/Yayoi_Takatsuki.png" },
    { no: 6, series: "allstars", attribute: "Princess", group: "765PRO ALLSTARS", jpName: "菊地 真", name: "키쿠치 마코토", hex: "#515558", image: "allstars/Makoto_Kikuchi.png" },
    { no: 7, series: "allstars", attribute: "Fairy", group: "765PRO ALLSTARS", jpName: "水瀬 伊織", name: "미나세 이오리", hex: "#fd99e1", image: "allstars/Iori_Minase.png" },
    { no: 8, series: "allstars", attribute: "Fairy", group: "765PRO ALLSTARS", jpName: "四条 貴音", name: "시죠 타카네", hex: "#a6126a", image: "allstars/Takane_Shijou.png" },
    { no: 9, series: "allstars", attribute: "Fairy", group: "765PRO ALLSTARS", jpName: "秋月 律子", name: "아키즈키 리츠코", hex: "#01a860", image: "allstars/Ritsuko_Akizuki.png" },
    { no: 10, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "三浦 あずさ", name: "미우라 아즈사", hex: "#9238be", image: "allstars/Azusa_Miura.png" },
    { no: 11, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "双海 亜美", name: "후타미 아미", hex: "#ffe43f", image: "allstars/Ami_Futami.png" },
    { no: 12, series: "allstars", attribute: "Angel", group: "765PRO ALLSTARS", jpName: "双海 真美", name: "후타미 마미", hex: "#ffe43f", image: "allstars/Mami_Futami.png" },
    { no: 13, series: "allstars", attribute: "Princess", group: "765PRO ALLSTARS", jpName: "我那覇 響", name: "가나하 히비키", hex: "#01adb9", image: "allstars/Hibiki_Ganaha.png" }
  ];

  const MILLION_IDOLS = [
    { no: 14, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "春日 未来", name: "카스가 미라이", hex: "#ea5b76", image: "million/Mirai_Kasuga.png" },
    { no: 15, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "最上 静香", name: "모가미 시즈카", hex: "#6495cf", image: "million/Shizuka_Mogami.png" },
    { no: 16, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "伊吹 翼", name: "이부키 츠바사", hex: "#fed552", image: "million/Tsubasa_Ibuki.png" },
    { no: 17, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "田中 琴葉", name: "타나카 코토하", hex: "#92cfbb", image: "million/Kotoha_Tanaka.png" },
    { no: 18, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "島原 エレナ", name: "시마바라 엘레나", hex: "#9bce92", image: "million/Elena_Shimabara.png" },
    { no: 19, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "佐竹 美奈子", name: "사타케 미나코", hex: "#58a6dc", image: "million/Minako_Satake.png" },
    { no: 20, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "所 恵美", name: "토코로 메구미", hex: "#454341", image: "million/Megumi_Tokoro.png" },
    { no: 21, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "徳川 まつり", name: "토쿠가와 마츠리", hex: "#5abfb7", image: "million/Matsuri_Tokugawa.png" },
    { no: 22, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "箱崎 星梨花", name: "하코자키 세리카", hex: "#ed90ba", image: "million/Serika_Hakozaki.png" },
    { no: 23, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "野々原 茜", name: "노노하라 아카네", hex: "#eb613f", image: "million/Akane_Nonohara.png" },
    { no: 24, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "望月 杏奈", name: "모치즈키 안나", hex: "#7e6ca8", image: "million/Anna_Mochizuki.png" },
    { no: 25, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "ロコ", name: "로코", hex: "#fff03c", image: "million/Roco.png" },
    { no: 26, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "七尾 百合子", name: "나나오 유리코", hex: "#c7b83c", image: "million/Yuriko_Nanao.png" },
    { no: 27, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "高山 紗代子", name: "타카야마 사요코", hex: "#7f6575", image: "million/Sayoko_Takayama.png" },
    { no: 28, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "松田 亜利沙", name: "마츠다 아리사", hex: "#b54461", image: "million/Arisa_Matsuda.png" },
    { no: 29, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "高坂 海美", name: "코사카 우미", hex: "#e9739b", image: "million/Umi_Kousaka.png" },
    { no: 30, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "中谷 育", name: "나카타니 이쿠", hex: "#f7e78e", image: "million/Iku_Nakatani.png" },
    { no: 31, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "天空橋 朋花", name: "텐쿠바시 토모카", hex: "#bee3e3", image: "million/Tomoka_Tenkubashi.png" },
    { no: 32, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "エミリー スチュアート", name: "에밀리 스튜어트", hex: "#554171", image: "million/Emily_Stewart.png" },
    { no: 33, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "北沢 志保", name: "키타자와 시호", hex: "#afa690", image: "million/Shiho_Kitazawa.png" },
    { no: 34, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "舞浜 歩", name: "마이하마 아유무", hex: "#e25a9b", image: "million/Ayumu_Maihama.png" },
    { no: 35, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "木下 ひなた", name: "키노시타 히나타", hex: "#d1342c", image: "million/Hinata_Kinoshita.png" },
    { no: 36, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "矢吹 可奈", name: "야부키 카나", hex: "#f5ad3b", image: "million/Kana_Yabuki.png" },
    { no: 37, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "横山 奈緒", name: "요코야마 나오", hex: "#788bc5", image: "million/Nao_Yokoyama.png" },
    { no: 38, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "二階堂 千鶴", name: "니카이도 치즈루", hex: "#f19557", image: "million/Chizuru_Nikaido.png" },
    { no: 39, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "馬場 このみ", name: "바바 코노미", hex: "#f1becb", image: "million/Konomi_Baba.png" },
    { no: 40, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "大神 環", name: "오오가미 타마키", hex: "#ee762e", image: "million/Tamaki_Ogami.png" },
    { no: 41, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "豊川 風花", name: "토요카와 후카", hex: "#7278a8", image: "million/Fuka_Toyokawa.png" },
    { no: 42, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "宮尾 美也", name: "미야오 미야", hex: "#d7a96b", image: "million/Miya_Miake.png" },
    { no: 43, series: "million", attribute: "Princess", group: "MILLION LIVE! THEATER", jpName: "福田 のり子", name: "후쿠다 노리코", hex: "#eceb70", image: "million/Noriko_Fukuda.png" },
    { no: 44, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "真壁 瑞希", name: "마카베 미즈키", hex: "#99b7dc", image: "million/Mizuki_Makabe.png" },
    { no: 45, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "篠宮 可憐", name: "시노미야 카렌", hex: "#b63b40", image: "million/Karen_Shinomiya.png" },
    { no: 46, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "百瀬 莉緒", name: "모모세 리오", hex: "#f19591", image: "million/Rio_Momose.png" },
    { no: 47, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "永吉 昴", name: "나가요시 스바루", hex: "#aeb49c", image: "million/Subaru_Nagayoshi.png" },
    { no: 48, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "北上 麗花", name: "키타카미 레이카", hex: "#6bb6b0", image: "million/Reika_Kitakami.png" },
    { no: 49, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "周防 桃子", name: "스오 모모코", hex: "#efb864", image: "million/Momoko_Suou.png" },
    { no: 50, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "ジュリア", name: "줄리아", hex: "#d7385f", image: "million/Julia.png" },
    { no: 51, series: "million", attribute: "Fairy", group: "MILLION LIVE! THEATER", jpName: "白石 紬", name: "시라이시 츠무기", hex: "#ebe1ff", image: "million/Tsumugi_Shirokane.png" },
    { no: 52, series: "million", attribute: "Angel", group: "MILLION LIVE! THEATER", jpName: "桜守 歌織", name: "사쿠라모리 카오리", hex: "#274079", image: "million/Kaori_Sakuramori.png" }
  ];

  const SHINY_IDOLS = [
    { no: 1001, series: "shiny", attribute: "illumination STARS", group: "SHINY COLORS", jpName: "櫻木 真乃", name: "사쿠라기 마노", hex: "#ffbad6", image: "shiny/Mano_Sakuragi.png" },
    { no: 1002, series: "shiny", attribute: "illumination STARS", group: "SHINY COLORS", jpName: "風野 灯織", name: "카자노 히오리", hex: "#144384", image: "shiny/Hiori_Kazano.png" },
    { no: 1003, series: "shiny", attribute: "illumination STARS", group: "SHINY COLORS", jpName: "八宮 めぐる", name: "하치미야 메구루", hex: "#ffe012", image: "shiny/Meguru_Hachimiya.png" },
    { no: 1004, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "月岡 恋鐘", name: "츠키오카 코가네", hex: "#f84cad", image: "shiny/Kogane_Tsukioka.png" },
    { no: 1005, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "田中 摩美々", name: "타나카 마미미", hex: "#a846fb", image: "shiny/Mamimi_Tanaka.png" },
    { no: 1006, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "白瀬 咲耶", name: "시라세 사쿠야", hex: "#006047", image: "shiny/Sakuya_Shirase.png" },
    { no: 1007, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "三峰 結華", name: "미츠미네 유이카", hex: "#3b91c4", image: "shiny/Yuika_Mitsumine.png" },
    { no: 1008, series: "shiny", attribute: "L’Antica", group: "SHINY COLORS", jpName: "幽谷 霧子", name: "유코쿠 키리코", hex: "#d9f2ff", image: "shiny/Kiriko_Yukoku.png" },
    { no: 1009, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "小宮 果穂", name: "코미야 카호", hex: "#e5461c", image: "shiny/Kaho_Komiya.png" },
    { no: 1010, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "園田 智代子", name: "소노다 치요코", hex: "#f93b90", image: "shiny/Chiyoko_Sonoda.png" },
    { no: 1011, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "西城 樹里", name: "사이죠 쥬리", hex: "#ffc602", image: "shiny/Juri_Saijo.png" },
    { no: 1012, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "杜野 凛世", name: "모리노 린제", hex: "#89c3eb", image: "shiny/Rinze_Morino.png" },
    { no: 1013, series: "shiny", attribute: "Houkago Climax Girls", group: "SHINY COLORS", jpName: "有栖川 夏葉", name: "아리스가와 나츠하", hex: "#90e667", image: "shiny/Natsuha_Arisugawa.png" },
    { no: 1014, series: "shiny", attribute: "ALSTROEMERIA", group: "SHINY COLORS", jpName: "大崎 甘奈", name: "오사키 아마나", hex: "#f54275", image: "shiny/Amana_Osaki.png" },
    { no: 1015, series: "shiny", attribute: "ALSTROEMERIA", group: "SHINY COLORS", jpName: "大崎 甜花", name: "오사키 텐카", hex: "#e75bec", image: "shiny/Tenka_Osaki.png" },
    { no: 1016, series: "shiny", attribute: "ALSTROEMERIA", group: "SHINY COLORS", jpName: "桑山 千雪", name: "쿠와야마 치유키", hex: "#fafafa", image: "shiny/Chiyuki_Kuwayama.png" },
    { no: 1017, series: "shiny", attribute: "Straylight", group: "SHINY COLORS", jpName: "芹沢 あさひ", name: "세리자와 아사히", hex: "#f30100", image: "shiny/Asahi_Serizawa.png" },
    { no: 1018, series: "shiny", attribute: "Straylight", group: "SHINY COLORS", jpName: "黛 冬優子", name: "마유즈미 후유코", hex: "#5aff19", image: "shiny/Fuyuko_Mayuzumi.png" },
    { no: 1019, series: "shiny", attribute: "Straylight", group: "SHINY COLORS", jpName: "和泉 愛依", name: "이즈미 메이", hex: "#ff00ff", image: "shiny/Mei_Izumi.png" },
    { no: 1020, series: "shiny", attribute: "noctchill", group: "SHINY COLORS", jpName: "浅倉 透", name: "아사쿠라 토오루", hex: "#50d0d0", image: "shiny/Toru_Asakura.png" },
    { no: 1021, series: "shiny", attribute: "noctchill", group: "SHINY COLORS", jpName: "樋口 円香", name: "히구치 마도카", hex: "#be1e3e", image: "shiny/Madoka_Higuchi.png" },
    { no: 1022, series: "shiny", attribute: "noctchill", group: "SHINY COLORS", jpName: "福丸 小糸", name: "후쿠마루 코이토", hex: "#7967c3", image: "shiny/Koito_Fukumaru.png" },
    { no: 1023, series: "shiny", attribute: "noctchill", group: "SHINY COLORS", jpName: "市川 雛菜", name: "이치카와 히나나", hex: "#ffc639", image: "shiny/Hinana_Ichikawa.png" },
    { no: 1024, series: "shiny", attribute: "SHHis", group: "SHINY COLORS", jpName: "七草 にちか", name: "나나쿠사 니치카", hex: "#a6cdb6", image: "shiny/Nichika_Nanakusa.png" },
    { no: 1025, series: "shiny", attribute: "SHHis", group: "SHINY COLORS", jpName: "緋田 美琴", name: "아케타 미코토", hex: "#760f10", image: "shiny/Mikoto_Aketa.png" },
    { no: 1026, series: "shiny", attribute: "CoMETIK", group: "SHINY COLORS", jpName: "斑鳩 ルカ", name: "이카루가 루카", hex: "#35281f", image: "shiny/Luca_Ikaruga.png" },
    { no: 1027, series: "shiny", attribute: "CoMETIK", group: "SHINY COLORS", jpName: "鈴木 羽那", name: "스즈키 하나", hex: "#e0b5d3", image: "shiny/Hana_Suzuki.png" },
    { no: 1028, series: "shiny", attribute: "CoMETIK", group: "SHINY COLORS", jpName: "郁田 はるき", name: "이쿠타 하루키", hex: "#ead7a4", image: "shiny/Haruki_Ikuta.png" }
  ];

  const GAKUEN_IDOLS = [
    { no: 2001, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "花海 咲季", name: "하나미 사키", hex: "#e30f25", image: "gakuen/Saki_Hanami.png" },
    { no: 2002, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "月村 手毬", name: "츠키무라 테마리", hex: "#0c7bbb", image: "gakuen/Temari_Tsukimura.png" },
    { no: 2003, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "藤田 ことね", name: "후지타 코토네", hex: "#f8c112", image: "gakuen/Kotone_Fujita.png" },
    { no: 2004, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "有村 麻央", name: "아리무라 마오", hex: "#7f1184", image: "gakuen/Mao_Arimura.png" },
    { no: 2005, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "葛城 リーリヤ", name: "카츠라기 리리야", hex: "#eafdff", image: "gakuen/Lilja_Katsuragi.png" },
    { no: 2006, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "倉本 千奈", name: "쿠라모토 치나", hex: "#f68b1f", image: "gakuen/China_Kuramoto.png" },
    { no: 2007, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "紫雲 清夏", name: "시운 스미카", hex: "#7cfc00", image: "gakuen/Sumika_Shiun.png" },
    { no: 2008, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "篠澤 広", name: "시노사와 히로", hex: "#00afcc", image: "gakuen/Hiro_Shinosawa.png" },
    { no: 2009, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "姫崎 莉波", name: "히메사키 리나미", hex: "#f6adc6", image: "gakuen/Rinami_Himesaki.png" },
    { no: 2010, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "花海 佑芽", name: "하나미 우메", hex: "#ea533a", image: "gakuen/Ume_Hanami.png" },
    { no: 2011, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "秦谷 美鈴", name: "하타야 미스즈", hex: "#7a99cf", image: "gakuen/Misuzu_Hataya.png" },
    { no: 2012, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "十王 星南", name: "주오 세나", hex: "#f6ae54", image: "gakuen/Sena_Juo.png" },
    { no: 2013, series: "gakuen", attribute: "HATSUBOSHI GAKUEN", group: "GAKUEN IDOLM@STER", jpName: "雨夜 燕", name: "아마야 츠바메", hex: "#7b68ee", image: "gakuen/Tsubame_Amaya.png" }
  ];

  const SERIES_IDOLS = Object.freeze({
    allstars: ALLSTARS_IDOLS,
    million: MILLION_IDOLS,
    shiny: SHINY_IDOLS,
    gakuen: GAKUEN_IDOLS
  });

  const ALLSTARS_IMAGE_FILES = {
    1: "allstars/Haruka_Amami.png",
    2: "allstars/Chihaya_Kisaragi.png",
    3: "allstars/Miki_Hoshii.png",
    4: "allstars/Yukiho_Hagiwara.png",
    5: "allstars/Yayoi_Takatsuki.png",
    6: "allstars/Makoto_Kikuchi.png",
    7: "allstars/Iori_Minase.png",
    8: "allstars/Takane_Shijou.png",
    9: "allstars/Ritsuko_Akizuki.png",
    10: "allstars/Azusa_Miura.png",
    11: "allstars/Ami_Futami.png",
    12: "allstars/Mami_Futami.png",
    13: "allstars/Hibiki_Ganaha.png"
  };

  const MILLION_IMAGE_FILES = {
    14: "million/Mirai_Kasuga.png",
    15: "million/Shizuka_Mogami.png",
    16: "million/Tsubasa_Ibuki.png",
    17: "million/Kotoha_Tanaka.png",
    18: "million/Elena_Shimabara.png",
    19: "million/Minako_Satake.png",
    20: "million/Megumi_Tokoro.png",
    21: "million/Matsuri_Tokugawa.png",
    22: "million/Serika_Hakozaki.png",
    23: "million/Akane_Nonohara.png",
    24: "million/Anna_Mochizuki.png",
    25: "million/Roco.png",
    26: "million/Yuriko_Nanao.png",
    27: "million/Sayoko_Takayama.png",
    28: "million/Arisa_Matsuda.png",
    29: "million/Umi_Kousaka.png",
    30: "million/Iku_Nakatani.png",
    31: "million/Tomoka_Tenkubashi.png",
    32: "million/Emily_Stewart.png",
    33: "million/Shiho_Kitazawa.png",
    34: "million/Ayumu_Maihama.png",
    35: "million/Hinata_Kinoshita.png",
    36: "million/Kana_Yabuki.png",
    37: "million/Nao_Yokoyama.png",
    38: "million/Chizuru_Nikaido.png",
    39: "million/Konomi_Baba.png",
    40: "million/Tamaki_Ogami.png",
    41: "million/Fuka_Toyokawa.png",
    42: "million/Miya_Miake.png",
    43: "million/Noriko_Fukuda.png",
    44: "million/Mizuki_Makabe.png",
    45: "million/Karen_Shinomiya.png",
    46: "million/Rio_Momose.png",
    47: "million/Subaru_Nagayoshi.png",
    48: "million/Reika_Kitakami.png",
    49: "million/Momoko_Suou.png",
    50: "million/Julia.png",
    51: "million/Tsumugi_Shirokane.png",
    52: "million/Kaori_Sakuramori.png"
  };

  const SHINY_IMAGE_FILES = {
    1001: "shiny/Mano_Sakuragi.png",
    1002: "shiny/Hiori_Kazano.png",
    1003: "shiny/Meguru_Hachimiya.png",
    1004: "shiny/Kogane_Tsukioka.png",
    1005: "shiny/Mamimi_Tanaka.png",
    1006: "shiny/Sakuya_Shirase.png",
    1007: "shiny/Yuika_Mitsumine.png",
    1008: "shiny/Kiriko_Yukoku.png",
    1009: "shiny/Kaho_Komiya.png",
    1010: "shiny/Chiyoko_Sonoda.png",
    1011: "shiny/Juri_Saijo.png",
    1012: "shiny/Rinze_Morino.png",
    1013: "shiny/Natsuha_Arisugawa.png",
    1014: "shiny/Amana_Osaki.png",
    1015: "shiny/Tenka_Osaki.png",
    1016: "shiny/Chiyuki_Kuwayama.png",
    1017: "shiny/Asahi_Serizawa.png",
    1018: "shiny/Fuyuko_Mayuzumi.png",
    1019: "shiny/Mei_Izumi.png",
    1020: "shiny/Toru_Asakura.png",
    1021: "shiny/Madoka_Higuchi.png",
    1022: "shiny/Koito_Fukumaru.png",
    1023: "shiny/Hinana_Ichikawa.png",
    1024: "shiny/Nichika_Nanakusa.png",
    1025: "shiny/Mikoto_Aketa.png",
    1026: "shiny/Luca_Ikaruga.png",
    1027: "shiny/Hana_Suzuki.png",
    1028: "shiny/Haruki_Ikuta.png"
  };

  const GAKUEN_IMAGE_FILES = {
    2001: "gakuen/Saki_Hanami.png",
    2002: "gakuen/Temari_Tsukimura.png",
    2003: "gakuen/Kotone_Fujita.png",
    2004: "gakuen/Mao_Arimura.png",
    2005: "gakuen/Lilja_Katsuragi.png",
    2006: "gakuen/China_Kuramoto.png",
    2007: "gakuen/Sumika_Shiun.png",
    2008: "gakuen/Hiro_Shinosawa.png",
    2009: "gakuen/Rinami_Himesaki.png",
    2010: "gakuen/Ume_Hanami.png",
    2011: "gakuen/Misuzu_Hataya.png",
    2012: "gakuen/Sena_Juo.png",
    2013: "gakuen/Tsubame_Amaya.png"
  };

  const SERIES_IMAGE_FILES = Object.freeze({
    allstars: ALLSTARS_IMAGE_FILES,
    million: MILLION_IMAGE_FILES,
    shiny: SHINY_IMAGE_FILES,
    gakuen: GAKUEN_IMAGE_FILES
  });

  const ALLSTARS_HAIR_COLORS = {
    1: "#8e5049",
    2: "#28355a",
    3: "#f2e48e",
    4: "#c8925e",
    5: "#d88445",
    6: "#3d3c46",
    7: "#9a6643",
    8: "#d9d8e6",
    9: "#8a6043",
    10: "#303a6c",
    11: "#a17542",
    12: "#a17542",
    13: "#242633"
  };

  const MILLION_HAIR_COLORS = {
    14: "#754842",
    15: "#283257",
    16: "#d1a649",
    17: "#a04c41",
    18: "#cbdaa2",
    19: "#674d3f",
    20: "#9a6d3d",
    21: "#72b0b0",
    22: "#b58a61",
    23: "#e46a47",
    24: "#675e8f",
    25: "#c9c0b8",
    26: "#4973a2",
    27: "#8c8179",
    28: "#4c2626",
    29: "#9a6a35",
    30: "#4c352f",
    31: "#d4ae76",
    32: "#e2c95d",
    33: "#826a5c",
    34: "#ea60ab",
    35: "#683f32",
    36: "#cf843d",
    37: "#845743",
    38: "#5b3c24",
    39: "#a26c3f",
    40: "#d96b45",
    41: "#576496",
    42: "#b9915a",
    43: "#e2be4f",
    44: "#dbc2e5",
    45: "#d8b863",
    46: "#e7bb5d",
    47: "#868159",
    48: "#334a5a",
    49: "#9b764b",
    50: "#b1382f",
    51: "#d6e7fa",
    52: "#95887c"
  };

  const SHINY_HAIR_COLORS = {
    1001: "#c99f8e",
    1002: "#31363c",
    1003: "#f8e699",
    1004: "#967b7b",
    1005: "#4a3458",
    1006: "#433846",
    1007: "#3b3344",
    1008: "#b7aab0",
    1009: "#ca797e",
    1010: "#866662",
    1011: "#f8dc9d",
    1012: "#535977",
    1013: "#ef9b8a",
    1014: "#9a5a5c",
    1015: "#a76868",
    1016: "#7c684e",
    1017: "#e1d0c7",
    1018: "#4d4d5c",
    1019: "#89502e",
    1020: "#a1869d",
    1021: "#98353e",
    1022: "#4d4a66",
    1023: "#d0af9a",
    1024: "#919172",
    1025: "#985143",
    1026: "#403939",
    1027: "#b3b9ec",
    1028: "#e2bbb7"
  };

  const GAKUEN_HAIR_COLORS = {
    2001: "#cf7e7e",
    2002: "#5f6e73",
    2003: "#e7c95e",
    2004: "#d5a9b1",
    2005: "#e6dbdb",
    2006: "#887b70",
    2007: "#e7a25b",
    2008: "#ebdfcc",
    2009: "#d3a495",
    2010: "#b47a63",
    2011: "#5e577d",
    2012: "#fff1dc",
    2013: "#83818d"
  };

  const SERIES_HAIR_COLORS = Object.freeze({
    allstars: ALLSTARS_HAIR_COLORS,
    million: MILLION_HAIR_COLORS,
    shiny: SHINY_HAIR_COLORS,
    gakuen: GAKUEN_HAIR_COLORS
  });

  const sortByNo = (left, right) => left.no - right.no;
  const IDOLS = [...ALLSTARS_IDOLS, ...MILLION_IDOLS].sort(sortByNo);
  const ADDITIONAL_IDOLS = [...SHINY_IDOLS, ...GAKUEN_IDOLS].sort(sortByNo);
  const ALL_IDOLS = [...IDOLS, ...ADDITIONAL_IDOLS];

  const IDOL_IMAGE_FILES = Object.freeze({
    ...ALLSTARS_IMAGE_FILES,
    ...MILLION_IMAGE_FILES,
    ...SHINY_IMAGE_FILES,
    ...GAKUEN_IMAGE_FILES
  });

  const HAIR_COLORS = Object.freeze({
    ...ALLSTARS_HAIR_COLORS,
    ...MILLION_HAIR_COLORS
  });

  const ADDITIONAL_HAIR_COLORS = Object.freeze({
    ...SHINY_HAIR_COLORS,
    ...GAKUEN_HAIR_COLORS
  });

  const seriesOrder = ["allstars","million","shiny","gakuen"];
  const seriesLabels = {
      "allstars": "올스타즈",
      "million": "밀리언 스타즈",
      "shiny": "샤이니 컬러즈",
      "gakuen": "학원 아이돌마스터",
      "all": "전체"
  };

  const seriesIcons = {
      "allstars": "assets/icons/allstars.svg",
      "million": "assets/icons/millionstars.svg",
      "shiny": "assets/icons/shinycolors.svg",
      "gakuen": "assets/icons/gakuen.svg"
  };

  const attributeLabels = {
      "illumination STARS": "일루미네이션 스타즈",
      "L’Antica": "안티카",
      "Houkago Climax Girls": "방과후 클라이맥스 걸즈",
      "ALSTROEMERIA": "알스트로메리아",
      "Straylight": "스트레이라이트",
      "noctchill": "녹칠",
      "SHHis": "시즈",
      "CoMETIK": "코메틱",
      "HATSUBOSHI GAKUEN": "하츠보시 학원"
  };

  const difficultyLabels = {
      "easy": "Easy",
      "normal": "Normal",
      "hard": "Hard",
      "very-hard": "Very Hard"
  };

  window.IdolmasterQuizData = Object.freeze({
    ALLSTARS_IDOLS,
    MILLION_IDOLS,
    SHINY_IDOLS,
    GAKUEN_IDOLS,
    SERIES_IDOLS,
    ALLSTARS_IMAGE_FILES,
    MILLION_IMAGE_FILES,
    SHINY_IMAGE_FILES,
    GAKUEN_IMAGE_FILES,
    SERIES_IMAGE_FILES,
    ALLSTARS_HAIR_COLORS,
    MILLION_HAIR_COLORS,
    SHINY_HAIR_COLORS,
    GAKUEN_HAIR_COLORS,
    SERIES_HAIR_COLORS,
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
  });
})();
