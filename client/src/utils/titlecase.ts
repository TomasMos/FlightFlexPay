/**
 * Converts a string from all caps to title case.
 * Handles multiple spaces and trims leading/trailing whitespace.
 *
 * @param {string} text - The input string, expected to be in all caps.
 * @returns {string} The string converted to title case.
 */
export const toTitleCase = (text: string): string => {
  if (!text) {
    return '';
  }

  // Convert the entire string to lowercase first
  const lowerCaseText = text.toLowerCase().trim();

  // Split the string into words, handling multiple spaces
  const words = lowerCaseText.split(/\s+/);

  // Capitalize the first letter of each word
  const titleCasedWords = words.map(word => {
    // Check if the word is not empty to avoid errors on extra spaces
    if (word.length > 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return '';
  });

  // Join the words back together with a single space
  return titleCasedWords.join(' ');
};
