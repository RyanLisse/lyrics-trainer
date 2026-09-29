import {
    type TrainerState,
    type Direction,
    DEFAULT_STATE,
    processLyricsText,
    clampIndex,
    nextIndex,
    prevIndex,
    progressPercent,
    positionText,
    lineAnnouncement,
    parseState,
    transitionDirection,
} from './lyrics-core.js';

// Globals shared with the playlist component (see index.html)
declare global {
    interface Window {
        playlistComponent: any;
        loadLyricsFromPath: (filePath: string, fileName: string) => Promise<boolean>;
    }
}

const state: TrainerState = { ...DEFAULT_STATE };

const els = {
    box:        document.getElementById('lyrics-box')  as HTMLDivElement,
    counter:    document.getElementById('counter')     as HTMLDivElement,
    progress:   document.getElementById('progress')    as HTMLDivElement,
    progressFill: document.getElementById('progress-fill') as HTMLDivElement,
    announcer:  document.getElementById('line-announcer') as HTMLDivElement,
    seek:       document.getElementById('seek')        as HTMLInputElement,
    prev:       document.getElementById('prevBtn')     as HTMLButtonElement,
    next:       document.getElementById('nextBtn')     as HTMLButtonElement,
    playPause:  document.getElementById('playPauseBtn')as HTMLButtonElement,
    delayRange: document.getElementById('delayRange')  as HTMLInputElement,
    delayLabel: document.getElementById('delayLabel')  as HTMLSpanElement,
    loading:    document.getElementById('loading')     as HTMLDivElement,
    error:      document.getElementById('error')       as HTMLDivElement,
    content:    document.getElementById('content')     as HTMLDivElement,
    themeToggle:document.getElementById('themeToggle') as HTMLButtonElement,
    uploadBtn:  document.getElementById('uploadBtn')   as HTMLButtonElement,
    resetBtn:   document.getElementById('resetBtn')    as HTMLButtonElement,
    fileInput:  document.getElementById('fileInput')   as HTMLInputElement,
    currentSource: document.getElementById('currentSource') as HTMLSpanElement
};

let lyrics: string[] = [];
let timer: number | null = null;
// Index shown by the previous render; -1 means "nothing shown yet" (no animation)
let renderedIdx = -1;
const STORAGE_KEY = 'lyricsTrainerState';
const THEME_KEY = 'lyricsTrainerTheme';
const CUSTOM_LYRICS_KEY = 'customLyrics';
const LYRICS_SOURCE_KEY = 'lyricsSource';
const DEFAULT_LYRICS_FILE = 'sonnet_18.txt';
const DEFAULT_LYRICS_LABEL = 'Default: Sonnet 18';
const LAST_LYRICS_FILE_KEY = 'lastLyricsFile';
const LYRICS_PATH_KEY = 'lyricsPath';

// Touch tracking for swipe gestures
let touchStartX = 0;
let touchEndX = 0;
const MIN_SWIPE_DISTANCE = 50;

