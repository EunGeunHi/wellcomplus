import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { formatKoreanPhoneNumber } from '@/utils/phoneFormatter';
import { INITIAL_FORM_DATA, INITIAL_SECTIONS_STATE, FILE_CONSTRAINTS } from '../constants';
import { validateForm, logFormData, formatFileSize } from '../utils';

export const useComputerEstimateForm = () => {
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
    let newTotalSize = totalFileSize;

    files.forEach((file) => {
      newTotalSize += file.size;
      newFiles.push(file);
    });

    if (newTotalSize > FILE_CONSTRAINTS.MAX_TOTAL_SIZE) {
      toast.error('총 파일 크기가 4MB를 초과할 수 없습니다.');
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

      // API 호출 부분
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key]);
      });
      selectedFiles.forEach((file) => {
        formDataToSubmit.append('files', file);
      });

      const response = await fetch('/api/applications/computer', {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!response.ok) {
        throw new Error('견적 신청 중 오류가 발생했습니다.');
      }

      // 폼 초기화
      resetForm();

      // 성공 모달 표시
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || '견적 신청 중 오류가 발생했습니다.');
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
