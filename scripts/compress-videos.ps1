# 웰컴시스템 동영상 압축 스크립트
# 사용법: .\compress-videos.ps1

Write-Host "🎬 웰컴시스템 동영상 압축 시작..." -ForegroundColor Green

# 원본 동영상 폴더 경로
$sourceFolder = "public\assembly\videos"
$outputFolder = "public\assembly\videos_compressed"

# 출력 폴더 생성
if (-not (Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder -Force
    Write-Host "📁 압축 폴더 생성: $outputFolder" -ForegroundColor Yellow
}

# 동영상 파일 목록 가져오기
$videoFiles = Get-ChildItem -Path $sourceFolder -Filter "*.mp4"

Write-Host "📊 총 $($videoFiles.Count)개 파일 발견" -ForegroundColor Cyan

foreach ($file in $videoFiles) {
    $inputFile = $file.FullName
    $outputFile = Join-Path $outputFolder $file.Name
    $originalSize = [math]::Round($file.Length / 1MB, 2)
    
    Write-Host "`n🔄 압축 중: $($file.Name) (원본: ${originalSize}MB)" -ForegroundColor White
    
    # FFmpeg 압축 명령어 (고품질 웹 최적화)
    $ffmpegArgs = @(
        "-i", "`"$inputFile`"",
        "-c:v", "libx264",           # H.264 코덱
        "-preset", "medium",         # 압축 속도 vs 품질 균형
        "-crf", "28",               # 품질 (18-28 권장, 낮을수록 고품질)
        "-c:a", "aac",              # 오디오 코덱
        "-b:a", "128k",             # 오디오 비트레이트
        "-movflags", "+faststart",   # 웹 스트리밍 최적화
        "-pix_fmt", "yuv420p",      # 호환성
        "-vf", "scale='min(1920,iw)':'min(1080,ih)'", # 최대 해상도 제한
        "-y",                       # 덮어쓰기 허용
        "`"$outputFile`""
    )
    
    # FFmpeg 실행
    $process = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -Wait -PassThru -WindowStyle Hidden
    
    if ($process.ExitCode -eq 0) {
        $compressedSize = [math]::Round((Get-Item $outputFile).Length / 1MB, 2)
        $reduction = [math]::Round((($originalSize - $compressedSize) / $originalSize) * 100, 1)
        
        Write-Host "✅ 완료: $($file.Name)" -ForegroundColor Green
        Write-Host "   원본: ${originalSize}MB → 압축: ${compressedSize}MB (${reduction}% 감소)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 실패: $($file.Name)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 모든 동영상 압축 완료!" -ForegroundColor Green
Write-Host "📁 압축된 파일 위치: $outputFolder" -ForegroundColor Yellow
Write-Host "`n⚠️  다음 단계:" -ForegroundColor Magenta
Write-Host "1. 압축된 동영상 품질 확인" -ForegroundColor White
Write-Host "2. 문제없으면 원본과 교체: 원본 백업 → 압축본을 videos 폴더로 이동" -ForegroundColor White 