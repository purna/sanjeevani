/**
 * CONFIG.JS — Template
 * A single source of truth for all settings and constants.
 * Copy and customize for your story.
 */

const CONFIG = {
    paths: {
        manifest: 'data/manifest.json',
        epilogues: 'data/epilogues.json'
    },

    transitions: {
        textFadeOutDuration: 400,
        textFadeOutEasing: 'easeInQuad'
    },

    compass: {
        indicatorSelector: '#compass-indicator',
        neutralThreshold: 15,
        axisMin: -100,
        axisMax: 100,
        totalBeats: 9
    },

    beats: {
        act2: {
            prayerFullHoldMs: 4000
        }
    },

    palettes: {
        act1: { bg: '#1a2d1a', accent: '#4e9e6b' },
        act2: { bg: '#2d1a0e', accent: '#d4a76a' },
        act3: { bg: '#1a0e2d', accent: '#d4b84b' }
    },

    // Edit mode lets an admin reposition every text box and tune its
    // delay / fade-in / effect live on screen, then save to localStorage
    // and export a JSON file of overrides that can be merged into /data.
    editMode: {
        enabled: true,
        storageKey: 'template-comic-edit-settings',
        toggleKey: 'KeyE',
        effects: ['fade', 'type', 'wave', 'bounce', 'shake'],
        fadeDefault: 600,
        delayDefault: 0
    }
};