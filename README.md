# 🖥️ WellComSystem (웰컴시스템) - 컴퓨터 전문점 통합 관리 시스템

> **35년 전통 컴퓨터 전문점의 웹통한 서비스/관리를 위한 Full-Stack 웹 애플리케이션**  
> 웹으로 서비스 접근 가능 견적관리, 리뷰관리, 고객 관리, 서비스(컴퓨터,프린트,노트북)관리를 통합한 비즈니스 솔루션

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.16.0-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 📋 프로젝트 개요

**WellComPlus**는 35년 전통의 컴퓨터 전문점 "웰컴시스템"의 비즈니스 프로세스를 완전히 디지털화한 통합 관리 시스템입니다. 기존 오프라인 중심의 운영 방식을 현대적인 웹 기반 시스템으로 고객 경험 향상과 업무 효율성 극대화 하였습니다.

**🎯 프로젝트 목표:**

- 관리자가 사용할 견적작성/견적서인쇄/서비스관리/리뷰관리/데이터저장/회원계정관리 기능 제작
- 고객이 서비스신청/리뷰작성 기능 제작
- 메인페이지에 영상/이미지/리뷰를 통한 마케팅 강화
- SEO 최적화를 통해 구글 검색 상단에 노출

## 🚀 주요 기능

### 🔐 **인증 & 권한 관리**

- NextAuth.js 기반 소셜 로그인 (Google, Kakao, Naver)
- JWT 토큰 기반 세션 관리
- 역할 기반 접근 제어 (고객/관리자)

### 💼 **사용자 기능**

- **서비스 신청 시스템**: 컴퓨터/프린트/노트북/AS/기타문의 서비스 신청 시스템
- **리뷰 시스템**: 리뷰 작성 및 이미지 업로드 시스템
- **신청한 서비스 진행확인**: 신청했던 서비스 진행도 확인기능

### 📊 **관리자 기능**

- **견적 작성**: 컴퓨터/프린트/노트북 견적을 쉽게 작성
- **견적서 인쇄**: 작성한 견적을 특정한 형식에 맞게 인쇄 기능
- **서비스 관리**: 사용자가 온라인으로 신청한 서비스 관리
- **자료/기록 데이터 관리**: 저장 해둘 필요가 있는 데이터를 관리 기능
- **사용자 관리**: 회원가입한 계정을 관리

### 🔧 **Chrome Extension(크롬 확장 프로그램)**

- 다나와에서 선택한 부품 정보 원클릭으로 웰컴 사이트로 가져오기기
- 견적 작성할 때 다나와에서 복사한 데이터 일괄 입력 가능

### Ⓜ️ **메인 페이지**

- 영상/이미지 쇼케이스 섹션
- 사용자들이 작성한 리뷰 섹션

### 🌐 **SEO & 성능 최적화**

- 구조화된 데이터 (Schema.org) 완전 구현
- Core Web Vitals 최적화
- 이미지 최적화 및 지연 로딩
- 캐싱 전략 구현

## 🛠️ 기술 스택

### **Frontend**

- **Framework**: Next.js 14.1.0 (App Router)
- **UI Library**: React 18.3.0
- **Styling**: Tailwind CSS 3.3.0
- **Animation**: Framer Motion 12.6.0
- **Icons**: Lucide React, React Icons
- **State Management**: SWR 2.3.3

### **Backend**

- **Runtime**: Node.js
- **Database**: MongoDB 6.16.0 with Mongoose 8.12.2
- **Authentication**: NextAuth.js 4.24.11
- **File Upload**: Cloudinary
- **API**: RESTful API with Next.js API Routes

### **DevOps & Tools**

- **Deployment**: Vercel
- **Image CDN**: Cloudinary
- **Analytics**: Vercel Analytics & Speed Insights
- **Code Quality**: Prettier, ESLint
- **Version Control**: Git, GitHub

### **Performance & SEO**

- **Image Optimization**: Next.js Image Component
- **SEO**: 구조화된 데이터, 동적 메타태그
- **Caching**: HTTP 캐싱, CDN 최적화
- **Monitoring**: Core Web Vitals 추적, Vercel(Analytics, Speed Insights)

## 📁 프로젝트 구조

