<p align="center">
  <strong>한국어</strong> · <a href="README.ja.md">日本語</a> · <a href="README.en.md">English</a>
</p>

# 아이돌마스터 이미지 컬러 맞추기

아이돌 일러스트를 보고 그 아이돌의 이미지 컬러를 고르는 팬메이드 웹 퀴즈입니다.
6개 시리즈 332명을 수록했고, 한국어·일본어·영어를 지원합니다.

**플레이:** [GitHub Pages](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/) · [Render](https://idolmaster-color-quiz.onrender.com/)

![메인 화면](docs/screenshots/home.png)

## 주요 기능

- **출제 범위 선택** — 전체, 시리즈별(복수 선택), 또는 아이돌을 한 명씩 고르는 커스텀 모드.
- **문항 수** — 10문항, 20문항, 전체, 또는 직접 입력.
- **4단계 난이도** — 보기 색이 정답에 얼마나 가까운지가 단계별로 달라집니다(아래 표).
- **정답 연출** — 답을 고르면 실제 이미지 컬러가 일러스트 뒤에서 빛나고, 연속 정답은 콤보로 표시됩니다.
- **컬러 리포트** — 점수, 맞춘 개수, 평균 응답시간, 이번 게임의 컬러, 출제 아이돌을 한 장으로 정리합니다. PNG로 저장하거나 공유할 수 있습니다.
- **오답 노트** — 틀린 문제의 내 선택과 정답을 비교하고, 카드를 누르면 아이돌 상세 정보를 볼 수 있습니다.
- **컬러 가이드** — 332명 전원의 이미지 컬러를 시리즈별로 보고 검색할 수 있습니다. HEX 코드를 복사하거나 일러스트를 크게 볼 수 있습니다.
- **편의 기능** — 라이트·다크 테마, 모바일 대응, 숫자키로 보기 선택. 메인의 컬러 스트립에서 칩을 누르면 해당 아이돌 정보가 열립니다.

## 난이도와 점수

| 난이도 | 보기 수 | 제한 시간 | 만점 | 오답 보기 |
| --- | ---: | ---: | ---: | --- |
| Easy | 5 | 30초 | 500 | 색상환에서 멀리 떨어진 색 |
| Normal | 6 | 25초 | 1000 | 비슷한 계열의 색 + 머리색 함정 |
| Hard | 6 | 20초 | 1500 | 색조·톤이 가까운 색 + 머리색 함정 |
| Very Hard | 6 | 15초 | 2000 | 아주 가까운 색 + 다른 아이돌의 실제 컬러 + 머리색 함정 |

- 정답 하나의 점수는 `만점 ÷ 문항 수`이며, 답한 속도와 관계없이 같습니다.
- 제한 시간 안에 답하지 못하면 오답으로 처리됩니다.
- 오답 보기는 CIELAB 색차를 기준으로 정답·다른 보기와 일정 거리 이상 떨어지도록 만듭니다.

## 조작

| 키 | 동작 |
| --- | --- |
| `1`–`6` | 해당 번호의 보기 선택 |
| `Enter` | 다음 문제로 (답한 뒤 확인 버튼에 포커스) |
| `Esc` | 열린 창 닫기 |

## 검색

커스텀 모드와 컬러 가이드의 검색창은 이름(한·일·영), 가나, 로마자, 유닛, 속성, HEX 코드를 모두 찾습니다.

| 입력 예 | 의미 |
| --- | --- |
| `haruka`, `はるか`, `ハルカ` | 표기가 달라도 같은 아이돌 |
| `#e22b30` | HEX 코드로 찾기 |
| `765 + princess` | 모든 조건을 만족 (`+`) |
| `chihaya or miki` | 하나라도 만족 (`or`) |

## 수록 시리즈

| 시리즈 | 인원 |
| --- | ---: |
| 765PRO ALLSTARS | 13명 |
| 밀리언 스타즈 | 39명 |
| 신데렐라 걸즈 | 190명 |
| 샤이니 컬러즈 | 28명 |
| 학원 아이돌마스터 | 13명 |
| SideM | 49명 |
| **합계** | **332명** |

## 로컬 실행

빌드 과정이 없는 정적 사이트입니다. 저장소 폴더에서 정적 파일 서버를 실행합니다.

```bash
python -m http.server 8765
```

브라우저에서 `http://localhost:8765/`에 접속합니다.

## 배포

- **GitHub Pages** — `main` 브랜치 루트를 그대로 배포합니다. `main`에 푸시하면 갱신됩니다.
- **Render** — 저장소의 [`render.yaml`](render.yaml)을 Blueprint로 불러오면 Static Site로 배포됩니다. 사이트에 필요한 파일만 `dist/`로 모아 올리고, `reference_assets/`는 제외합니다.

## 프로젝트 구조

```
index.html            화면 마크업
css/style.css         디자인 토큰·레이아웃·테마
js/lang.js            한국어·일본어·영어 문구
js/color.js           색 변환·지각 색차(CIELAB)
js/search.js          이름·가나·로마자 검색
js/choices.js         난이도별 보기 색 생성
js/app.js             게임 진행·화면 전환·점수
js/guide.js           컬러 가이드·일러스트 상세
js/result-report.js   결과 리포트·공유 이미지
js/ui.js              메인 컬러 스트립·숫자키 선택
data/series/*.js      시리즈별 아이돌 데이터
data/quiz-data.js     시리즈 데이터 통합
assets/               일러스트·얼굴·폰트·아이콘
reference_assets/     원본·가공 자료 (배포 제외)
docs/screenshots/     README 이미지
```

스크립트는 모듈이 아닌 일반 스크립트이며, `index.html`에 적힌 순서대로 불러옵니다. 파일을 추가할 때는 이 순서를 지켜 주세요.

### 폰트 서브셋

`assets/fonts/`의 폰트는 화면에 쓰이는 글자만 남긴 Noto Sans KR·JP 서브셋입니다. 새 이름이나 문구를 추가했다면 다시 만들어야 합니다.

```bash
pip install fonttools brotli
python reference_assets/font-subsets/build.py --kr NotoSansKR-VariableFont_wght.ttf --jp NotoSansJP-VariableFont_wght.ttf
```

## 출처

| 항목 | 출처 |
| --- | --- |
| 이미지 컬러 HEX | [imas-db](https://imas-db.jp/misc/color.html) |
| 765PRO ALLSTARS·밀리언 스타즈 이미지 | [MLTD Database](https://imas.gamedbs.jp/mlth/) |
| 신데렐라 걸즈 이미지 | [아이돌마스터 포털](https://idolmaster-official.jp/cinderellagirls) |
| 샤이니 컬러즈 이미지 | [공식 사이트](https://shinycolors.idolmaster.jp/) |
| 학원 아이돌마스터 이미지 | [공식 사이트](https://gakuen.idolmaster-official.jp/) |
| SideM 이미지 | [아이돌마스터 포털](https://idolmaster-official.jp/sidem/) |
| 신데렐라 걸즈 영문명 | [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters) |
| 폰트 | [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR) · [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) (SIL OFL 1.1) |

파일별 출처와 가공 기록은 [`assets`](assets/) 아래의 README와 manifest 파일에 있습니다.

## 안내

이 프로젝트는 비공식 팬메이드 퀴즈입니다. THE IDOLM@STER 및 관련 시리즈의 권리는 각 권리자에게 있습니다.
