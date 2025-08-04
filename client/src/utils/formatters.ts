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

export const formatTime = (dateString: string) => {
  const formattedTime = new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return formattedTime.replace(/(AM|PM)/, (match) => match.toLowerCase());
};

export const formatDuration = (duration: string) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
};


export const stopoverDuration = (startDate: Date, endDate: Date): string => {
    // Calculate the difference in milliseconds
    const diffInMs = endDate.getTime() - startDate.getTime();

    // Ensure the duration is not negative
    if (diffInMs < 0) {
        return "0h 0m";
    }

    // Convert milliseconds to hours and minutes
    const totalMinutes = Math.floor(diffInMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
}