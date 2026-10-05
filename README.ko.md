<p align="center">
  <strong>한국어</strong> · <a href="README.ja.md">日本語</a> · <a href="README.en.md">English</a>
</p>

# 아이돌마스터 이미지 컬러 맞추기

일러스트를 보고 아이돌의 이미지 컬러를 맞히는 팬메이드 퀴즈. 6개 시리즈 332명 수록, 한국어·일본어·영어 지원.

[GitHub Pages](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/) · [Render](https://idolmaster-color-quiz.onrender.com/)

![메인 화면](docs/screenshots/home.png)

## 기능

- 시리즈별 출제, 아이돌을 직접 고르는 커스텀 모드
- 4단계 난이도, 문항 수 선택
- 결과 이미지 저장·공유, 오답 노트
- 전체 아이돌의 이미지 컬러를 볼 수 있는 컬러 가이드
- 라이트/다크 모드, 모바일 지원, 숫자키(1~6) 선택

## 난이도

| 난이도 | 보기 | 제한 시간 | 만점 |
| --- | ---: | ---: | ---: |
| Easy | 5 | 30초 | 500 |
| Normal | 6 | 25초 | 1000 |
| Hard | 6 | 20초 | 1500 |
| Very Hard | 6 | 15초 | 2000 |

점수는 맞힌 개수로만 계산하며, 시간 초과는 오답 처리한다.

## 수록 시리즈

| 시리즈 | 인원 |
| --- | ---: |
| 765PRO ALLSTARS | 13 |
| 밀리언 스타즈 | 39 |
| 신데렐라 걸즈 | 190 |
| 샤이니 컬러즈 | 28 |
| 학원 아이돌마스터 | 13 |
| SideM | 49 |

## 로컬 실행

```bash
python -m http.server 8765
```

`http://localhost:8765/` 접속.

## 출처

- 이미지 컬러 HEX: [imas-db](https://imas-db.jp/misc/color.html)
- 이미지: [MLTD Database](https://imas.gamedbs.jp/mlth/), [신데렐라 걸즈](https://idolmaster-official.jp/cinderellagirls), [샤이니 컬러즈](https://shinycolors.idolmaster.jp/), [학원 아이돌마스터](https://gakuen.idolmaster-official.jp/), [SideM](https://idolmaster-official.jp/sidem/)
- 신데렐라 걸즈 영문명: [Cinderella Girls Wiki](https://idolmaster-cinderella-girls.fandom.com/wiki/Characters)
- 폰트: Noto Sans KR / JP (SIL OFL 1.1)

비공식 팬메이드 프로젝트입니다. THE IDOLM@STER 관련 권리는 각 권리자에게 있습니다.
