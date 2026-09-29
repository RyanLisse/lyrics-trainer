/**
 * API for fetching available lyrics files
 */

/**
 * Get a list of all available lyrics files in the lyrics folder
 * @returns {Promise<Array<{name: string, path: string, title: string}>>} Array of file info objects
 */
export async function getAvailableLyrics() {
  try {
    const response = await fetch('lyrics-list.json?v=' + Date.now(), { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch lyrics list (${response.status})`);
    }
    
    const files = await response.json();
    return files.map(file => ({
      name: file,
      path: `lyrics/${file}`,
      title: formatTitle(file)
    }));
  } catch (error) {
    console.error('Error fetching lyrics list:', error);
    // Return default files if fetch fails
    return [
      {
        name: 'sonnet_18.txt',
        path: 'lyrics/sonnet_18.txt',
        title: 'Sonnet 18'
      },
      {
        name: 'casey_at_the_bat.txt',
        path: 'lyrics/casey_at_the_bat.txt',
        title: 'Casey At The Bat'
      }
    ];
  }
}

/**
 * Format filename into a readable title
 * @param {string} filename - The filename including extension
 * @returns {string} A formatted title
 */
function formatTitle(filename) {
  // Remove extension
  let name = filename.replace(/\.[^/.]+$/, "");
  
  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, " ");
  
  // Capitalize words
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}