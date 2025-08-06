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

  // Define a set of words or patterns that should be exempt from title casing.
  // In this case, we'll specifically look for "O.R."
  const exceptions = ['o.r.', 'o.r', 'klm']; // Include both with and without the trailing dot

  // Split the string into words, handling multiple spaces
  const words = text.split(/\s+/);

  const titleCasedWords = words.map(word => {
    if (word.length === 0) {
      return '';
    }

    const lowerCaseWord = word.toLowerCase();

    // Check if the lowercase word is in our exceptions list.
    if (exceptions.includes(lowerCaseWord)) {
      return word.toUpperCase(); // Return the original word in uppercase
    }

    // Capitalize the first letter and make the rest lowercase
    return lowerCaseWord.charAt(0).toUpperCase() + lowerCaseWord.slice(1);
  });

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

export const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
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


export const parseDurationToMinutes = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return hours * 60 + minutes;
  };

export const formattedPrice = (amount: number): string => {
  return amount.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})};