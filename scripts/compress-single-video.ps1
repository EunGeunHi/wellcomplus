# 개별 동영상 파일 압축 스크립트
# 사용법: .\compress-single-video.ps1 "파일명.mp4"

param(
    [Parameter(Mandatory=$true)]
    [string]$FileName
)

$inputFile = "public\assembly\videos\$FileName"
$outputFile = "public\assembly\videos_compressed\$FileName"

# 입력 파일 확인
if (-not (Test-Path $inputFile)) {
    Write-Host "❌ 파일을 찾을 수 없습니다: $inputFile" -ForegroundColor Red
    exit 1
}

# 출력 폴더 생성
$outputDir = Split-Path $outputFile -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

$originalSize = [math]::Round((Get-Item $inputFile).Length / 1MB, 2)
Write-Host "🔄 압축 시작: $FileName (원본: ${originalSize}MB)" -ForegroundColor Yellow

# 🎯 다양한 압축 품질 옵션
Write-Host "`n압축 품질을 선택하세요:" -ForegroundColor Cyan
Write-Host "1. 고품질 (CRF 23) - 큰 파일, 최고 화질" -ForegroundColor Green
Write-Host "2. 균형형 (CRF 28) - 권장 설정" -ForegroundColor Yellow  
Write-Host "3. 고압축 (CRF 32) - 작은 파일, 화질 타협" -ForegroundColor Red

$choice = Read-Host "선택 (1-3)"

switch ($choice) {
    "1" { $crf = "23"; $quality = "고품질" }
    "2" { $crf = "28"; $quality = "균형형" }
    "3" { $crf = "32"; $quality = "고압축" }
    default { $crf = "28"; $quality = "균형형" }
}

Write-Host "📊 선택된 품질: $quality (CRF $crf)" -ForegroundColor Magenta

# FFmpeg 명령어 실행
$ffmpegArgs = @(
    "-i", "`"$inputFile`"",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", $crf,
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-pix_fmt", "yuv420p",
    "-vf", "scale='min(1920,iw)':'min(1080,ih)'",
    "-y",
    "`"$outputFile`""
)

Write-Host "`n⏳ 압축 진행 중..." -ForegroundColor White
$process = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -Wait -PassThru

if ($process.ExitCode -eq 0) {
    $compressedSize = [math]::Round((Get-Item $outputFile).Length / 1MB, 2)
    $reduction = [math]::Round((($originalSize - $compressedSize) / $originalSize) * 100, 1)
    
    Write-Host "`n✅ 압축 완료!" -ForegroundColor Green
    Write-Host "📊 결과:" -ForegroundColor Cyan
    Write-Host "   원본: ${originalSize}MB" -ForegroundColor White
    Write-Host "   압축: ${compressedSize}MB" -ForegroundColor White
    Write-Host "   감소: ${reduction}%" -ForegroundColor Green
    Write-Host "📁 저장 위치: $outputFile" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ 압축 실패!" -ForegroundColor Red
} 