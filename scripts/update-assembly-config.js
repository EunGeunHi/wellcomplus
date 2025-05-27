const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const CONFIG_PATH = path.join(__dirname, '../public/assembly/config.json');
const PHOTOS_DIR = path.join(__dirname, '../public/assembly/photos');
const VIDEOS_DIR = path.join(__dirname, '../public/assembly/videos');

// 카테고리 옵션
const CATEGORIES = {
  gaming: '게이밍 PC',
  office: '사무용 PC',
  workstation: '워크스테이션',
  creator: '크리에이터 PC',
  server: '서버용 PC',
  mini: '미니 ITX PC',
  custom: '맞춤형 PC',
};

// 현재 파일 목록 스캔
function scanFiles() {
  const images = [];
  const videos = [];

  // 이미지 파일 스캔
  if (fs.existsSync(PHOTOS_DIR)) {
    const imageFiles = fs
      .readdirSync(PHOTOS_DIR)
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort();

    imageFiles.forEach((filename) => {
      images.push({ filename, needsUpdate: true });
    });
  }

  // 동영상 파일 스캔
  if (fs.existsSync(VIDEOS_DIR)) {
    const videoFiles = fs
      .readdirSync(VIDEOS_DIR)
      .filter((file) => /\.(mp4|webm|mov)$/i.test(file))
      .sort();

    videoFiles.forEach((filename) => {
      videos.push({ filename, needsUpdate: true });
    });
  }

  return { images, videos };
}

// 기존 설정 로드
function loadExistingConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (error) {
      console.log('⚠️  기존 설정 파일을 읽을 수 없습니다. 새로 생성합니다.');
    }
  }
  return null;
}

// 질문 함수
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// 카테고리 선택
async function selectCategory() {
  console.log('\n📁 카테고리를 선택하세요:');
  Object.entries(CATEGORIES).forEach(([key, value], index) => {
    console.log(`${index + 1}. ${value} (${key})`);
  });

  const answer = await question('번호를 입력하세요 (1-7): ');
  const categoryKeys = Object.keys(CATEGORIES);
  const selectedKey = categoryKeys[parseInt(answer) - 1];

  if (selectedKey) {
    return selectedKey;
  } else {
    console.log('❌ 잘못된 선택입니다. 다시 선택해주세요.');
    return await selectCategory();
  }
}

// 이미지 정보 입력
async function updateImageInfo(image, existingInfo = null) {
  console.log(`\n📸 이미지: ${image.filename}`);

  if (existingInfo) {
    console.log(`현재 제목: ${existingInfo.title}`);
    console.log(`현재 카테고리: ${existingInfo.category}`);
    console.log(`현재 alt 텍스트: ${existingInfo.alt}`);

    const keepExisting = await question('기존 정보를 유지하시겠습니까? (y/n): ');
    if (keepExisting.toLowerCase() === 'y') {
      return existingInfo;
    }
  }

  const title = await question('제목을 입력하세요: ');
  const category = await selectCategory();
  const alt = await question('SEO용 alt 텍스트를 입력하세요 (웰컴시스템, 부산 등 키워드 포함): ');

  return {
    filename: image.filename,
    title: title || `PC 조립 완성품 ${image.filename}`,
    category,
    alt: alt || `부산 웰컴시스템 ${title} 조립 완성품`,
  };
}

// 동영상 정보 입력
async function updateVideoInfo(video, existingInfo = null) {
  console.log(`\n🎥 동영상: ${video.filename}`);

  if (existingInfo) {
    console.log(`현재 제목: ${existingInfo.title}`);
    console.log(`현재 설명: ${existingInfo.description}`);
    console.log(`현재 alt 텍스트: ${existingInfo.alt}`);

    const keepExisting = await question('기존 정보를 유지하시겠습니까? (y/n): ');
    if (keepExisting.toLowerCase() === 'y') {
      return existingInfo;
    }
  }

  const title = await question('제목을 입력하세요: ');
  const description = await question('설명을 입력하세요: ');
  const alt = await question('SEO용 alt 텍스트를 입력하세요: ');

  return {
    filename: video.filename,
    title: title || `PC 조립 영상 ${video.filename}`,
    description: description || '웰컴시스템의 전문적인 PC 조립 과정',
    alt: alt || `웰컴시스템 ${title} - 부산 컴퓨터 조립 전문점`,
  };
}

// 메인 함수
async function main() {
  console.log('🔧 웰컴시스템 조립 갤러리 설정 업데이트 도구');
  console.log('=====================================\n');

  // 파일 스캔
  const scannedFiles = scanFiles();
  console.log(
    `📊 스캔 결과: 이미지 ${scannedFiles.images.length}개, 동영상 ${scannedFiles.videos.length}개`
  );

  if (scannedFiles.images.length === 0 && scannedFiles.videos.length === 0) {
    console.log('❌ 처리할 파일이 없습니다.');
    rl.close();
    return;
  }

  // 기존 설정 로드
  const existingConfig = loadExistingConfig();

  const config = {
    images: [],
    videos: [],
    settings: {
      imageRotationInterval: 3000,
      autoplay: true,
      muted: true,
      loop: true,
    },
  };

  // 기존 설정이 있으면 settings 유지
  if (existingConfig && existingConfig.settings) {
    config.settings = { ...config.settings, ...existingConfig.settings };
  }

  // 이미지 정보 업데이트
  if (scannedFiles.images.length > 0) {
    console.log('\n📸 이미지 정보를 업데이트합니다...');

    for (const image of scannedFiles.images) {
      const existingInfo = existingConfig?.images?.find((img) => img.filename === image.filename);
      const imageInfo = await updateImageInfo(image, existingInfo);
      config.images.push(imageInfo);
    }
  }

  // 동영상 정보 업데이트
  if (scannedFiles.videos.length > 0) {
    console.log('\n🎥 동영상 정보를 업데이트합니다...');

    for (const video of scannedFiles.videos) {
      const existingInfo = existingConfig?.videos?.find((vid) => vid.filename === video.filename);
      const videoInfo = await updateVideoInfo(video, existingInfo);
      config.videos.push(videoInfo);
    }
  }

  // 설정 저장
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    console.log('\n✅ 설정이 성공적으로 저장되었습니다!');
    console.log(`📁 저장 위치: ${CONFIG_PATH}`);
    console.log('\n📋 업데이트된 내용:');
    console.log(`   - 이미지: ${config.images.length}개`);
    console.log(`   - 동영상: ${config.videos.length}개`);
    console.log(`   - 이미지 순환 간격: ${config.settings.imageRotationInterval}ms`);
  } catch (error) {
    console.error('❌ 설정 저장 중 오류가 발생했습니다:', error.message);
  }

  rl.close();
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scanFiles, loadExistingConfig };