```
wellcomplus/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 인증 관련 API
│   │   ├── users/                # 사용자 관리 API
│   │   ├── reviews/              # 리뷰 시스템 API
│   │   ├── applications/         # 견적 시스템 API
│   │   ├── dashboard/            # 대시보드(리뷰) API
│   │   ├── manage/               # 관리자 API
│   │   └── middleware.js         # 로그인, 관리자 상태 체크 미들웨어
│   ├── components/               # 커스텀 Components
│   ├── login/                    # 로그인 페이지
│   ├── signup/                   # 회원가입 페이지
│   ├── userpage/                 # 사용자 페이지
│   ├── manage/                   # 관리자 페이지
│   └── globals.css               # 전역 스타일
├── lib/                          # 유틸리티 라이브러리
│   ├── mongodb.js                # MongoDB 연결
│   └── cloudinary.js             # 이미지 업로드,삭제
├── models/                       # MongoDB 스키마
├── utils/                        # 자주사용하는 함수
├── chrome-extension-real/        # Chrome Extension
│   ├── manifest.json
│   ├── popup.js                  # 확장 프로그램 UI
│   ├── content-*.js              # 컨텐츠 스크립트
│   └── background.js             # 점검을 위해 웹 접근 차단 미들웨어
└── middleware.js                 # Next.js 미들웨어
```

## 🖼️ 실제 구현 화면

### **🏠 메인 페이지**

![메인 페이지](/docs/screenshots/main-page.webp)

**주요 특징:**

- **Hero Section**: 35년 전통 강조와 맞춤형 솔루션 어필
- **조립 컴퓨터 갤러리**: 실제 제작 영상,이미지 쇼케이스
- **서비스 특징 카드**: 4개 핵심 가치 제안 (맞춤형 설계, 지속적 AS, 35년 노하우, 당일 출고)
- **고객 리뷰 섹션**: 실제 고객 후기와 평점 표시
- **찾아오시는 길**: Google Maps 연동 및 상세 회사 정보

---

### **🔐 인증 시스템**

#### **로그인 페이지**

![로그인 페이지](/docs/screenshots/login.webp)

**NextAuth.js 기반 소셜 로그인:**

- **Google 로그인**: 간편한 구글 계정 연동
- **Kakao 로그인**: 카카오톡 계정 연동
- **Naver 로그인**: 네이버 계정 연동
- **보안 강화**: JWT 토큰 기반 세션 관리

#### **회원가입 페이지**

![회원가입 페이지](/docs/screenshots/signup.webp)

**사용자 정보 수집:**

- **필수 정보**: 이름, 이메일, 연락처
- **이용약관**: 개인정보 처리방침 동의
- **실시간 유효성 검증**: 입력 즉시 오류 표시

---

### **💻 서비스 신청 페이지**

#### **컴퓨터 견적 신청**

![컴퓨터 견적 페이지](/docs/screenshots/computer-quote.webp)

**핵심 기능:**

- **사용목적 상세 입력**: 게임/업무/영상편집 등 용도별 맞춤 견적
- **예산 입력 시스템**: 실시간 예산 포맷팅 및 유효성 검증
- **하드웨어 선택**: CPU, GPU, 메모리, 저장장치 등 선택적 입력
- **파일 첨부**: 참고자료 업로드 (Cloudinary 연동)
- **실시간 진행률**: 업로드 진행상황 시각적 표시

---

### **👤 사용자 페이지 (마이페이지)**

#### **서비스 신청 현황**

![마이페이지 - 신청현황](/docs/screenshots/user-applications.webp)

**진행상황 추적:**

- **상태별 분류**: 접수/진행중/완료/취소
- **상세 정보 확인**: 신청 내용 및 견적 결과
- **실시간 알림**: 상태 변경 시 즉시 업데이트
- **히스토리 관리**: 과거 신청 이력 조회

#### **리뷰 작성 시스템**

![리뷰 작성 페이지](/docs/screenshots/review-write.webp)

**풍부한 리뷰 기능:**

- **별점 평가**: 1-5점 시각적 평점 시스템
- **이미지 업로드**: 다중 이미지 첨부 (최대 5장)
- **리뷰 수정/삭제**: 작성한 리뷰 수정/삭제 가능

---

### **⚙️ 관리자 페이지**

#### **견적서 작성 및 인쇄**

![견적서 작성](/docs/screenshots/admin-quote.webp)

**전문적인 견적 도구:**

