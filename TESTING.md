# Testing Approach for Lyrics Trainer

## Overview

This project uses [Vitest](https://vitest.dev/) as the primary testing framework. Vitest was chosen for its:

- Native ESM support (matches the project's module system)
- TypeScript integration
- Fast execution time
- Simple configuration
- JSDOM integration for browser-like environment testing

## Test Structure

The tests are organized as follows:

- `/tests` - Main test directory
  - `lyrics-core.test.ts` - Unit tests for the real pure logic in `src/lyrics-core.ts`
  - `app.dom.test.ts` - Integration test: boots `src/script.ts` against `public/index.html` in jsdom (progress bar, live region, ARIA labels, transitions, reduced motion, keyboard, persistence)
  - `contrast.test.ts` - WCAG AA contrast check of the colour tokens in `public/style.css`
  - `utils.test.ts`, `state.test.ts`, `theme.test.ts`, `navigation.test.ts`, `file-handling.test.ts`, `file-selection.test.ts`, `playlist-*.test.ts` - Original suites (from the upstream exercise); they test local re-implementations of the logic
  - `setup.ts` - Shared mocks (not registered in `vitest.config.ts`; kept from upstream for reference)

## Running Tests

Several Bun scripts are available for testing:

- `bun run test` - Run all tests once (use this, not `bun test`, which starts Bun's DOM-less runner)
- `bun run test:watch` - Run tests in watch mode (rerun on changes)
- `bun run test:ui` - Run tests with UI dashboard
- `bun run test:coverage` - Generate test coverage report

## Test Strategy

The testing approach focuses on:

1. **Unit Testing** - Testing individual functions and components in isolation
2. **Mock-based Testing** - Using mock implementations of browser APIs (localStorage, fetch, etc.)
3. **DOM Testing** - Using JSDOM to test DOM manipulations
4. **State Management** - Verifying state transitions and persistence

## Writing New Tests

When adding new tests:

1. Place test files in the `/tests` directory
2. Name files with `.test.ts` suffix
3. Import necessary test utilities from Vitest
4. Use the setup helpers for common mock needs
5. Follow the existing pattern for creating mock functions based on the real implementations

## Current Test Coverage

The initial test suite covers:

- Lyrics processing functionality
- State management (save/load)
- Theme toggling
- UI element manipulation

## Future Testing Areas

Recommended areas for expanded test coverage:

- File upload handling
- Navigation (next/previous, seek)
- Auto-advancement (play/pause)
- Touch gestures
- Error handling
- Integration tests for the full application flow

## Best Practices

- Keep tests focused on a single piece of functionality
- Mock external dependencies
- Write tests before implementing new features (TDD approach)
- Run tests before committing changes
- Maintain high test coverage for critical functionality