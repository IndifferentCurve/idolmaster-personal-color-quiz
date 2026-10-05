<p align="center">
  <strong>한국어</strong> · <a href="README.ja.md">日本語</a> · <a href="README.en.md">English</a>
</p>

# 아이돌마스터 이미지 컬러 맞추기

일러스트를 보고 그 아이돌의 이미지 컬러를 맞히는 퀴즈예요.
6개 시리즈, 332명이 들어 있고 한국어, 일본어, 영어로 할 수 있어요.

바로 해보기: [GitHub Pages](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/) · [Render](https://idolmaster-color-quiz.onrender.com/)

![메인 화면](docs/screenshots/home.png)

## 어떻게 하나요

시리즈를 고르고 문항 수와 난이도를 정한 다음 시작하면 돼요.
좋아하는 아이돌만 골라서 내고 싶다면 '커스텀'에서 한 명씩 고를 수도 있어요.

문제마다 일러스트 옆에 색이 몇 개 나오는데, 그중에서 이미지 컬러를 고르면 됩니다.
답을 고르면 정답 색이 일러스트 뒤로 은은하게 깔려서, 틀려도 원래 무슨 색이었는지 바로 알 수 있어요.

## 난이도

어려워질수록 오답 색이 정답이랑 비슷해지고 시간도 줄어들어요.
Normal부터는 머리색이랑 비슷한 색이 하나씩 섞여 나오니까 조심하세요. Very Hard에서는 다른 아이돌의 진짜 이미지 컬러까지 나와요.

| 난이도 | 보기 | 제한 시간 | 만점 |
| --- | ---: | ---: | ---: |
| Easy | 5개 | 30초 | 500 |
| Normal | 6개 | 25초 | 1000 |
| Hard | 6개 | 20초 | 1500 |
| Very Hard | 6개 | 15초 | 2000 |

점수는 맞힌 개수로만 정해져요. 빨리 답한다고 점수를 더 주지는 않고, 시간 안에 못 고르면 틀린 걸로 쳐요.

## 게임이 끝나면

결과 화면에서 점수와 이번 판에 나온 색들을 한눈에 볼 수 있고, 이미지로 저장하거나 공유할 수도 있어요.
틀린 문제는 오답 노트에 모아 두는데, 카드를 누르면 그 아이돌의 일러스트와 컬러를 크게 볼 수 있어요.

## 컬러 가이드

퀴즈 말고 그냥 색을 찾아보고 싶을 때 쓰는 페이지예요.
332명 전부의 이미지 컬러를 시리즈별로 볼 수 있고, HEX 코드를 누르면 복사돼요.

## 알아두면 편한 것

- 키보드 1~6으로 보기를 고를 수 있어요. 답한 다음에는 Enter로 다음 문제로 넘어가요.
- 검색은 한국어, 일본어, 로마자 다 돼요. `haruka`로 찾든 `はるか`로 찾든 하루카가 나와요.
- `765 + princess`처럼 `+`로 조건을 겹치거나, `chihaya or miki`처럼 `or`로 여러 명을 한 번에 찾을 수도 있어요. HEX 코드로 검색해도 돼요.
- 메인 화면에서 흘러가는 색 칩을 누르면 그 아이돌 정보가 떠요.
- 라이트/다크 모드랑 모바일 화면도 지원해요.

## 수록 아이돌

| 시리즈 | 인원 |
| --- | ---: |
| 765PRO ALLSTARS | 13명 |
| 밀리언 스타즈 | 39명 |
| 신데렐라 걸즈 | 190명 |
| 샤이니 컬러즈 | 28명 |
| 학원 아이돌마스터 | 13명 |
| SideM | 49명 |
| 합계 | 332명 |

## 직접 돌려보기

빌드 과정이 없는 정적 사이트라서, 저장소 폴더에서 서버만 띄우면 돼요.

```bash
python -m http.server 8765
```

그다음 `http://localhost:8765/`로 들어가면 됩니다.

배포는 두 곳에서 하고 있어요. GitHub Pages는 `main` 브랜치를 그대로 올리고, Render는 [`render.yaml`](render.yaml)을 읽어서 사이트에 필요한 파일만 따로 모아 올려요.

### 폴더 구조

```
index.html            화면
css/style.css         스타일
js/lang.js            한국어·일본어·영어 문구
js/color.js           색 계산
js/search.js          검색
js/choices.js         보기 색 만들기
js/app.js             게임 진행
js/guide.js           컬러 가이드
js/result-report.js   결과 화면과 공유 이미지
js/ui.js              메인 색 칩, 숫자키
data/series/*.js      시리즈별 아이돌 데이터
data/quiz-data.js     위 데이터를 하나로 합치는 파일
assets/               일러스트, 얼굴, 폰트, 아이콘
reference_assets/     원본 자료 (배포에는 안 들어가요)
docs/screenshots/     README 이미지
```

스크립트는 모듈 없이 `index.html`에 적힌 순서대로 불러와요. 파일을 추가할 때는 순서만 신경 써 주세요.

### 폰트

폰트는 Noto Sans KR과 JP에서 실제로 쓰는 글자만 잘라낸 거예요.
새 이름이나 문구를 넣었는데 그 글자만 다른 폰트로 보이면, 아래처럼 다시 만들어 주세요.

```bash
pip install fonttools brotli
python reference_assets/font-subsets/build.py --kr NotoSansKR-VariableFont_wght.ttf --jp NotoSansJP-VariableFont_wght.ttf
```

## 출처

| 자료 | 출처 |
| --- | --- |
| 이미지 컬러 HEX | [imas-db](https://imas-db.jp/misc/color.html) |
| 765PRO ALLSTARS, 밀리언 스타즈 이미지 | [MLTD Database](https://imas.gamedbs.jp/mlth/) |
| 신데렐라 걸즈 이미지 | [아이돌마스터 포털](https://idolmaster-official.jp/cinderellagirls) |
| 샤이니 컬러즈 이미지 | [공식 사이트](https://shinycolors.idolmaster.jp/) |
| 학원 아이돌마스터 이미지 | [공식 사이트](https://gakuen.idolmaster-official.jp/) |
| SideM 이미지 | [아이돌마스터 포털](https://idolmaster-official.jp/sidem/) |
| 신데렐라 걸즈 영문 이름 | [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters) |
| 폰트 | [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR), [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP) (SIL OFL 1.1) |

파일마다 어디서 가져와서 어떻게 손봤는지는 [`assets`](assets/) 안의 README와 manifest 파일에 적어 뒀어요.

---

비공식 팬메이드 퀴즈예요. THE IDOLM@STER와 관련 시리즈의 권리는 모두 각 권리자에게 있습니다.
