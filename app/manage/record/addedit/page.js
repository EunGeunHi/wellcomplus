'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';

export default function AddEditRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // 쿼리스트링에서 ID 추출
  const recordId = searchParams.get('id');

  // 상태 정의
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    content: '',
    category: '없음',
  });
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [keepExistingFiles, setKeepExistingFiles] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 페이지 모드 (생성 또는 수정)
  const isEditMode = Boolean(recordId);

  // 인증 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/manage/record/addedit' + (recordId ? `?id=${recordId}` : ''));
    }
  }, [status, router, recordId]);

  // 수정 모드인 경우 기존 레코드 데이터 로드
  useEffect(() => {
    if (isEditMode && status === 'authenticated') {
      const fetchRecord = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/records/${recordId}`);

          if (!response.ok) {
            throw new Error('레코드 조회에 실패했습니다.');
          }

          const data = await response.json();

          setFormData({
            title: data.title || '',
            name: data.name || '',
            content: data.content || '',
            category: data.category || '없음',
          });

          if (data.file && data.file.length > 0) {
            setExistingFiles(data.file);
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRecord();
    }
  }, [isEditMode, recordId, status]);

  // 입력 필드 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 파일 선택 처리
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // 제목 유효성 검사
    if (!formData.title.trim()) {
      setError('제목은 필수 입력 항목입니다.');
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSubmit = new FormData();

      // 기본 필드 추가
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('content', formData.content);
      formDataToSubmit.append('category', formData.category);

      // 파일 추가
      files.forEach((file) => {
        formDataToSubmit.append('files', file);
      });

      // 수정 모드에서 기존 파일 유지 여부
      if (isEditMode) {
        formDataToSubmit.append('keepExistingFiles', keepExistingFiles);
      }

      // API 요청
      const url = isEditMode ? `/api/records/${recordId}` : '/api/records';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSubmit,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '요청 처리 중 오류가 발생했습니다.');
      }

      const result = await response.json();

      setSuccess(isEditMode ? '레코드가 수정되었습니다.' : '레코드가 생성되었습니다.');

      // 리디렉션 (옵션)
      setTimeout(() => {
        router.push(`/manage/record/search`); // 수정된 리다이렉션 경로
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 다운로드 링크 생성
  const getFileDownloadUrl = (recordId, fileIndex) => {
    return `/api/records/${recordId}/file/${fileIndex}`;
  };

  if (status === 'loading') {
    return <div className="text-center p-6">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // useEffect에서 리디렉션 처리
  }

  return (
    <KingOnlySection fallback={<KingFallback />}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">
            {isEditMode ? '레코드 수정' : '새 레코드 생성'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                분류
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="없음">없음</option>
                <option value="자료">자료</option>
                <option value="기록">기록</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                내용
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* 기존 파일 목록 */}
            {isEditMode && existingFiles.length > 0 && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">기존 파일</label>

                <div className="mb-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={keepExistingFiles}
                      onChange={() => setKeepExistingFiles(!keepExistingFiles)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">기존 파일 유지</span>
                  </label>
                </div>

                <ul className="list-disc pl-5">
                  {existingFiles.map((file, index) => (
                    <li key={index} className="mb-1">
                      <a
                        href={getFileDownloadUrl(recordId, index)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {file.fileName} ({Math.round(file.fileSize / 1024)} KB)
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 파일 업로드 */}
            <div className="mb-6">
              <label htmlFor="files" className="block text-gray-700 font-medium mb-2">
                파일 첨부 (.hw, .xlsx, .png 등)
              </label>
              <input
                type="file"
                id="files"
                name="files"
                onChange={handleFileChange}
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-sm mt-1">여러 파일을 선택할 수 있습니다.</p>

              {/* 선택한 파일 미리보기 */}
              {files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">선택한 파일:</p>
                  <ul className="list-disc pl-5">
                    {files.map((file, index) => (
                      <li key={index} className="text-sm">
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Link
                href="/manage/record/search"
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? '처리 중...' : isEditMode ? '수정하기' : '생성하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </KingOnlySection>
  );
}
