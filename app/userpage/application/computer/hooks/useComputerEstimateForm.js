import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { formatKoreanPhoneNumber } from '@/utils/phoneFormatter';
import { INITIAL_FORM_DATA, INITIAL_SECTIONS_STATE, FILE_CONSTRAINTS } from '../constants';
import { validateForm, logFormData, formatFileSize } from '../utils';
import { uploadMultipleFiles, validateFiles } from '@/lib/client-blob-upload-application';

export const useComputerEstimateForm = (session) => {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const [openSections, setOpenSections] = useState(INITIAL_SECTIONS_STATE);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

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

    // 수령방법이 '직접방문'으로 변경되면 주소 초기화
    if (name === 'deliveryMethod' && value === '직접방문') {
      setFormData((prev) => ({
        ...prev,
        address: '',
      }));
    }
  };

  // Section toggle
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Budget handlers
  const addBudget = (amount) => {
    const currentBudget = formData.budget.replace(/[^0-9]/g, '');
    const newBudget = (parseInt(currentBudget || '0') + amount).toLocaleString();
    setFormData((prev) => ({
      ...prev,
      budget: newBudget,
    }));
  };

  const clearBudget = () => {
    setFormData((prev) => ({ ...prev, budget: '' }));
  };

  // File handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles];

    files.forEach((file) => {
      newFiles.push(file);
    });

    try {
      // 파일 검증 (개수, 타입, 크기)
      validateFiles(newFiles);

      setSelectedFiles(newFiles);
      setTotalFileSize(newFiles.reduce((sum, file) => sum + file.size, 0));
      e.target.value = null;
    } catch (error) {
      toast.error(error.message);
      e.target.value = null;
    }
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    setTotalFileSize(newFiles.reduce((sum, file) => sum + file.size, 0));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Modal handlers
  const handleSubmitClick = (e) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    submitForm();
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push('/');
  };

  // Form submission
  const submitForm = async () => {
    try {
      setIsSubmitting(true);

      // 개발용 콘솔 출력
      logFormData(formData, selectedFiles, formatFileSize);
      console.log('총 파일 크기:', formatFileSize(totalFileSize));

      let uploadedFiles = [];

      // 파일이 있는 경우 클라이언트에서 직접 업로드
      if (selectedFiles.length > 0) {
        // 임시 신청서 ID 생성 (파일명에 사용)
        const tempId = Date.now().toString();

        uploadedFiles = await uploadMultipleFiles(
          selectedFiles,
          session?.user?.id,
          tempId,
          (progress) => {
            setUploadProgress(progress);
          }
        );
      }

      // 업로드 진행률 초기화
      setUploadProgress(null);

      // API 호출 (JSON 방식)
      const response = await fetch('/api/applications/computer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          files: uploadedFiles,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '견적 신청 중 오류가 발생했습니다.');
      }

      // 폼 초기화
      resetForm();

      // 성공 모달 표시
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || '견적 신청 중 오류가 발생했습니다.');
      setUploadProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form reset
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedFiles([]);
    setTotalFileSize(0);
    setOpenSections(INITIAL_SECTIONS_STATE);
    setUploadProgress(null);
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
    openSections,
    isSubmitting,
    fileInputRef,
    showConfirmModal,
    showSuccessModal,
    uploadProgress,

    // Handlers
    handleChange,
    handleSubmitClick,
    handleKeyDown,
    toggleSection,
    addBudget,
    clearBudget,
    handleFileChange,
    removeFile,
    openFileDialog,
    resetForm,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleSuccessConfirm,
  };
};
