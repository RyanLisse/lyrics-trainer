import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Integration test: boots the real src/script.ts against the real
 * public/index.html markup inside jsdom, with fetch and matchMedia stubbed.
 * The module is imported once (it wires document-level listeners at load),
 * so the tests below run in order against one app instance.
 */

const LYRICS = 'First line\nSecond line\n\nThird line\nFourth line\n'
let reducedMotion = false

const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T

function key(k: string, target: EventTarget = document.body) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }))
}

beforeAll(async () => {
  const html = readFileSync(resolve(__dirname, '../public/index.html'), 'utf8')
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script').forEach(s => s.remove())
  document.body.innerHTML = doc.body.innerHTML

  localStorage.clear()
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => LYRICS,
  }) as unknown as typeof fetch

  await import('../src/script')
  await vi.waitFor(() => expect($('content').hidden).toBe(false))
  // init() schedules a 100ms playlist sync; let it run before jsdom is torn down
  await new Promise(r => setTimeout(r, 150))
})

beforeEach(() => {
  reducedMotion = false
})

describe('app boot', () => {
  it('fetches the default lyrics with a cache-buster', () => {
    const url = vi.mocked(fetch).mock.calls[0][0] as string
    expect(url).toMatch(/^lyrics\/sonnet_18\.txt\?v=\d+$/)
  })

  it('renders the first line, counter and source label', () => {
    expect($('lyrics-box').textContent).toBe('First line')
    expect($('counter').textContent).toBe('Line 1 / 4')
    expect($('currentSource').textContent).toBe('Default: Sonnet 18')
    expect($('loading').hidden).toBe(true)
  })

  it('does not animate the very first render', () => {
    expect($('lyrics-box').className).toBe('')
  })
})

describe('progress bar', () => {
  it('reflects position in width and ARIA values', () => {
    const fill = $('progress-fill')
    const bar = $('progress')
    expect(fill.style.width).toBe('25%')
    expect(bar.getAttribute('aria-valuenow')).toBe('25')

    $('nextBtn').click()
    expect(fill.style.width).toBe('50%')
    expect(bar.getAttribute('aria-valuetext')).toBe('50% (Line 2 of 4)')
  })
})

describe('screen reader support', () => {
  it('announces the current line with its position', () => {
    // currently on line 2 from the previous test
    expect($('line-announcer').textContent).toBe('Line 2 of 4: Second line')
    expect($('line-announcer').getAttribute('aria-live')).toBe('polite')
    expect($('lyrics-box').getAttribute('aria-hidden')).toBe('true')
  })

  it('gives the seek slider a human-readable value', () => {
    expect($('seek').getAttribute('aria-valuetext')).toBe('Line 2 of 4')
  })

  it('relabels Next as Restart on the last line', () => {
    key('End')
    const next = $<HTMLButtonElement>('nextBtn')
    expect(next.textContent).toBe('Restart')
    expect(next.getAttribute('aria-label')).toBe('Restart from the first line')
    key('Home')
    expect(next.getAttribute('aria-label')).toBe('Next line')
  })

  it('labels play/pause by the action it will take', () => {
    const btn = $<HTMLButtonElement>('playPauseBtn')
    expect(btn.getAttribute('aria-label')).toBe('Play auto-advance')
    btn.click()
    expect(btn.getAttribute('aria-label')).toBe('Pause auto-advance')
    btn.click()
    expect(btn.getAttribute('aria-label')).toBe('Play auto-advance')
  })

  it('labels the theme toggle by the theme it switches to', () => {
    const toggle = $('themeToggle')
    expect(toggle.getAttribute('aria-label')).toBe('Switch to dark theme')
    toggle.click()
    expect(document.body.classList.contains('dark-theme')).toBe(true)
    expect(toggle.getAttribute('aria-label')).toBe('Switch to light theme')
    toggle.click()
  })
})

describe('line transitions', () => {
  it('slides forward on next and backward on previous', () => {
    key('Home')
    const box = $('lyrics-box')
    $('nextBtn').click()
    expect(box.classList.contains('line-enter-forward')).toBe(true)
    $('prevBtn').click()
    expect(box.classList.contains('line-enter-backward')).toBe(true)
    expect(box.classList.contains('line-enter-forward')).toBe(false)
  })

  it('skips the animation when the user prefers reduced motion', () => {
    reducedMotion = true
    const box = $('lyrics-box')
    $('nextBtn').click()
    expect(box.textContent).toBe('Second line')
    expect(box.classList.contains('line-enter-forward')).toBe(false)
    expect(box.classList.contains('line-enter-backward')).toBe(false)
  })
})

describe('keyboard', () => {
  it('navigates with arrows, Home and End', () => {
    key('Home')
    key('ArrowRight')
    key('ArrowRight')
    expect($('lyrics-box').textContent).toBe('Third line')
    key('ArrowLeft')
    expect($('lyrics-box').textContent).toBe('Second line')
    key('End')
    expect($('lyrics-box').textContent).toBe('Fourth line')
  })

  it('ignores arrow keys aimed at a slider (no double step)', () => {
    key('Home')
    key('ArrowRight', $('seek'))
    expect($('lyrics-box').textContent).toBe('First line')
  })

  it('persists the position to localStorage', () => {
    key('ArrowRight')
    expect(JSON.parse(localStorage.getItem('lyricsTrainerState')!).idx).toBe(1)
  })
})
