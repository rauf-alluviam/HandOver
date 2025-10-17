// src/utils/fileUtils.js
export const validateFile = (file) => {
  const errors = [];
  
  if (file.type !== 'application/pdf') {
    errors.push('Only PDF files are allowed');
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    errors.push('File size should not exceed 5MB');
  }
  
  return errors;
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove data:application/pdf;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};