import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuoteAnnouncement from '@/models/QuoteAnnouncement';
import { withKingAuthAPI } from '@/app/api/middleware';

/**
 * 소비자용 견적서 공지사항 조회 (관리자 권한 필요)
 *
 * 모든 소비자용 견적서 페이지에서 공통으로 사용하는 템플릿을 제공합니다.
 * 견적서 ID와 관계없이 동일한 템플릿 세트를 사용합니다.
 */
export const GET = withKingAuthAPI(async (request, { session }) => {
  try {
    await connectDB();

    // 소비자용 공지사항 조회 - 모든 견적서가 공유하는 글로벌 설정임
    const announcement = await QuoteAnnouncement.findOne({ type: 'consumer' })
      .sort({ updatedAt: -1 })
      .exec();

    // 기본 템플릿 - 데이터베이스에 없을 경우 사용됨
    const defaultTemplates = [
      '본 견적서는 수급상황에 따라, 금액과 부품이 대체/변동 될 수 있습니다.\n상품의 사양 및 가격은 제조사의 정책에 따라 변경될 수 있습니다.\n계약금 입금 후 주문이 확정됩니다.',
      '',
      '',
      '',
      '',
    ];

    // 기본 템플릿 이름
    const defaultTemplateNames = ['기본 템플릿', '템플릿 2', '템플릿 3', '템플릿 4', '템플릿 5'];

    if (!announcement) {
      return NextResponse.json({
        success: true,
        announcement: defaultTemplates[0],
        templates: defaultTemplates,
        templateNames: defaultTemplateNames,
        activeTemplate: 0,
      });
    }

    // 이전 형식에서 마이그레이션 처리 (이전 데이터와의 호환성 유지)
    if (!announcement.templates && announcement.content) {
      announcement.templates = [announcement.content, '', '', '', ''];
      announcement.activeTemplate = 0;
      await announcement.save();
    }

    // 템플릿 이름 필드 마이그레이션
    if (!announcement.templateNames) {
      announcement.templateNames = defaultTemplateNames;
      await announcement.save();
    }

    return NextResponse.json({
      success: true,
      announcement: announcement.templates[announcement.activeTemplate] || '',
      templates: announcement.templates || defaultTemplates,
      templateNames: announcement.templateNames || defaultTemplateNames,
      activeTemplate: announcement.activeTemplate || 0,
    });
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '공지사항 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
});

/**
 * 소비자용 견적서 공지사항 수정 - 관리자만 가능
 *
 * 저장된 템플릿은 모든 견적서 페이지에서 공통으로 사용됩니다.
 * 한 견적서에서 변경하면 모든 견적서에 적용됩니다.
 */
export const POST = withKingAuthAPI(async (request, { session }) => {
  try {
    await connectDB();

    // 요청 본문 파싱
    const { announcement, templateIndex = 0, templateName = null } = await request.json();

    if (
      !announcement ||
      typeof announcement !== 'string' ||
      templateIndex < 0 ||
      templateIndex > 4 ||
      (templateName !== null && typeof templateName !== 'string')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: '유효하지 않은 요청 데이터입니다.',
        },
        { status: 400 }
      );
    }

    // 기존 공지사항 찾기 - 모든 견적서가 공유하는 하나의 설정 문서
    const existingAnnouncement = await QuoteAnnouncement.findOne({ type: 'consumer' });

    if (existingAnnouncement) {
      // 이전 형식에서 마이그레이션 처리 (이전 데이터와의 호환성 유지)
      if (!existingAnnouncement.templates) {
        existingAnnouncement.templates = [existingAnnouncement.content || '', '', '', '', ''];
      }

      // 템플릿 이름 필드 마이그레이션
      if (!existingAnnouncement.templateNames) {
        existingAnnouncement.templateNames = [
          '기본 템플릿',
          '템플릿 2',
          '템플릿 3',
          '템플릿 4',
          '템플릿 5',
        ];
      }

      // 선택된 템플릿 업데이트 및 활성 템플릿 설정
      // 이 변경사항은 모든 견적서 페이지에 적용됩니다.
      existingAnnouncement.templates[templateIndex] = announcement;
      existingAnnouncement.activeTemplate = templateIndex;
      existingAnnouncement.content = announcement; // 이전 버전과의 호환성 유지

      // 템플릿 이름이 제공된 경우 업데이트
      if (templateName !== null) {
        existingAnnouncement.templateNames[templateIndex] = templateName;
      }

      existingAnnouncement.updatedAt = new Date();
      await existingAnnouncement.save();
    } else {
      // 새 공지사항 생성
      const templates = ['', '', '', '', ''];
      templates[templateIndex] = announcement;

      // 기본 템플릿 이름 설정
      const templateNames = ['기본 템플릿', '템플릿 2', '템플릿 3', '템플릿 4', '템플릿 5'];

      // 템플릿 이름이 제공된 경우 업데이트
      if (templateName !== null) {
        templateNames[templateIndex] = templateName;
      }

      await QuoteAnnouncement.create({
        type: 'consumer',
        templates: templates,
        templateNames: templateNames,
        activeTemplate: templateIndex,
        content: announcement, // 이전 버전과의 호환성 유지
      });
    }

    return NextResponse.json({
      success: true,
      message: '공지사항이 성공적으로 저장되었습니다.',
    });
  } catch (error) {
    console.error('공지사항 저장 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '공지사항 저장 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
});
