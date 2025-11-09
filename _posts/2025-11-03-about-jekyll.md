---
layout: post
title: "Jekyll에 대하여"
date: 2025-11-03 11:00:00 -0500
categories: jekyll
tags: [Jekyll, Static Site Generator, Web Development, Ruby]
author: Ryan
excerpt: "Jekyll은 간단하고, 정적이며, 블로그 지향적인 사이트 생성기입니다. GitHub Pages에서 공식 지원하며, 데이터베이스 없이도 빠르고 안전한 웹사이트를 만들 수 있습니다."
image: /assets/images/jekyll-post.png
reading_time: 5분
---

## Jekyll이란 무엇일까요?

Jekyll은 간단하고, 정적이며, 블로그 지향적인 사이트 생성기입니다. Ruby로 작성되었으며, GitHub의 공동 창립자인 Tom Preston-Werner에 의해 만들어졌습니다.

### 주요 특징

*   **단순함**: 복잡한 데이터베이스나 서버 측 스크립팅 없이도 웹사이트를 만들 수 있습니다.
*   **정적 사이트**: Jekyll은 Markdown (또는 Textile), Liquid, HTML & CSS을 사용하여 바로 배포할 수 있는 완전한 정적 웹사이트를 생성합니다.
*   **블로그 지향**: 포스트, 페이지, 레이아웃 등 블로그에 필요한 기능들을 기본적으로 지원합니다.
*   **GitHub Pages 지원**: GitHub Pages에서 공식적으로 지원하므로, GitHub 저장소에 코드를 푸시하는 것만으로도 쉽게 웹사이트를 배포할 수 있습니다.

### 어떻게 작동하나요?

Jekyll은 여러분이 작성한 텍스트 파일을 가져와서 Liquid 템플릿 엔진을 통해 렌더링하고, 최종적으로 `_site`라는 디렉토리에 완전한 웹사이트를 생성합니다. 이 `_site` 디렉토리의 내용물을 웹 서버에 그대로 올리면 됩니다.

Jekyll을 사용하면 동적인 데이터베이스 기반의 웹사이트보다 훨씬 빠르고 안전한 웹사이트를 만들 수 있습니다.
