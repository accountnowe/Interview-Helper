// src/utils/validators.ts

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Should have at least 10 digits
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

export const validateName = (name: string): boolean => {
  // Name should have at least 2 characters and only contain letters and spaces
  return name.trim().length >= 2 && /^[A-Za-z\s]+$/.test(name);
};

export const getMissingFields = (info: {
  name?: string;
  email?: string;
  phone?: string;
}): string[] => {
  const missing: string[] = [];
  
  if (!info.name || !validateName(info.name)) {
    missing.push('name');
  }
  
  if (!info.email || !validateEmail(info.email)) {
    missing.push('email');
  }
  
  if (!info.phone || !validatePhone(info.phone)) {
    missing.push('phone');
  }
  
  return missing;
};

export const formatFieldName = (field: string): string => {
  return field.charAt(0).toUpperCase() + field.slice(1);
};