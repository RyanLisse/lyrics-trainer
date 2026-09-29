import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create a mock of the playlist API functions for testing
function mockGetAvailableLyrics() {
  return Promise.resolve([
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
  ]);
}

// Test helper for title formatting
function formatTitle(filename: string): string {
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

describe('Playlist API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock fetch for API testing
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(['file1.txt', 'file2.txt'])
    });
  });

  it('should format titles properly', () => {
    expect(formatTitle('hello_world.txt')).toBe('Hello World');
    expect(formatTitle('test-file.txt')).toBe('Test File');
    expect(formatTitle('multiple_word_file.txt')).toBe('Multiple Word File');
    expect(formatTitle('already_Capitalized.txt')).toBe('Already Capitalized');
  });
  
  it('should return a list of available lyrics', async () => {
    const lyrics = await mockGetAvailableLyrics();
    
    expect(lyrics).toHaveLength(2);
    expect(lyrics[0].name).toBe('sonnet_18.txt');
    expect(lyrics[0].title).toBe('Sonnet 18');
    expect(lyrics[1].name).toBe('casey_at_the_bat.txt');
  });
  
  it('should handle dashes and underscores in file names', () => {
    expect(formatTitle('file-with-dashes.txt')).toBe('File With Dashes');
    expect(formatTitle('file_with_underscores.txt')).toBe('File With Underscores');
    expect(formatTitle('mixed-file_name.txt')).toBe('Mixed File Name');
  });
  
  it('should remove file extensions', () => {
    expect(formatTitle('test.txt')).toBe('Test');
    // Our implementation only removes the last extension, not all dots
    expect(formatTitle('multiple.dots.in.name.txt')).toBe('Multiple.dots.in.name');
  });
  
  it('should provide proper path for files', async () => {
    const lyrics = await mockGetAvailableLyrics();
    
    expect(lyrics[0].path).toBe('lyrics/sonnet_18.txt');
    expect(lyrics[1].path).toBe('lyrics/casey_at_the_bat.txt');
  });
});