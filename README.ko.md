<p align="center">
  <strong>한국어</strong> · <a href="README.ja.md">日本語</a> · <a href="README.en.md">English</a>
</p>

# 아이돌마스터 이미지 컬러 맞추기

아이돌 일러스트를 보고 각 아이돌의 이미지 컬러를 맞히는 팬메이드 웹 퀴즈입니다. 6개 시리즈, 332명의 아이돌을 수록했으며 한국어·일본어·영어를 지원합니다.

## [퀴즈 플레이](https://indifferentcurve.github.io/idolmaster-personal-color-quiz/)

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

별도 빌드 없이 정적 파일 서버에서 실행할 수 있습니다.

```bash
python -m http.server 8765
```

브라우저에서 `http://localhost:8765/`에 접속합니다.

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
```

스크립트는 빌드 없이 `index.html`에 적힌 순서대로 불러오는 일반 스크립트입니다. 파일을 추가할 때는 이 순서를 지켜 주세요.

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

파일별 출처와 가공 기록은 [`assets`](assets/) 아래의 README 및 manifest 파일에 정리되어 있습니다.

## 안내

이 프로젝트는 비공식 팬메이드 퀴즈입니다. THE IDOLM@STER 및 관련 시리즈의 권리는 각 권리자에게 있습니다.