- **부품별 세부 입력**: CPU, GPU, RAM 등 상세 사양작성 가능
- **크롬 확장프로그램**: 상품정보를 다나와에서 쉽게 가져오기 가능
- **실시간 가격 계산**: 부품 선택 시 자동 합계 산출
- **견적서 미리보기**: 인쇄 전 레이아웃 확인

#### **Chrome Extension(다나와 연동 도구)**

![크롬 익스텐션](/docs/screenshots/chrome-extension.webp)

**혁신적인 연동 서비스:**

- **원클릭 데이터 전송**: 다나와 → 웰컴시스템 데이터 복사/입력 가능
- **부품 정보 자동 입력**: 분류, 제품명, 가격 자동 매핑
- **사용자 친화적 UI**: 간단한 버튼 클릭으로 작동

#### **서비스 관리**

![서비스 관리](/docs/screenshots/admin-service-management.webp)

**통합 서비스 관리 시스템:**

이 페이지는 **신청, 진행, 완료, 취소**로 구분되어 있으며, 신청된 서비스들을 확인하고 진행상태를 변경하여 사용자에게 진행 과정을 실시간으로 보여줄 수 있도록 관리하는 페이지입니다.

- **상태별 분류 관리**: 신청됨 → 진행중 → 완료, 취소 단계별 상태 관리
- **고객 서비스 추적**: 각 고객의 서비스 진행 과정을 투명하게 관리
- **실시간 현황 파악**: 전체 서비스 현황을 한눈에 확인 가능

#### **리뷰 관리 시스템**

![리뷰 관리](/docs/screenshots/admin-reviews.webp)

**컨텐츠 관리:**

- **리뷰 승인/거부**: 부적절한 리뷰 필터링
- **메인 노출 설정**: 우수 리뷰 메인페이지 노출

#### **사용자 관리**

![사용자 관리](/docs/screenshots/admin-user-management.webp)

- **회원 정보 조회**: 가입된 모든 회원의 기본 정보 및 활동 현황
- **리뷰 활동 추적**: 각 회원이 작성한 리뷰 목록 및 평점 확인
- **서비스 신청 이력**: 회원별 견적 신청 및 문의 내역 통합 조회

---

### **📱 반응형 디자인**

#### **모바일 최적화**

![모바일 버전](/docs/screenshots/mobile-responsive.webp)

**모든 디바이스 지원:**

- **Touch-friendly**: 터치 인터페이스 최적화
- **적응형 레이아웃**: 화면 크기별 최적 배치
- **빠른 로딩**: 이미지 지연 로딩 및 압축 최적화

---

## 🌐 배포 & 사이트 주소

