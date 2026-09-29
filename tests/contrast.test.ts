import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { contrastRatio } from '../src/lyrics-core'

/**
 * WCAG AA check for the colour tokens in public/style.css.
 * Normal text needs 4.5:1; UI components (focus ring, progress fill) need 3:1.
 */
const css = readFileSync(resolve(__dirname, '../public/style.css'), 'utf8')

function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(selector)
  if (start === -1) throw new Error(`selector not found: ${selector}`)
  const block = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  const vars: Record<string, string> = {}
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})/g)) {
    vars[name] = value
  }
  return vars
}

const themes = {
  light: tokens(':root'),
  dark: tokens('body.dark-theme'),
  'auto dark': tokens('body:not(.dark-theme):not(.light-theme)'),
}

const TEXT_PAIRS: Array<[fg: string, bg: string, what: string]> = [
  ['fg', 'bg', 'body text'],
  ['accent', 'bg', 'secondary button text'],
  ['accent', 'surface', 'current lyric line'],
  ['muted', 'bg', 'counter / source label'],
  ['fg', 'surface', 'playlist items'],
  ['on-accent', 'accent', 'primary button text'],
  ['on-accent', 'hover', 'primary button hover'],
  ['on-disabled', 'disabled', 'disabled button text'],
  ['error', 'error-bg', 'error message'],
]

const UI_PAIRS: Array<[fg: string, bg: string, what: string]> = [
  ['accent', 'bg', 'focus ring / progress fill'],
  ['accent', 'track', 'progress fill vs track'],
]

describe.each(Object.entries(themes))('%s theme contrast', (_name, t) => {
  it.each(TEXT_PAIRS)('%s on %s (%s) meets 4.5:1', (fg, bg) => {
    expect(t[fg], `missing --${fg}`).toBeDefined()
    expect(t[bg], `missing --${bg}`).toBeDefined()
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5)
  })

  it.each(UI_PAIRS)('%s on %s (%s) meets 3:1', (fg, bg) => {
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(3)
  })
})

it('auto dark theme uses the same tokens as the manual dark theme', () => {
  expect(themes['auto dark']).toEqual(themes.dark)
})