/* ---------- load / persist ---------- */
function loadState(): TrainerState {
    try { return parseState(localStorage.getItem(STORAGE_KEY)); }
    catch { return { ...DEFAULT_STATE }; }
}
function saveState(s: TrainerState){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

/* ---------- theme management ---------- */
function setThemeButton(isDark: boolean){
    els.themeToggle.textContent = isDark ? '☀️' : '🌙';
    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
    els.themeToggle.setAttribute('aria-label', label);
    els.themeToggle.title = label;
}

function loadTheme(){
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        setThemeButton(true);
    } else if (theme === 'light') {
        document.body.classList.add('light-theme');
        setThemeButton(false);
    } else {
        // Auto theme - check system preference
        setThemeButton(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
}

function toggleTheme(){
    const body = document.body;
    const isDark = body.classList.contains('dark-theme') ||
                   (!body.classList.contains('light-theme') &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem(THEME_KEY, 'light');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem(THEME_KEY, 'dark');
    }
    setThemeButton(!isDark);
}

/* ---------- file handling ---------- */
async function loadDefaultLyrics() {
    try {
        // Use the last path if available, or construct from last filename, or fall back to default
        const lyricsPath = localStorage.getItem(LYRICS_PATH_KEY) ||
                         `lyrics/${localStorage.getItem(LAST_LYRICS_FILE_KEY) || DEFAULT_LYRICS_FILE}`;

        const res = await fetch(`${lyricsPath}?v=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) {
            // Fall back to the default file if the last one can't be found
            const defaultRes = await fetch(`lyrics/${DEFAULT_LYRICS_FILE}?v=${Date.now()}`, { cache: 'no-store' });
            if (!defaultRes.ok) {
                throw new Error(`Failed to load lyrics (${defaultRes.status})`);
            }
            const text = await defaultRes.text();

            // Reset the path to default
            localStorage.setItem(LYRICS_PATH_KEY, `lyrics/${DEFAULT_LYRICS_FILE}`);
            localStorage.setItem(LAST_LYRICS_FILE_KEY, DEFAULT_LYRICS_FILE);

            return processLyricsText(text);
        }
        const text = await res.text();
        return processLyricsText(text);
    } catch (error) {
        console.error('Error loading lyrics:', error);
        throw error;
    }
}

async function processLyricsFile(file: File): Promise<string[]> {
    return processLyricsText(await file.text());
}

function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
        els.loading.hidden = false;
        els.loading.textContent = 'Processing lyrics file...';
        els.error.hidden = true;

        processLyricsFile(file)
            .then(lines => {
                if (lines.length === 0) {
                    throw new Error('No lyrics found in file');
                }

                lyrics = lines;
                state.idx = 0;
                renderedIdx = -1;

                // Save to localStorage
                localStorage.setItem(CUSTOM_LYRICS_KEY, JSON.stringify(lines));
                localStorage.setItem(LYRICS_SOURCE_KEY, 'custom');
                localStorage.setItem(LAST_LYRICS_FILE_KEY, file.name);

                // We don't have a real path for uploaded files, so use a special identifier
                localStorage.setItem(LYRICS_PATH_KEY, `custom:${file.name}`);

                // Update UI
                els.currentSource.textContent = `Custom: ${file.name}`;
                els.resetBtn.hidden = false;
                els.loading.hidden = true;
                els.content.hidden = false;

                // Update playlist if available
                if (window.playlistComponent) {
                    window.playlistComponent.refresh();
                }

                render();

                // Reset the input value so the same file can be selected again
                input.value = '';
            })
            .catch(error => {
                els.loading.hidden = true;
                els.error.hidden = false;
                els.error.textContent = error instanceof Error
                    ? `Error: ${error.message}`
                    : 'Failed to process lyrics file';
                console.error('Failed to process file:', error);
            });
    }
}

async function resetToDefaultLyrics() {
    localStorage.removeItem(CUSTOM_LYRICS_KEY);
    localStorage.removeItem(LYRICS_SOURCE_KEY);
    localStorage.setItem(LAST_LYRICS_FILE_KEY, DEFAULT_LYRICS_FILE);
    localStorage.setItem(LYRICS_PATH_KEY, `lyrics/${DEFAULT_LYRICS_FILE}`);

    try {
        // Load default lyrics
        lyrics = await loadDefaultLyrics();

        // Reset UI
        els.currentSource.textContent = DEFAULT_LYRICS_LABEL;
        els.resetBtn.hidden = true;
        state.idx = 0;
        renderedIdx = -1;
        render();

        // Update playlist if available
        if (window.playlistComponent) {
            window.playlistComponent.refresh();
            window.playlistComponent.setActiveFile(`lyrics/${DEFAULT_LYRICS_FILE}`);
        }
    } catch (error) {
        // If direct loading fails, force reload
        location.reload();
    }
}

/* ---------- bootstrap ---------- */
// Initialize theme before anything else
loadTheme();

/**
 * Load lyrics from a specific path
 * @param filePath - Path to the lyrics file
 * @param fileName - Name of the file (for display)
 */
async function loadLyricsFromPath(filePath: string, fileName: string) {
    try {
        els.loading.hidden = false;
        els.loading.textContent = 'Loading lyrics...';
        els.content.hidden = true;
        els.error.hidden = true;

        // Fetch the lyrics file (cache-buster avoids 304/empty-body responses)
        const res = await fetch(`${filePath}?v=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to load lyrics (${res.status})`);
        }

        const text = await res.text();
        const processedLyrics = processLyricsText(text);

        if (processedLyrics.length === 0) {
            throw new Error('No lyrics found in file');
        }

        // Update the lyrics and state
        lyrics = processedLyrics;
        state.idx = 0;
        renderedIdx = -1;

        // Save path information
        localStorage.setItem(LYRICS_PATH_KEY, filePath);
        localStorage.setItem(LAST_LYRICS_FILE_KEY, fileName);
        localStorage.setItem(LYRICS_SOURCE_KEY, 'playlist');

        // Update UI
        els.currentSource.textContent = `Playlist: ${fileName.replace(/\.[^/.]+$/, "")}`;
        els.resetBtn.hidden = false;

        // Hide loading, show content
        els.loading.hidden = true;
        els.content.hidden = false;

        // Render the lyrics
        render();

        // Update playlist active item if available
        if (window.playlistComponent) {
            window.playlistComponent.setActiveFile(filePath);
        }

        return true;
    } catch (error) {
        els.loading.hidden = true;
        els.error.hidden = false;
        els.content.hidden = true;

        els.error.textContent = error instanceof Error
            ? `Error: ${error.message}`
            : 'Failed to load lyrics file';
        console.error('Failed to load lyrics:', error);

        return false;
    }
}

(async function init(){
    try {
        // Make loadLyricsFromPath available globally
        window.loadLyricsFromPath = loadLyricsFromPath;

        // Check for custom lyrics first
        const lyricsSource = localStorage.getItem(LYRICS_SOURCE_KEY);

        if (lyricsSource === 'custom') {
            const customLyrics = localStorage.getItem(CUSTOM_LYRICS_KEY);
            if (customLyrics) {
                lyrics = JSON.parse(customLyrics);
                const lastFile = localStorage.getItem(LAST_LYRICS_FILE_KEY) || 'Custom Lyrics';
                els.currentSource.textContent = `Custom: ${lastFile}`;
                els.resetBtn.hidden = false;
            } else {
                // Fallback to default if custom lyrics are missing
                lyrics = await loadDefaultLyrics();
                els.currentSource.textContent = DEFAULT_LYRICS_LABEL;
            }
        } else {
            lyrics = await loadDefaultLyrics();
            els.currentSource.textContent = DEFAULT_LYRICS_LABEL;
        }

        if (!Array.isArray(lyrics) || lyrics.length === 0) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('Invalid lyrics format');
        }

        const st = loadState();
        state.idx   = clampIndex(st.idx, lyrics.length);
        state.delay = st.delay;

        // Hide loading, show content
        els.loading.hidden = true;
        els.content.hidden = false;

        setupUI();
        render();

        // The playlist component is created by a module script in index.html
        setTimeout(() => {
            const currentPath = localStorage.getItem(LYRICS_PATH_KEY);
            if (currentPath && window.playlistComponent) {
                window.playlistComponent.setActiveFile(currentPath);
            }
        }, 100);
    } catch (error) {
        els.loading.hidden = true;
        els.error.hidden = false;

        // Check if offline
        if (!navigator.onLine) {
            els.error.textContent = 'No internet connection. Please check your connection and refresh.';
        } else {
            els.error.textContent = error instanceof Error
                ? `Error: ${error.message}`
                : 'Failed to load lyrics. Please refresh the page.';
        }
        console.error('Failed to load lyrics:', error);
    }
})();

/* ---------- helpers ---------- */
function prefersReducedMotion(): boolean {
    return typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Restart the slide/fade animation on the lyrics box (skipped for reduced motion). */
function animateLine(direction: Direction){
    const box = els.box;
    box.classList.remove('line-enter-forward', 'line-enter-backward');
    if (direction === 'none' || prefersReducedMotion()) return;
    void box.offsetWidth; // force reflow so the same animation can replay
    box.classList.add(`line-enter-${direction}`);
}

function render(){
    const total = lyrics.length;
    const line = lyrics[state.idx];
    const isLast = state.idx === total - 1;

    if (renderedIdx !== -1) animateLine(transitionDirection(renderedIdx, state.idx));
    const lineChanged = renderedIdx !== state.idx;
    renderedIdx = state.idx;

    els.box.textContent = line;
    els.counter.textContent = `Line ${state.idx+1} / ${total}`;

    const pct = progressPercent(state.idx, total);
    els.progressFill.style.width = `${pct}%`;
    els.progress.setAttribute('aria-valuenow', String(pct));
    els.progress.setAttribute('aria-valuetext', `${pct}% (${positionText(state.idx, total)})`);

    // Only announce real line changes, so tweaking the delay doesn't re-read the line
    if (lineChanged) els.announcer.textContent = lineAnnouncement(state.idx, total, line);

    els.prev.disabled = state.idx === 0;
    els.next.textContent = isLast ? 'Restart' : 'Next';
    els.next.setAttribute('aria-label', isLast ? 'Restart from the first line' : 'Next line');
    els.seek.max = String(total-1);
    els.seek.value = String(state.idx);
    els.seek.setAttribute('aria-valuetext', positionText(state.idx, total));
    els.delayRange.value = String(state.delay/1000);
    els.delayLabel.textContent = String(state.delay/1000);
    saveState(state);
}
function goTo(idx: number){
    state.idx = clampIndex(idx, lyrics.length);
    render();
}
function advance(){ goTo(nextIndex(state.idx, lyrics.length)); }
function back(){ goTo(prevIndex(state.idx)); }
function startTimer(){
    timer = window.setInterval(advance, state.delay);
    els.playPause.textContent = 'Pause ⏸';
    els.playPause.setAttribute('aria-label', 'Pause auto-advance');
}
function stopTimer(){
    if(timer!==null){ clearInterval(timer); timer=null; }
    els.playPause.textContent = 'Play ▶️';
    els.playPause.setAttribute('aria-label', 'Play auto-advance');
}
function toggleTimer(){ timer ? stopTimer() : startTimer(); }

/** True when a keypress belongs to a form control (e.g. arrows on a slider). */
function isFormControl(target: EventTarget | null): boolean {
    return target instanceof HTMLElement &&
        (target.matches('input, select, textarea') || target.isContentEditable);
}

/* ---------- event wiring ---------- */
function setupUI(){
    els.themeToggle.onclick = toggleTheme;
    els.uploadBtn.onclick = () => {
        // Reset the input value before triggering click to ensure onchange fires
        els.fileInput.value = '';
        els.fileInput.click();
    };
    els.fileInput.onchange = handleFileUpload;
    els.resetBtn.onclick = resetToDefaultLyrics;
    els.prev.onclick = back;
    els.next.onclick = advance;
    els.seek.oninput = e => goTo(Number((e.target as HTMLInputElement).value));
    els.playPause.onclick = toggleTimer;
    els.delayRange.oninput = e=>{
        state.delay = Number((e.target as HTMLInputElement).value) * 1000;
        els.delayLabel.textContent = String(state.delay/1000);
        saveState(state);
        if(timer){ stopTimer(); startTimer(); }
    };
    document.addEventListener('keydown', e=>{
        // Let sliders handle their own arrow/Home/End keys (avoids double-stepping)
        if (isFormControl(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
        if(e.key==='ArrowLeft') back();
        else if(e.key==='ArrowRight') advance();
        else if(e.key===' '){ e.preventDefault(); toggleTimer(); }
        else if(e.key==='Home'){ e.preventDefault(); goTo(0); }
        else if(e.key==='End'){ e.preventDefault(); goTo(lyrics.length-1); }
    });
}

/* ---------- touch gestures ---------- */
function handleTouchStart(e: TouchEvent){
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e: TouchEvent){
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe(){
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) < MIN_SWIPE_DISTANCE) return;

    if (distance > 0) {
        back();      // Swipe right - previous
    } else {
        advance();   // Swipe left - next
    }
}

// Setup touch listeners
els.box.addEventListener('touchstart', handleTouchStart, { passive: true });
els.box.addEventListener('touchend', handleTouchEnd);

/* ---------- clean up ---------- */
window.addEventListener('beforeunload', ()=>{ stopTimer(); saveState(state); });
