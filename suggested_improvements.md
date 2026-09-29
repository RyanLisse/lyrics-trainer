# Suggested Improvements for Lyrics Trainer

## Completed Improvements ✅

### Missing Files
1. ✅ **Create PWA Icon Files**: Created icon-192.png and icon-512.png for PWA installation.

### User Experience Enhancements
1. ✅ **Add Loading State**: Loading indicator shows while lyrics are being fetched.
2. ✅ **Implement Dark/Light Theme Toggle**: Manual theme toggle button added with localStorage persistence.
3. ✅ **Implement Swipe Gestures**: Mobile users can swipe left/right to navigate lyrics.

### Error Handling
1. ✅ **Add Error Handling**: Comprehensive error states with user-friendly messages and offline detection.

### Mobile Improvements
1. ✅ **Larger Touch Targets**: All buttons now meet 48px minimum height requirement.
2. ✅ **Responsive Design**: Layout adapts to mobile screens.
3. ✅ **Swipe Navigation**: Touch gestures for previous/next navigation.

### Visual Improvements
1. ✅ **Enhanced Lyrics Display**: Larger font, accent color, and subtle background for better visibility.
2. ✅ **Stable Layout**: Fixed dimensions prevent jumping when lyrics wrap to multiple lines.

### File Support
1. ✅ **Upload Custom Lyrics**: Support for uploading .txt files with custom lyrics.
2. ✅ **Persistent Custom Lyrics**: Custom lyrics saved to localStorage and restored on reload.
3. ✅ **Dedicated Lyrics Folder**: Organized lyrics storage in a dedicated folder.
4. ✅ **Last Used File Memory**: App remembers and loads the last used lyrics file.

### Derived-version improvements (2026, Ryan Lisse)

User experience:
1. ✅ **Add Animation for Transitions**: Lines slide in from the direction you moved (220ms). Skipped entirely when `prefers-reduced-motion: reduce` is set, both in JS and CSS.
2. ✅ **Add Progress Bar**: A `role="progressbar"` bar under the lyric shows how far through the song you are.

Accessibility:
1. ✅ **Enhance Keyboard Navigation**: Shortcuts no longer fire while a slider has focus (arrows used to move the line twice), Home/End no longer scroll the page, and an on-screen shortcut hint was added.
2. ✅ **Improve Screen Reader Support**: A visually hidden live region announces "Line 3 of 14: …" on every line change; the seek slider has `aria-valuetext`; Next/Restart, Play/Pause and the theme toggle have labels that describe the action they will take; loading/error use `role="status"`/`role="alert"`.
3. ✅ **Increase Color Contrast**: All text pairs meet WCAG AA 4.5:1 in light and dark themes, enforced by `tests/contrast.test.ts`. Dark theme buttons previously had white on `#3794ff` (3.07:1) and error text was 3.35:1.
4. ✅ **Add Focus Indicators**: A 3px `:focus-visible` ring on every control.
5. ✅ **Allow zoom**: Removed `user-scalable=no` from the viewport meta (WCAG 1.4.4).

PWA / offline:
1. ✅ **Fix and optimize the Service Worker cache strategy**: The original precache list referenced a non-existent `lyrics.json`, so `cache.addAll()` rejected and offline mode never installed. The worker now precaches the real app shell and bundled lyrics, serves lyrics network-first with a cache fallback that ignores the `?v=` cache-buster, and deletes old cache versions on activate.

Code:
1. ✅ **Testable core**: Pure logic (line parsing, navigation, progress, state validation, contrast maths) lives in `src/lyrics-core.ts` and is tested directly, plus a jsdom test that boots the real app against the real `index.html`.
2. ✅ **Bun tooling**: `bun install` / `bun run …`; `serve` dependency replaced by a small `Bun.serve` script.

## Remaining Improvements

### Performance Optimizations
1. **Implement Lazy Loading**: For any future media assets.
2. **Add Offline Fallback Page**: Custom page when offline. (Bundled lyrics now work offline once cached; a dedicated page is still open.)

### Additional Features
1. **Implement Lyrics Search**: Add ability to search within lyrics.
2. **Add Bookmark Feature**: Allow users to bookmark specific lines.
3. **Implement Share Functionality**: Let users share specific lyrics.
4. **Add Text Size Controls**: Allow users to adjust text size for better readability.
5. **Add Play Speed Control**: Adjust auto-advance speed during playback.
6. **Support More File Formats**: Add support for .lrc (timed lyrics), .srt (subtitles), or structured formats.
7. ~~**Lyrics Library**: Save multiple uploaded songs for quick switching.~~ (✅ Implemented with lyrics folder)
8. **Export Feature**: Export current lyrics to share with others.

### Code Improvements
1. ✅ **Implement Unit Tests**: Add tests for core functionality.
2. **Refactor TypeScript**: Improve type safety and organization. (Started: pure logic extracted to `src/lyrics-core.ts`; the older mock-based tests could now be pointed at it.)
3. **Add Documentation**: Improve code comments and add JSDoc.
4. **Add Build Optimization**: Minify CSS/JS for production.
5. **Add Linting**: Set up ESLint and Prettier for code consistency.

### PWA Enhancements
1. **Add App Shortcuts**: Quick actions from home screen icon.
2. **Implement Background Sync**: Sync state when coming back online.
3. **Add Push Notifications**: Notify users of new features or songs.

### Analytics & Monitoring
1. **Add Usage Analytics**: Track feature usage (with user consent).
2. **Implement Error Tracking**: Monitor and log errors for debugging.
3. **Add Performance Monitoring**: Track app performance metrics.