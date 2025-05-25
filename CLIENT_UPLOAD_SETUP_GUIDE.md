# 클라이언트 업로드 방식 설정 가이드

## 개요

이 가이드는 Application 모델의 파일 업로드를 Vercel Blob Storage 클라이언트 업로드 방식으로 변경하는 방법을 설명합니다. 이 방식을 통해 15MB 이상의 대용량 파일도 안정적으로 업로드할 수 있습니다.

## 주요 변경사항

### 1. 업로드 방식 변경

- **기존**: 서버를 통한 FormData 업로드 (Vercel 서버리스 함수 제한 4.5MB)
- **신규**: 클라이언트에서 Vercel Blob Storage로 직접 업로드 (최대 50MB)

### 2. API 구조 변경

- **기존**: FormData → 서버 → Blob Storage
- **신규**: 클라이언트 → Blob Storage → 서버에 메타데이터만 전송

## 환경 변수 설정

### 필수 환경 변수

```bash
# .env.local 파일에 추가
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
```

### Vercel 대시보드에서 설정

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. `BLOB_READ_WRITE_TOKEN` 추가
3. 모든 환경(Development, Preview, Production)에 적용

## 구현된 기능

### 1. 클라이언트 업로드 토큰 API

- **경로**: `/api/applications/upload-token`
- **기능**: 클라이언트 업로드용 토큰 생성
- **제한**: 50MB, 파일 타입 검증, 사용자 인증

### 2. 클라이언트 업로드 유틸리티

- **파일**: `lib/client-blob-upload-application.js`
- **기능**:
  - 직접 파일 업로드
  - 다중 파일 순차 업로드
  - 진행률 추적
  - 파일 검증 (개수, 타입, 크기)

### 3. 수정된 API 엔드포인트

- `/api/applications/computer`
- `/api/applications/printer`
- `/api/applications/notebook`
- `/api/applications/as`
- `/api/applications/inquiry`

### 4. 수정된 프론트엔드 Hook

- `useComputerEstimateForm.js`
- `usePrinterEstimateForm.js`
- `useNotebookEstimateForm.js`
- `useASApplicationForm.js`
- `useInquiryForm.js`

## 파일 제한사항

### 현재 설정

- **최대 파일 개수**: 5개
- **최대 파일 크기**: 50MB (개별 파일)
- **총 파일 크기**: 제한 없음
- **허용 파일 타입**:
  - 이미지: JPEG, PNG, GIF, WebP
  - 문서: PDF, Word, 텍스트

### 제한사항 수정 방법

```javascript
// lib/client-blob-upload-application.js에서 수정
export function validateFileSize(file, maxSize = 50 * 1024 * 1024) {
  // maxSize 값을 변경하여 파일 크기 제한 조정
}

export function validateFileCount(files) {
  const maxFiles = 5; // 최대 파일 개수 변경
}
```

## 업로드 진행률 표시

### 구현된 기능

- 실시간 업로드 진행률 표시
- 현재 업로드 중인 파일명 표시
- 오류 발생 시 오류 메시지 표시

### 사용 방법

```javascript
// Hook에서 uploadProgress 상태 사용
const { uploadProgress } = useComputerEstimateForm();

// 컴포넌트에서 진행률 모달 표시
<UploadProgress progress={uploadProgress} />;
```

## 테스트 방법

### 1. 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 환경 변수 확인
echo $BLOB_READ_WRITE_TOKEN
```

### 2. 파일 업로드 테스트

1. 견적 신청 페이지 접속
2. 다양한 크기의 파일 업로드 (1MB ~ 50MB)
3. 진행률 표시 확인
4. 업로드 완료 후 신청서 제출

### 3. 모바일 테스트

1. 모바일 브라우저에서 접속
2. 대용량 파일 (15MB 이상) 업로드
3. 네트워크 상태에 따른 업로드 안정성 확인

## 문제 해결

### 1. 업로드 토큰 생성 실패

```
Error: 인증이 필요합니다.
```

**해결방법**: 로그인 상태 확인, 세션 만료 시 재로그인

### 2. 파일 크기 제한 오류

```
Error: 파일 크기가 너무 큽니다. 최대 50MB까지 업로드 가능합니다.
```

**해결방법**: 파일 크기 확인 또는 제한 설정 조정

### 3. 파일 타입 오류

```
Error: 지원하지 않는 파일 형식입니다.
```

**해결방법**: 허용된 파일 타입 확인 또는 타입 설정 추가

### 4. 네트워크 오류

```
Error: 파일 업로드 실패: Network Error
```

**해결방법**: 네트워크 연결 확인, 재시도

## 성능 최적화

### 1. 파일 압축

- 이미지 파일의 경우 클라이언트에서 압축 후 업로드 고려
- WebP 형식 사용 권장

### 2. 청크 업로드

- 매우 큰 파일의 경우 청크 단위 업로드 구현 고려
- 네트워크 불안정 시 재시도 로직

### 3. 캐싱

- 업로드된 파일의 메타데이터 캐싱
- CDN을 통한 파일 전송 최적화

## 보안 고려사항

### 1. 파일 검증

- 서버에서 추가 파일 타입 검증
- 악성 파일 스캔 고려

### 2. 접근 제어

- 업로드된 파일의 접근 권한 관리
- 사용자별 파일 격리

### 3. 용량 관리

- 사용자별 총 업로드 용량 제한
- 정기적인 불필요 파일 정리

## 모니터링

### 1. 업로드 성공률

- 파일 업로드 성공/실패 로그
- 오류 유형별 통계

### 2. 성능 메트릭

- 평균 업로드 시간
- 파일 크기별 성능 분석

### 3. 사용량 추적

- 일일/월별 업로드 용량
- 파일 타입별 사용 통계
