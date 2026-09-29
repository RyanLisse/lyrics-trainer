import { describe, it, expect } from 'vitest'
import {
  processLyricsText,
  clampIndex,
  nextIndex,
  prevIndex,
  progressPercent,
  positionText,
  lineAnnouncement,
  parseState,
  transitionDirection,
  contrastRatio,
  DEFAULT_STATE,
} from '../src/lyrics-core'

// Unlike the older tests, these exercise the real implementation.

describe('processLyricsText', () => {
  it('trims lines and drops blanks', () => {
    expect(processLyricsText('  A  \n\nB\t\n   \nC')).toEqual(['A', 'B', 'C'])
  })

  it('handles Windows line endings', () => {
    expect(processLyricsText('A\r\nB\r\n\r\nC\r\n')).toEqual(['A', 'B', 'C'])
  })

  it('returns an empty array for empty input', () => {
    expect(processLyricsText('')).toEqual([])
  })
})

describe('navigation helpers', () => {
  it('clampIndex keeps the index in range', () => {
    expect(clampIndex(-3, 5)).toBe(0)
    expect(clampIndex(2, 5)).toBe(2)
    expect(clampIndex(99, 5)).toBe(4)
    expect(clampIndex(2.7, 5)).toBe(2)
    expect(clampIndex(NaN, 5)).toBe(0)
    expect(clampIndex(3, 0)).toBe(0)
  })

  it('nextIndex advances and wraps at the end', () => {
    expect(nextIndex(0, 3)).toBe(1)
    expect(nextIndex(2, 3)).toBe(0)
    expect(nextIndex(0, 0)).toBe(0)
  })

  it('prevIndex stops at the first line', () => {
    expect(prevIndex(2)).toBe(1)
    expect(prevIndex(0)).toBe(0)
  })

  it('transitionDirection reports forward, backward and none', () => {
    expect(transitionDirection(1, 2)).toBe('forward')
    expect(transitionDirection(2, 0)).toBe('backward')
    expect(transitionDirection(3, 3)).toBe('none')
  })
})

describe('progress and announcements', () => {
  it('progressPercent counts the current line as reached', () => {
    expect(progressPercent(0, 4)).toBe(25)
    expect(progressPercent(3, 4)).toBe(100)
    expect(progressPercent(0, 3)).toBe(33)
    expect(progressPercent(0, 0)).toBe(0)
  })

  it('builds screen-reader text with position and line', () => {
    expect(positionText(2, 14)).toBe('Line 3 of 14')
    expect(lineAnnouncement(0, 2, 'Hello')).toBe('Line 1 of 2: Hello')
  })
})

describe('parseState', () => {
  it('returns defaults for missing or invalid JSON', () => {
    expect(parseState(null)).toEqual(DEFAULT_STATE)
    expect(parseState('not json')).toEqual(DEFAULT_STATE)
    expect(parseState('42')).toEqual(DEFAULT_STATE)
    expect(parseState('null')).toEqual(DEFAULT_STATE)
  })

  it('keeps valid values', () => {
    expect(parseState('{"idx":4,"delay":1500}')).toEqual({ idx: 4, delay: 1500 })
  })

  it('repairs bad fields individually and clamps the delay', () => {
    expect(parseState('{"idx":-1,"delay":"fast"}')).toEqual(DEFAULT_STATE)
    expect(parseState('{"idx":2,"delay":999999}')).toEqual({ idx: 2, delay: 10000 })
    expect(parseState('{"idx":2,"delay":1}')).toEqual({ idx: 2, delay: 500 })
  })
})

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#fff', '#fff')).toBeCloseTo(1, 5)
    // order of arguments does not matter
    expect(contrastRatio('#0069d9', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#0069d9'), 10)
  })

  it('rejects malformed colours', () => {
    expect(() => contrastRatio('red', '#fff')).toThrow(/Invalid hex/)
  })
})
