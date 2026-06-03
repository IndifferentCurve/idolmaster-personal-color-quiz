"use strict";

/*
  data.js
  Aggregates data/series/*.js into the compatibility export used by script.js.
  Load all series files before this file.
*/
(() => {
  const registeredSeries = window.IdolmasterQuizSeriesData || {};
  const requireSeries = (key) => {
    const data = registeredSeries[key];
    if (!data) throw new Error(`Missing quiz data series: ${key}`);
    return data;
  };

  const allstarsData = requireSeries("allstars");
  const millionData = requireSeries("million");
  const cinderellaData = requireSeries("cinderella");
  const shinyData = requireSeries("shiny");
  const gakuenData = requireSeries("gakuen");
  const sidemData = requireSeries("sidem");

  const ALLSTARS_IDOLS = allstarsData.idols;
  const MILLION_IDOLS = millionData.idols;
  const CINDERELLA_IDOLS = cinderellaData.idols;
  const SHINY_IDOLS = shinyData.idols;
  const GAKUEN_IDOLS = gakuenData.idols;
  const SIDEM_IDOLS = sidemData.idols;

  const ALLSTARS_IMAGE_FILES = allstarsData.imageFiles;
  const MILLION_IMAGE_FILES = millionData.imageFiles;
  const CINDERELLA_IMAGE_FILES = cinderellaData.imageFiles;
  const SHINY_IMAGE_FILES = shinyData.imageFiles;
  const GAKUEN_IMAGE_FILES = gakuenData.imageFiles;
  const SIDEM_IMAGE_FILES = sidemData.imageFiles;

  const ALLSTARS_HAIR_COLORS = allstarsData.hairColors;
  const MILLION_HAIR_COLORS = millionData.hairColors;
  const CINDERELLA_HAIR_COLORS = cinderellaData.hairColors;
  const SHINY_HAIR_COLORS = shinyData.hairColors;
  const GAKUEN_HAIR_COLORS = gakuenData.hairColors;
  const SIDEM_HAIR_COLORS = sidemData.hairColors;

  const SERIES_IDOLS = Object.freeze({
    allstars: ALLSTARS_IDOLS,
    million: MILLION_IDOLS,
    cinderella: CINDERELLA_IDOLS,
    shiny: SHINY_IDOLS,
    gakuen: GAKUEN_IDOLS,
    sidem: SIDEM_IDOLS
  });

  const SERIES_IMAGE_FILES = Object.freeze({
    allstars: ALLSTARS_IMAGE_FILES,
    million: MILLION_IMAGE_FILES,
    cinderella: CINDERELLA_IMAGE_FILES,
    shiny: SHINY_IMAGE_FILES,
    gakuen: GAKUEN_IMAGE_FILES,
    sidem: SIDEM_IMAGE_FILES
  });

  const SERIES_HAIR_COLORS = Object.freeze({
    allstars: ALLSTARS_HAIR_COLORS,
    million: MILLION_HAIR_COLORS,
    cinderella: CINDERELLA_HAIR_COLORS,
    shiny: SHINY_HAIR_COLORS,
    gakuen: GAKUEN_HAIR_COLORS,
    sidem: SIDEM_HAIR_COLORS
  });

  const sortByNo = (left, right) => left.no - right.no;
  const IDOLS = [...ALLSTARS_IDOLS, ...MILLION_IDOLS].sort(sortByNo);
  const ADDITIONAL_IDOLS = [...CINDERELLA_IDOLS, ...SHINY_IDOLS, ...GAKUEN_IDOLS, ...SIDEM_IDOLS];
  const ALL_IDOLS = [...IDOLS, ...ADDITIONAL_IDOLS];

  const IDOL_IMAGE_FILES = Object.freeze({
    ...ALLSTARS_IMAGE_FILES,
    ...MILLION_IMAGE_FILES,
    ...CINDERELLA_IMAGE_FILES,
    ...SHINY_IMAGE_FILES,
    ...GAKUEN_IMAGE_FILES,
    ...SIDEM_IMAGE_FILES
  });

  const HAIR_COLORS = Object.freeze({
    ...ALLSTARS_HAIR_COLORS,
    ...MILLION_HAIR_COLORS
  });

  const ADDITIONAL_HAIR_COLORS = Object.freeze({
    ...CINDERELLA_HAIR_COLORS,
    ...SHINY_HAIR_COLORS,
    ...GAKUEN_HAIR_COLORS,
    ...SIDEM_HAIR_COLORS
  });

  const seriesOrder = ["allstars", "million", "cinderella", "shiny", "gakuen", "sidem"];
  const seriesLabels = {
    allstars: "올스타즈",
    million: "밀리언 스타즈",
    cinderella: "신데렐라 걸즈",
    shiny: "샤이니 컬러즈",
    gakuen: "학원 아이돌마스터",
    sidem: "SideM",
    all: "전체"
  };

  const seriesIcons = {
    allstars: "assets/icons/allstars.svg",
    million: "assets/icons/millionstars.svg",
    cinderella: "assets/icons/cinderella.svg",
    shiny: "assets/icons/shinycolors.svg",
    gakuen: "assets/icons/gakuen.svg",
    sidem: "assets/icons/sidem.svg"
  };

  const attributeLabels = {
    "illumination STARS": "일루미네이션 스타즈",
    "L’Antica": "안티카",
    "Houkago Climax Girls": "방과후 클라이맥스 걸즈",
    ALSTROEMERIA: "알스트로메리아",
    Straylight: "스트레이라이트",
    noctchill: "녹칠",
    SHHis: "시즈",
    CoMETIK: "코메틱",
    "HATSUBOSHI GAKUEN": "하츠보시 학원",
    Cute: "Cute",
    Cool: "Cool",
    Passion: "Passion",
    Physical: "Physical",
    Mental: "Mental",
    Intelli: "Intelli"
  };

  const difficultyLabels = {
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    "very-hard": "Very Hard"
  };

  window.IdolmasterQuizData = Object.freeze({
    ALLSTARS_IDOLS,
    MILLION_IDOLS,
    SHINY_IDOLS,
    GAKUEN_IDOLS,
    CINDERELLA_IDOLS,
    SIDEM_IDOLS,
    SERIES_IDOLS,
    ALLSTARS_IMAGE_FILES,
    MILLION_IMAGE_FILES,
    SHINY_IMAGE_FILES,
    GAKUEN_IMAGE_FILES,
    CINDERELLA_IMAGE_FILES,
    SIDEM_IMAGE_FILES,
    SERIES_IMAGE_FILES,
    ALLSTARS_HAIR_COLORS,
    MILLION_HAIR_COLORS,
    SHINY_HAIR_COLORS,
    GAKUEN_HAIR_COLORS,
    CINDERELLA_HAIR_COLORS,
    SIDEM_HAIR_COLORS,
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
