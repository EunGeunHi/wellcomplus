# 성능 최적화 가이드

## 🚀 리뷰 관리 시스템 성능 최적화

### 📋 문제점 분석

**기존 문제들:**

1. **Base64 이미지 변환**: 모든 이미지를 Base64로 변환하여 응답 크기 급증 (1.33배 증가)
2. **메모리 과부하**: 이미지 바이너리 데이터까지 모두 메모리에 로드
3. **느린 응답 시간**: 거대한 JSON 응답으로 인한 네트워크 지연
4. **데이터베이스 비효율성**: 최적화되지 않은 쿼리와 인덱스 부재

### ✅ 적용된 최적화

#### 1. **API 엔드포인트 최적화**

- **이미지 분리 서빙**: `/api/reviews/images/[reviewId]/[imageId]` 엔드포인트 추가
- **메타데이터만 응답**: 이미지 바이너리 데이터 제외 (`select('-images.data')`)
- **Lean 쿼리**: Mongoose의 `lean()` 메서드로 불필요한 객체 변환 제거

#### 2. **페이지네이션 구현**

- **20개씩 분할 로딩**: 전체 데이터 대신 필요한 만큼만 로드
- **스마트 페이지네이션**: 현재 페이지 기준 5개 페이지 버튼 표시
- **검색/필터 상태 유지**: 페이지 변경 시에도 검색 조건 유지

#### 3. **이미지 최적화**

```javascript
// 기존 (비효율적)
url: `data:${image.mimeType};base64,${image.data.toString('base64')}`;

// 최적화 후
url: `/api/reviews/images/${review._id}/${image._id}`;
```

#### 4. **데이터베이스 인덱스 추가**

```javascript
reviewSchema.index({ status: 1, createdAt: -1 }); // 상태별 최신순
reviewSchema.index({ userId: 1, createdAt: -1 }); // 사용자별 최신순
reviewSchema.index({ serviceType: 1, status: 1 }); // 서비스 타입별
reviewSchema.index({ content: 'text' }); // 텍스트 검색
```

#### 5. **캐싱 헤더 설정**

```javascript
'Cache-Control': 'public, max-age=31536000, immutable', // 1년 캐싱
'ETag': `"${imageId}"`, // 조건부 요청 지원
```

### 📊 성능 개선 결과 (예상)

| 항목              | 개선 전 | 개선 후  | 개선율          |
| ----------------- | ------- | -------- | --------------- |
| 응답 크기         | 5-50MB  | 50-500KB | **90-99% 감소** |
| 로딩 시간         | 10-60초 | 1-3초    | **80-95% 단축** |
| 메모리 사용량     | 높음    | 낮음     | **70-90% 감소** |
| 데이터베이스 쿼리 | 느림    | 빠름     | **50-80% 개선** |

### 🔧 사용법

#### API 호출 예시

```javascript
// 리뷰 목록 조회 (페이지네이션)
const response = await fetch('/api/reviews?status=active&page=1&limit=20');
const data = await response.json();

// 개별 이미지 조회
const imageUrl = `/api/reviews/images/${reviewId}/${imageId}`;
<img src={imageUrl} alt="리뷰 이미지" />;
```

#### 프론트엔드 사용법

```javascript
// 페이지 변경
const handlePageChange = (newPage) => {
  fetchReviews(activeTab, searchQuery, serviceTypeFilter, newPage);
};

// 검색 (페이지 초기화)
const handleSearch = () => {
  setCurrentPage(1);
  fetchReviews(activeTab, searchQuery, serviceTypeFilter, 1);
};
```

### 🛠️ 추가 최적화 권장사항

1. **이미지 압축**: 업로드 시 WebP 포맷 변환
2. **CDN 도입**: 정적 리소스 전역 배포
3. **Redis 캐싱**: 자주 조회되는 데이터 캐싱
4. **무한 스크롤**: 페이지네이션 대신 무한 스크롤 도입
5. **이미지 lazy loading**: 뷰포트에 진입할 때만 로드

### 🚨 주의사항

1. **기존 이미지 URL**: 이전 Base64 URL은 더 이상 작동하지 않음
2. **캐시 무효화**: 이미지 변경 시 ETag 업데이트 필요
3. **에러 핸들링**: 이미지 로드 실패에 대한 fallback 구현
4. **보안**: 이미지 접근 권한 검증 로직 추가 고려

### 📈 모니터링

개선 사항을 확인하기 위한 모니터링 포인트:

- **네트워크 탭**: 응답 크기 및 로딩 시간
- **메모리 사용량**: Chrome DevTools Performance 탭
- **데이터베이스 쿼리**: MongoDB 쿼리 실행 시간
- **사용자 경험**: 페이지 로딩 및 상호작용 응답성
