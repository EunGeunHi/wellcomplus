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

**3. SEO & 마케팅 기술**

- Schema.org 구조화된 데이터 완전 구현
- 동적 메타태그와 OpenGraph 최적화
- Google Search Console 연동과 검색 성능 분석
- 웹 접근성 표준 준수와 사용자 경험 개선

### **🏢 비즈니스 이해도 향상**

**1. 고객 중심 사고**

- 35년 전통 사업체의 오프라인 프로세스 분석
- 고객 여정 매핑과 페인포인트 해결 방안 도출
- 사용자 인터페이스 설계 시 실제 고객 니즈 반영
- A/B 테스트를 통한 사용자 경험 개선

**2. 데이터 기반 의사결정**

- Google Analytics와 Vercel Analytics 연동
- 사용자 행동 패턴 분석과 개선점 도출
- 비즈니스 KPI 정의와 대시보드 구현
- 데이터 시각화를 통한 인사이트 제공

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
- 마이크로서비스 전환 가능한 구조 설계

### **🚀 개발 프로세스 개선**

**1. 효율적인 개발 워크플로우**

- Git Flow 전략 수립과 브랜치 관리
- Prettier, ESLint를 활용한 코드 품질 관리
- 자동화된 배포 파이프라인 구축
- 성능 모니터링과 알림 시스템 구축

**2. 문서화와 유지보수성**

- 컴포넌트별 상세 주석과 JSDoc 활용
- API 문서화와 Postman 컬렉션 작성
- README와 기술 문서 체계적 관리
- 코드 리뷰 프로세스 정립

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
