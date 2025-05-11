'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KingOnlySection } from '@/app/components/ProtectedContent';
import KingFallback from '@/app/components/kingFallback';
import { format } from 'date-fns';

export default function DeleteNonContractorsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // 비계약자 검색 함수
  const searchNonContractors = async () => {
    if (!startDate || !endDate) {
      setMessage('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // 날짜 형식 조정 (끝 날짜는 해당 일의 마지막 시간으로 설정)
      const formattedEndDate = new Date(endDate);
      formattedEndDate.setHours(23, 59, 59, 999);

      const searchParams = new URLSearchParams({
        startDate: new Date(startDate).toISOString(),
        endDate: formattedEndDate.toISOString(),
      });

      const response = await fetch(`/api/estimates/non-contractors?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error('데이터를 불러오는 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setSearchResults(data.estimates);
      setSearchDone(true);
    } catch (error) {
      console.error('검색 오류:', error);
      setMessage(`오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 선택한 비계약자 일괄 삭제 함수
  const handleDelete = async () => {
    if (!searchResults.length) {
      setMessage('삭제할 데이터가 없습니다.');
      return;
    }

    if (
      !confirm(
        `${searchResults.length}개의 비계약자 데이터를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    setMessage('');

    try {
      // 날짜 형식 조정 (끝 날짜는 해당 일의 마지막 시간으로 설정)
      const formattedEndDate = new Date(endDate);
      formattedEndDate.setHours(23, 59, 59, 999);

      const response = await fetch('/api/estimates/delete-non-contractors', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: new Date(startDate).toISOString(),
          endDate: formattedEndDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('데이터 삭제 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      setMessage(`성공적으로 ${result.deletedCount}개의 비계약자 데이터를 삭제했습니다.`);
      setSearchResults([]);
      setSearchDone(false);
    } catch (error) {
      console.error('삭제 오류:', error);
      setMessage(`오류: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <KingOnlySection fallback={<KingFallback />}>
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">비계약자 일괄삭제</h1>
          <button
            onClick={() => router.push('/manage')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            관리자 페이지로 돌아가기
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">등록일 기간 선택</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-2" htmlFor="startDate">
                시작일
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-2" htmlFor="endDate">
                종료일
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={searchNonContractors}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? '검색 중...' : '비계약자 검색'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 mb-6 rounded-md ${message.includes('오류') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
          >
            {message}
          </div>
        )}

        {searchDone && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  비계약자 검색 결과 ({searchResults.length}건)
                </h2>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading || !searchResults.length}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300"
                >
                  {deleteLoading ? '삭제 중...' : '모두 삭제하기'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        등록일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        견적 유형
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        고객명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        연락처
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        계약구분
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((estimate) => (
                      <tr key={estimate._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(estimate.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {estimate.estimateType || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {estimate.customerInfo?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {estimate.customerInfo?.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {estimate.customerInfo?.contractType || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                검색 조건에 맞는 비계약자 데이터가 없습니다.
              </div>
            )}
          </div>
        )}
      </KingOnlySection>
    </div>
  );
}