**🔗 Live Site**: [https://www.okwellcom.com](https://www.okwellcom.com)

**배포 환경:**

- **Platform**: Vercel (자동 CI/CD)
- **Domain**: 커스텀 도메인 연결 (가비아)
- **TSL**: HTTPS 보안 적용
- **CDN**: Vercel Edge Network 활용

**성능 지표:**

- **Lighthouse Score**: 95+ (Performance, SEO, Accessibility)
- **Core Web Vitals**: 모든 지표 Good 달성
- **Page Load Time**: < 2초

## 👨‍💻 개발 기여도

**🔸 단독 개발 (100%)**

- **기획 & 분석**: 비즈니스 요구사항 분석 및 시스템 설계
- **Frontend 개발**: React/Next.js 기반 사용자 인터페이스 구현
- **Backend 개발**: RESTful API 설계 및 데이터베이스 모델링
- **DevOps**: Vercel 배포 자동화 및 성능 최적화
- **SEO 최적화**: 검색 엔진 최적화 및 구조화된 데이터 구현

**📊 개발 통계:**

- **총 개발 기간**: 4개월
- **커밋 수**: 200+ commits
- **코드 라인**: 15,000+ lines
- **API 엔드포인트**: 25+ endpoints
- **컴포넌트**: 50+ React components

## 💡 프로젝트를 통해 배운 점

### **🎯 기술적 성장**

**1. Full-Stack 개발 역량 강화**

- Next.js App Router의 깊이 있는 이해와 활용
- MongoDB와 Mongoose를 활용한 NoSQL 데이터베이스 설계
- RESTful API 설계 원칙과 확장 가능한 아키텍처 구현
- 실시간 데이터 동기화와 상태 관리 최적화

**2. 성능 최적화 전문성**

- Core Web Vitals 지표 개선을 통한 사용자 경험 향상
- 이미지 최적화, 지연 로딩, 캐싱 전략 구현
- Lighthouse 점수 90+점 달성을 통한 웹 성능 최적화
- CDN 활용과 HTTP 헤더 최적화를 통한 로딩 속도 개선

### **🔧 문제 해결 능력**

**1. 복잡한 비즈니스 로직 구현**

- 견적 시스템의 복잡한 계산 로직 최적화
- 다중 이미지 업로드와 실시간 진행상황 표시
- 사용자 권한별 차등 기능 제공 시스템
- 크롬 확장 프로그램과 웹 애플리케이션 연동

**2. 확장성 고려한 아키텍처**

- 모듈화된 컴포넌트 설계로 재사용성 극대화
- API 버전 관리와 하위 호환성 유지
- 데이터베이스 스키마 설계 시 미래 확장성 고려

### **🚀 개발 프로세스 개선**

**효율적인 개발 워크플로우**

- Git Flow 전략 수립과 브랜치 관리
- Prettier, ESLint를 활용한 코드 품질 관리
- 자동화된 배포 파이프라인 구축
- 성능 모니터링과 알림 시스템 구축

### **🤖 AI 도구 활용과 학습 전략**

**현대적 개발 환경에서의 AI 활용 경험**

이 프로젝트 개발 과정에서 **AI 기반 개발 도구들을 적극 활용**하여 생산성과 코드 품질을 크게 향상시킬 수 있었습니다.

**✅ AI 활용의 장점:**

- **생산성 극대화**: 반복적인 코드 작성 시간을 70% 단축
- **코드 품질 향상**: AI가 제안하는 최적화된 패턴과 베스트 프랙티스 학습
- **빠른 문제 해결**: 복잡한 에러나 버그 상황에서 즉시 해결 방안 탐색
- **새로운 기술 학습**: 생소한 라이브러리나 API 사용법을 빠르게 습득

**⚠️ AI 활용의 한계와 대응 전략:**

- **코드 이해도 부족**: AI가 생성한 코드의 동작 원리를 **반드시 재학습하고 내재화**
- **의존성 위험**: AI 제안을 맹신하지 않고 **직접 검증하고 테스트하는 습관** 유지
- **창의성 제한**: AI 솔루션에만 의존하지 않고 **독창적인 접근 방식도 시도**

**🎯 AI와 함께하는 효과적인 학습 방법:**

1. **AI 코드 분석**: 생성된 코드를 한 줄씩 분해하여 동작 원리 파악
2. **수정과 개선**: AI 제안을 기반으로 프로젝트에 맞게 커스터마이징
3. **문서화 습관**: AI로 작성한 부분도 주석과 문서로 명확히 기록
4. **지속적 검증**: 코드 리뷰와 테스트를 통한 품질 검증 프로세스 구축

**💡 개발자로서의 AI 활용 철학:**

> **"AI는 도구일 뿐, 핵심은 문제 해결 능력과 기술에 대한 깊은 이해"**

AI가 빠르게 발전하는 현 시점에서, 단순히 AI를 '사용'하는 것보다는 **AI를 활용해 더 깊이 학습하고 성장하는 것**이 진정한 경쟁력이라고 생각합니다.

이 프로젝트를 통해 AI와 협업하면서도 **본질적인 개발 역량과 문제 해결 능력을 키우는 균형잡힌 접근법**을 체득할 수 있었습니다.

### **🌟 향후 발전 방향**

이 프로젝트를 통해 **실무에서 요구되는 종합적인 개발 역량**을 획득했으며, 특히 **비즈니스 가치 창출을 위한 기술 활용 능력**을 크게 향상시켰습니다.

앞으로는 **마이크로서비스 아키텍처**, **Docker/Kubernetes 기반 DevOps**, **AI/ML 서비스 통합** 등의 기술을 추가로 학습하여 더욱 확장 가능하고 혁신적인 서비스를 개발하고 싶습니다.

---

## 📞 Contact

**프로젝트 관련 문의나 기술적 논의를 환영합니다!**

- **Email**: [your-email@example.com]
- **Portfolio**: [your-portfolio-url]
- **LinkedIn**: [your-linkedin-profile]

---

_"전통적인 비즈니스와 현대적인 기술의 완벽한 융합을 통해 실질적인 가치를 창출하는 개발자"_
