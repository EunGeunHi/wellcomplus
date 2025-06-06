# 🎬 웰컴시스템 동영상 압축 가이드

## 📋 압축 효과 예상치

- **원본**: 5.3MB ~ 25MB
- **압축 후**: 2MB ~ 10MB (약 50-70% 감소)
- **품질**: 웹 사용에 최적화된 고품질 유지

## 🚀 사용 방법

### 1️⃣ 모든 동영상 일괄 압축

```powershell
# PowerShell을 관리자 권한으로 실행
cd "C:\Users\KCJ\Desktop\next\wellcomplus"
.\scripts\compress-videos.ps1
```

### 2️⃣ 개별 파일 압축

```powershell
# 특정 파일만 압축
.\scripts\compress-single-video.ps1 "1-화이트.mp4"
```

### 3️⃣ 수동 FFmpeg 명령어

```powershell
# 고품질 압축 (권장)
ffmpeg -i "public\assembly\videos\1-화이트.mp4" -c:v libx264 -preset medium -crf 28 -c:a aac -b:a 128k -movflags +faststart -pix_fmt yuv420p -vf "scale='min(1920,iw)':'min(1080,ih)'" "compressed_output.mp4"

# 최대 압축 (화질 타협)
ffmpeg -i "input.mp4" -c:v libx264 -preset slow -crf 32 -c:a aac -b:a 96k -movflags +faststart "output.mp4"
```

## ⚙️ FFmpeg 옵션 설명

| 옵션                   | 설명              | 값                                     |
| ---------------------- | ----------------- | -------------------------------------- |
| `-c:v libx264`         | 비디오 코덱       | H.264 (웹 호환성 최고)                 |
| `-preset medium`       | 압축 속도         | fast/medium/slow (slow가 더 작은 파일) |
| `-crf 28`              | 품질 설정         | 18(최고) ~ 32(최저), 28 권장           |
| `-c:a aac`             | 오디오 코덱       | AAC (웹 표준)                          |
| `-b:a 128k`            | 오디오 비트레이트 | 128kbps (음성용으로 충분)              |
| `-movflags +faststart` | 스트리밍 최적화   | 웹에서 빠른 재생 시작                  |
| `-pix_fmt yuv420p`     | 픽셀 포맷         | 최대 호환성                            |

## 📊 품질별 예상 결과

### CRF 23 (고품질)

- 파일 크기: 원본의 40-60%
- 화질: 원본과 거의 구분 불가
- 용량: 25MB → 10-15MB

### CRF 28 (균형형) ⭐ 권장

- 파일 크기: 원본의 30-50%
- 화질: 웹용으로 충분한 고품질
- 용량: 25MB → 7-12MB

### CRF 32 (고압축)

- 파일 크기: 원본의 20-35%
- 화질: 약간의 품질 저하
- 용량: 25MB → 5-8MB

## 🔄 압축 후 작업 순서

1. **압축 실행**: 스크립트 실행
2. **품질 확인**: 압축된 파일 재생해서 품질 체크
3. **원본 백업**: 원본 파일들을 `videos_backup` 폴더로 이동
4. **파일 교체**: 압축된 파일들을 `videos` 폴더로 이동
5. **웹사이트 테스트**: 배포 후 로딩 속도 확인

## ⚠️ 주의사항

- **원본 백업 필수**: 압축 전 반드시 원본 파일 백업
- **품질 확인**: 압축 후 각 파일의 화질 확인
- **단계적 적용**: 한 파일씩 테스트 후 일괄 적용
- **캐시 클리어**: 브라우저 캐시 클리어 후 테스트

## 📈 예상 성능 개선

- **로딩 속도**: 50-70% 향상
- **대역폭 사용량**: 50-70% 감소
- **사용자 경험**: 버퍼링 현상 대폭 감소
- **Vercel 비용**: 대역폭 절약으로 무료 한도 내 사용 가능
