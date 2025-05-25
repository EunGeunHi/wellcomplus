# Vercel Blob Storage 설정 가이드

이 가이드는 프로젝트에서 Vercel Blob Storage를 사용하여 이미지 파일을 저장하도록 설정하는 방법을 설명합니다.

## 1. Vercel 계정 및 프로젝트 설정

### 1.1 Vercel 계정 생성

1. [Vercel 웹사이트](https://vercel.com)에 접속
2. GitHub 계정으로 로그인 또는 새 계정 생성
3. 프로젝트를 Vercel에 배포 (아직 배포하지 않았다면)

### 1.2 Blob Storage 활성화

1. Vercel 대시보드에서 프로젝트 선택
2. **Storage** 탭으로 이동
3. **Blob** 섹션에서 **Create Database** 클릭
4. 데이터베이스 이름 입력 (예: `wellcomplus-images`)
5. **Create** 클릭

## 2. 환경 변수 설정

### 2.1 Vercel 대시보드에서 토큰 생성

1. 프로젝트 대시보드에서 **Settings** → **Environment Variables**로 이동
2. 생성된 Blob Storage에서 **Connect** 클릭
3. 자동으로 생성된 환경 변수들을 확인:
   - `BLOB_READ_WRITE_TOKEN`

### 2.2 로컬 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# MongoDB 연결 URI (기존)
MONGODB_URI=your_mongodb_connection_string

# NextAuth 설정 (기존)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Vercel Blob Storage 설정
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx

# 이미지 업로드 설정 (선택사항)
MAX_IMAGE_SIZE=10485760  # 10MB in bytes
MAX_IMAGES_PER_REVIEW=5
ALLOWED_IMAGE_TYPES=image/jpeg,image/png
```

### 2.3 토큰 확인 방법

1. Vercel CLI 설치: `npm i -g vercel`
2. 로그인: `vercel login`
3. 프로젝트 연결: `vercel link`
4. 환경 변수 다운로드: `vercel env pull .env.local`

## 3. 패키지 설치 확인

다음 패키지가 설치되어 있는지 확인하세요:

```bash
npm install @vercel/blob
```

## 4. 로컬 개발 환경 테스트

### 4.1 개발 서버 실행

```bash
npm run dev
```

### 4.2 이미지 업로드 테스트

1. 브라우저에서 `http://localhost:3000`에 접속
2. 로그인 후 리뷰 작성 페이지로 이동
3. 이미지를 첨부하여 리뷰 작성
4. 업로드가 성공하면 Vercel 대시보드의 Blob Storage에서 파일 확인 가능

## 5. 배포 환경 설정

### 5.1 Vercel 배포

```bash
vercel --prod
```

### 5.2 환경 변수 확인

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** → **Environment Variables**에서 모든 필요한 변수가 설정되어 있는지 확인

## 6. 주요 변경사항

### 6.1 MongoDB 스키마 변경

- 기존: 이미지 바이너리 데이터를 MongoDB에 저장
- 변경: Vercel Blob Storage URL과 메타데이터만 MongoDB에 저장

### 6.2 API 엔드포인트 변경

- **리뷰 생성**: `/api/reviews` (POST) - Blob Storage에 이미지 업로드
- **리뷰 수정**: `/api/reviews/[id]` (PATCH) - 기존 이미지 삭제 및 새 이미지 업로드
- **리뷰 삭제**: `/api/reviews/[id]/delete` (PATCH) - Blob Storage에서 이미지 삭제
- **이미지 조회**: `/api/reviews/images/[reviewId]/[imageId]` - Blob Storage URL로 리다이렉트

### 6.3 프론트엔드 변경

- 이미지 URL이 직접 Blob Storage URL로 제공됨
- 더 빠른 이미지 로딩 및 CDN 혜택

## 7. 데이터베이스 관리

### 7.1 데이터베이스 상태 확인

```bash
npm run db:status
```

### 7.2 기존 바이너리 데이터 정리

기존에 바이너리 데이터가 포함된 리뷰가 있다면 정리할 수 있습니다:

```bash
npm run db:cleanup
```

### 7.3 스키마 검증

Blob Storage 스키마가 올바르게 적용되었는지 확인:

```bash
npm run db:validate
```

### 7.4 데이터베이스 초기화 (개발 환경)

개발 중 모든 리뷰 데이터를 삭제하고 새로 시작하려면:

```bash
npm run db:reset
```

## 8. 모니터링 및 관리

### 8.1 Blob Storage 사용량 확인

1. Vercel 대시보드에서 **Storage** → **Blob** 선택
2. 사용량 및 파일 목록 확인

### 8.2 비용 관리

- Vercel Blob Storage는 사용량에 따라 과금
- 정기적으로 불필요한 파일 정리 권장
- 이미지 압축 및 최적화 고려

## 9. 문제 해결

### 9.1 일반적인 오류

**오류**: `BLOB_READ_WRITE_TOKEN is not defined`
**해결**: `.env.local` 파일에 올바른 토큰이 설정되어 있는지 확인

**오류**: `Failed to upload image to blob`
**해결**:

1. 토큰 권한 확인
2. 파일 크기 및 형식 확인
3. 네트워크 연결 상태 확인

**오류**: `Image not found in blob storage`
**해결**:

1. Blob Storage에서 파일 존재 여부 확인
2. URL 형식이 올바른지 확인

### 9.2 로그 확인

```bash
# 개발 환경에서 상세 로그 확인
DEBUG=blob* npm run dev
```

## 10. 보안 고려사항

### 10.1 토큰 보안

- `BLOB_READ_WRITE_TOKEN`은 절대 클라이언트 사이드에 노출하지 마세요
- 정기적으로 토큰 갱신 권장

### 10.2 파일 검증

- 업로드되는 파일의 형식과 크기를 서버에서 검증
- 악성 파일 업로드 방지

### 10.3 접근 제어

- 이미지 URL은 공개적으로 접근 가능하므로 민감한 정보 포함 금지
- 필요시 서명된 URL 사용 고려

## 11. 성능 최적화

### 11.1 이미지 최적화

- 업로드 전 클라이언트에서 이미지 압축 고려
- WebP 형식 지원 검토

### 11.2 캐싱 전략

- Vercel Blob Storage는 자동으로 CDN 캐싱 제공
- 브라우저 캐싱 헤더 최적화

이제 Vercel Blob Storage를 사용하여 이미지를 효율적으로 관리할 수 있습니다!
