/**
 * Arabic text utilities for the Khodar wa Fawakih game
 */

// Arabic letters mapping for validation
const arabicLetters = {
  'أ': 'ا',
  'إ': 'ا',
  'آ': 'ا',
  'ا': 'ا',
  'ب': 'ب',
  'ت': 'ت',
  'ث': 'ث',
  'ج': 'ج',
  'ح': 'ح',
  'خ': 'خ',
  'د': 'د',
  'ذ': 'ذ',
  'ر': 'ر',
  'ز': 'ز',
  'س': 'س',
  'ش': 'ش',
  'ص': 'ص',
  'ض': 'ض',
  'ط': 'ط',
  'ظ': 'ظ',
  'ع': 'ع',
  'غ': 'غ',
  'ف': 'ف',
  'ق': 'ق',
  'ك': 'ك',
  'ل': 'ل',
  'م': 'م',
  'ن': 'ن',
  'ه': 'ه',
  'و': 'و',
  'ي': 'ي',
  'ى': 'ي',
  'ة': 'ة'
};

/**
 * Normalize Arabic text by removing diacritics and normalizing letter forms
 * @param {string} text - The Arabic text to normalize
 * @returns {string} - Normalized text
 */
function normalizeArabicText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/[\u064B-\u065F]/g, '') // Remove diacritics (harakat)
    .replace(/[\u0670]/g, '') // Remove Arabic letter superscript alef
    .replace(/[\u06D6-\u06ED]/g, '') // Remove Arabic presentation forms
    .replace(/[\uFE70-\uFEFF]/g, '') // Remove Arabic presentation forms
    .replace(/[ى]/g, 'ي') // Normalize alif maqsura to ya
    .replace(/[أإآ]/g, 'ا') // Normalize alef variants
    .toLowerCase();
}

/**
 * Validate if an Arabic word starts with a specific letter
 * @param {string} word - The word to validate
 * @param {string} letter - The letter it should start with
 * @returns {boolean} - True if valid, false otherwise
 */
function validateArabicWord(word, letter) {
  if (!word || !letter) return false;
  
  const normalizedWord = normalizeArabicText(word);
  const normalizedLetter = normalizeArabicText(letter);
  
  if (normalizedWord.length === 0) return false;
  
  const firstChar = normalizedWord.charAt(0);
  
  // Check if the first character matches the expected letter
  return firstChar === normalizedLetter || 
         arabicLetters[firstChar] === normalizedLetter ||
         arabicLetters[normalizedLetter] === firstChar;
}

/**
 * Check if text contains only Arabic characters
 * @param {string} text - The text to check
 * @returns {boolean} - True if only Arabic characters
 */
function isArabicText(text) {
  if (!text || typeof text !== 'string') return false;
  
  const arabicPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+$/;
  return arabicPattern.test(text);
}

/**
 * Clean and validate Arabic word for game use
 * @param {string} word - The word to clean
 * @returns {string} - Cleaned word or empty string if invalid
 */
function cleanArabicWord(word) {
  if (!word || typeof word !== 'string') return '';
  
  const cleaned = normalizeArabicText(word);
  
  // Remove common non-Arabic characters
  const filtered = cleaned.replace(/[^ا-ي\s]/g, '');
  
  // Check if it's a valid Arabic word (at least 2 characters)
  if (filtered.length < 2 || !isArabicText(filtered)) {
    return '';
  }
  
  return filtered;
}

/**
 * Get the first letter of an Arabic word
 * @param {string} word - The Arabic word
 * @returns {string} - The first letter
 */
function getFirstLetter(word) {
  if (!word || typeof word !== 'string') return '';
  
  const normalized = normalizeArabicText(word);
  return normalized.charAt(0) || '';
}

module.exports = {
  normalizeArabicText,
  validateArabicWord,
  isArabicText,
  cleanArabicWord,
  getFirstLetter,
  arabicLetters
};
