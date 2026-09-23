class AudioManager {
    constructor(options = {}) {
        AudioManager.installStyles();
        this.enabled = AudioManager.readPreference();
        this.currentSrc = null;
        this.musicVolume = options.musicVolume ?? 0.3;
        this.sfxVolume = options.sfxVolume ?? 0.5;
        this.sfxPath = options.sfxPath || 'assets/audio/ping_pong.mp3';
        this.fadeDuration = options.fadeDuration ?? 500;
        this.bgm = new Audio();
        this.bgm.loop = true;
        this.bgm.volume = this.musicVolume;
        this.toggleBtn = document.querySelector('#audioToggle');
        this.fadeTimer = null;
        this.activeSfx = new Set();

        this.updateToggle();
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                if (this.enabled) this.playSfx();
                this.toggle();
                if (this.enabled) this.playSfx();
            });
        }

        document.addEventListener('click', event => {
            const button = event.target.closest('button');
            if (!button || button === this.toggleBtn || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
            this.playSfx();
            if (button.id === 'startBtn') {
                const act = window.__comic && window.__comic.currentAct ? window.__comic.currentAct() : null;
                if (act) this.playAct(act);
            }
        }, true);
    }

    static installStyles() {
        if (document.querySelector('#sharedAudioControlStyles')) return;
        const style = document.createElement('style');
        style.id = 'sharedAudioControlStyles';
        style.textContent = `
            #audioToggle {
                position: absolute; bottom: 3vh; left: 4vw; z-index: 25;
                box-sizing: border-box; width: 52px; height: 52px; min-width: 52px; min-height: 52px; padding: 7px;
                border: 3px solid var(--ink, #0a0812); border-radius: 6px;
                background: #ffd84d; color: var(--ink, #0a0812);
                box-shadow: 4px 4px 0 var(--ink, #0a0812);
                font-size: 22px; line-height: 1; cursor: pointer;
                opacity: 1; pointer-events: auto; transition: transform .2s, box-shadow .2s;
            }
            #audioToggle svg { display: block; width: 30px; height: 30px; overflow: visible; }
            #audioToggle .speaker-body { fill: #fff4bb; stroke: currentColor; stroke-width: 2.6; stroke-linejoin: round; }
            #audioToggle .speaker-cone { fill: #f2a83b; stroke: currentColor; stroke-width: 2.6; stroke-linejoin: round; }
            #audioToggle .sound-wave { fill: none; stroke: #246bce; stroke-width: 2.8; stroke-linecap: round; }
            #audioToggle .mute-slash { fill: none; stroke: #d52d2d; stroke-width: 3.5; stroke-linecap: round; }
            #audioToggle:hover { transform: translateY(-2px); box-shadow: 6px 6px 0 var(--ink, #0a0812); }
            #audioToggle:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
            @media (max-width: 640px) {
                #audioToggle { left: 14px; bottom: 3vh; width: 48px; height: 48px; min-width: 48px; min-height: 48px; }
            }
        `;
        document.head.appendChild(style);
    }

    static readPreference() {
        try { return localStorage.getItem('bibleStoriesAudioEnabled') !== 'false'; }
        catch { return true; }
    }

    static savePreference(enabled) {
        try { localStorage.setItem('bibleStoriesAudioEnabled', String(enabled)); }
        catch { /* Audio still works when storage is unavailable. */ }
    }

    static icon(enabled) {
        const soundMark = enabled
            ? `<path class="sound-wave" d="M21 10.5c2.1 2 2.1 5 0 7"/><path class="sound-wave" d="M24.5 7.5c4 3.8 4 10.2 0 14"/>`
            : `<path class="mute-slash" d="M20.5 11.5l7 7m0-7l-7 7"/>`;
        return `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <path class="speaker-body" d="M4.5 12h5v8h-5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"/>
            <path class="speaker-cone" d="M9.5 12 17 6.5v19L9.5 20Z"/>
            ${soundMark}
        </svg>`;
    }

    playAct(act) {
        const sources = Array.isArray(act && act.audio) ? act.audio : (act && act.audio ? [act.audio] : []);
        this.preloadAct(act);
        if (!sources.length) {
            this.fadeOut(true);
            return;
        }

        const nextSrc = sources[0];
        if (this.currentSrc === nextSrc) {
            if (this.enabled && this.bgm.paused) {
                this.bgm.play().then(() => this.fadeTo(this.musicVolume)).catch(() => {});
            } else if (this.enabled) {
                this.fadeTo(this.musicVolume);
            }
            return;
        }

        const startTrack = () => {
            this.currentSrc = nextSrc;
            this.bgm.src = nextSrc;
            this.bgm.volume = 0;
            let sourceIndex = 1;
            this.bgm.onerror = () => {
                if (sourceIndex >= sources.length) return;
                this.currentSrc = sources[sourceIndex];
                this.bgm.src = sources[sourceIndex++];
                if (this.enabled) this.bgm.play().then(() => this.fadeTo(this.musicVolume)).catch(() => {});
            };
            if (this.enabled) this.bgm.play().then(() => this.fadeTo(this.musicVolume)).catch(() => {});
        };

        if (!this.bgm.paused) this.fadeOut(false, startTrack);
        else startTrack();
    }

    preloadAct(act) {
        const sources = Array.isArray(act && act.audio) ? act.audio : (act && act.audio ? [act.audio] : []);
        const effects = Array.isArray(act && act.sfx) ? act.sfx : [];
        return this.preloadFiles([...sources, ...effects]);
    }

    preloadStory(story, extraEffects = []) {
        const acts = Array.isArray(story) ? story : (Array.isArray(story && story.acts) ? story.acts : []);
        const files = [this.sfxPath, ...extraEffects];
        acts.forEach(act => {
            const music = Array.isArray(act.audio) ? act.audio : (act.audio ? [act.audio] : []);
            const effects = Array.isArray(act.sfx) ? act.sfx : [];
            files.push(...music, ...effects);
            (act.lines || []).forEach(line => {
                const lineEffects = Array.isArray(line.audioSfx) ? line.audioSfx : (line.audioSfx ? [line.audioSfx] : []);
                files.push(...lineEffects);
            });
        });
        return this.preloadFiles(files);
    }

    preloadFiles(files) {
        const unique = [...new Set(files.filter(Boolean))];
        if (window.AssetDownloadManager) return window.AssetDownloadManager.downloadAudio(unique);
        unique.forEach(path => {
            const media = new Audio();
            media.preload = 'auto';
            media.src = path;
            media.load();
        });
        return Promise.resolve({ completed: unique.length, total: unique.length, failures: [] });
    }

    playSfx(path = this.sfxPath) {
        if (!this.enabled) return;
        const sfx = new Audio(path);
        sfx.volume = this.sfxVolume;
        this.activeSfx.add(sfx);
        const release = () => this.activeSfx.delete(sfx);
        sfx.addEventListener('ended', release, { once: true });
        sfx.addEventListener('error', release, { once: true });
        sfx.play().catch(release);
    }

    playLineSfx(line) {
        const effects = Array.isArray(line && line.audioSfx) ? line.audioSfx : (line && line.audioSfx ? [line.audioSfx] : []);
        this.stopSfx();
        effects.forEach(path => this.playSfx(path));
    }

    startSfxLoop(path, volume = 0.08) {
        if (!this.enabled) return null;
        const sfx = new Audio(path);
        sfx.loop = true;
        sfx.volume = Math.min(this.sfxVolume, volume);
        this.activeSfx.add(sfx);
        sfx.play().catch(() => this.activeSfx.delete(sfx));
        return sfx;
    }

    stopSfx() {
        this.activeSfx.forEach(sfx => { sfx.pause(); sfx.currentTime = 0; });
        this.activeSfx.clear();
    }

    toggle() {
        this.enabled = !this.enabled;
        AudioManager.savePreference(this.enabled);
        this.updateToggle();
        if (!this.enabled) {
            this.stopSfx();
            this.fadeOut(false);
        } else {
            const act = window.__comic && window.__comic.currentAct ? window.__comic.currentAct() : null;
            if (act) this.playAct(act);
        }
    }

    updateToggle() {
        if (!this.toggleBtn) return;
        const label = this.enabled ? 'Turn audio off' : 'Turn audio on';
        this.toggleBtn.innerHTML = AudioManager.icon(this.enabled);
        this.toggleBtn.setAttribute('aria-label', label);
        this.toggleBtn.setAttribute('aria-pressed', String(this.enabled));
        this.toggleBtn.title = label;
    }

    fadeTo(target, callback) {
        if (this.fadeTimer) clearInterval(this.fadeTimer);
        const start = this.bgm.volume;
        const startedAt = performance.now();
        this.fadeTimer = setInterval(() => {
            const progress = Math.min(1, (performance.now() - startedAt) / this.fadeDuration);
            this.bgm.volume = start + (target - start) * progress;
            if (progress === 1) {
                clearInterval(this.fadeTimer);
                this.fadeTimer = null;
                if (callback) callback();
            }
        }, 25);
    }

    fadeOut(clearSource = false, callback) {
        if (this.bgm.paused) {
            if (clearSource) this.currentSrc = null;
            if (callback) callback();
            return;
        }
        this.fadeTo(0, () => {
            this.bgm.pause();
            if (clearSource) this.currentSrc = null;
            if (callback) callback();
        });
    }
}

window.AudioManager = AudioManager;
