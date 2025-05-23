import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { formatKoreanPhoneNumber } from '@/utils/phoneFormatter';
import { INITIAL_FORM_DATA, INITIAL_SECTIONS_STATE, FILE_CONSTRAINTS } from '../constants';
import { validateForm, logFormData, formatFileSize } from '../utils';

export const useInquiryForm = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [totalFileSize, setTotalFileSize] = useState(0);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 전화번호 필드인 경우 포맷팅 적용
    if (name === 'phoneNumber') {
      setFormData((prev) => ({
        ...prev,
        [name]: formatKoreanPhoneNumber(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // File handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles];
    let newTotalSize = totalFileSize;

    files.forEach((file) => {
      newTotalSize += file.size;
      newFiles.push(file);
    });

    if (newTotalSize > FILE_CONSTRAINTS.MAX_TOTAL_SIZE) {
      toast.error('총 파일 크기가 2MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFiles(newFiles);
    setTotalFileSize(newTotalSize);
    e.target.value = null;
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const removedFile = newFiles[index];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setTotalFileSize(totalFileSize - removedFile.size);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    try {
      setIsSubmitting(true);

      // 개발용 콘솔 출력
      logFormData(formData, selectedFiles, formatFileSize);
      console.log('총 파일 크기:', formatFileSize(totalFileSize));

      // API 호출 부분 (주석처리)
      // TODO: API 연동 시 주석 해제
      /*
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });
      selectedFiles.forEach((file) => {
        formDataToSubmit.append('files', file);
      });

      const response = await fetch('/api/applications/inquiry', {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!response.ok) {
        throw new Error('문의 등록 중 오류가 발생했습니다.');
      }
      */

      toast.success('문의가 등록되었습니다!');

      // 폼 초기화
      resetForm();

      // 메인 페이지로 이동
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(error.message || '문의 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form reset
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedFiles([]);
    setTotalFileSize(0);
  };

  // Prevent form submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return {
    // States
    formData,
    selectedFiles,
    totalFileSize,
    isSubmitting,
    fileInputRef,

    // Handlers
    handleChange,
    handleSubmit,
    handleKeyDown,
    handleFileChange,
    removeFile,
    openFileDialog,
    resetForm,
  };
};
