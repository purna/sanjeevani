/**
 * COMPASS.JS — Template
 * Two-axis narrative meter: Fear <-> Trust, and Haste <-> Wisdom.
 * Settings pulled from config.js. Epilogue text loaded from data/epilogues.json.
 * No inline styles — only classList/CSS custom property updates.
 * Copy and customize axes for your story.
 */

const Compass = (function () {

    const state = {
        fearTrust: 0,
        hasteWisdom: 0,
        beatsCompleted: new Set()
    };

    let epilogues = null;

    const CLAMP = (v) => Math.max(CONFIG.compass.axisMin, Math.min(CONFIG.compass.axisMax, v));

    async function init() {
        const res = await fetch(CONFIG.paths.epilogues);
        epilogues = await res.json();
        renderIndicator();
    }

    function renderIndicator() {
        const el = document.querySelector(CONFIG.compass.indicatorSelector);
        if (!el) return;

        const wisdomRatio = (state.hasteWisdom - CONFIG.compass.axisMin) /
            (CONFIG.compass.axisMax - CONFIG.compass.axisMin);
        el.style.setProperty('--compass-position', `${wisdomRatio * 100}%`);
        const r = Math.round(180 - wisdomRatio * 120);
        const g = Math.round(90 + wisdomRatio * 130);
        const b = Math.round(70 + wisdomRatio * 180);
        el.style.setProperty('--compass-color', `rgb(${r},${g},${b})`);
    }

    function nudge(axis, amount) {
        if (axis === 'trust') state.fearTrust = CLAMP(state.fearTrust + amount);
        else if (axis === 'fear') state.fearTrust = CLAMP(state.fearTrust - amount);
        else if (axis === 'wisdom') state.hasteWisdom = CLAMP(state.hasteWisdom + amount);
        else if (axis === 'haste') state.hasteWisdom = CLAMP(state.hasteWisdom - amount);
        else if (axis === 'courage') state.fearTrust = CLAMP(state.fearTrust + amount);
        else if (axis === 'fearfulness') state.fearTrust = CLAMP(state.fearTrust - amount);
        else if (axis === 'faith') state.fearTrust = CLAMP(state.fearTrust + amount);
        else if (axis === 'doubt') state.fearTrust = CLAMP(state.fearTrust - amount);
        else if (axis === 'obedience') state.hasteWisdom = CLAMP(state.hasteWisdom + amount);
        else if (axis === 'resistance') state.hasteWisdom = CLAMP(state.hasteWisdom - amount);
        else if (axis === 'endurance') state.hasteWisdom = CLAMP(state.hasteWisdom + amount);
        else if (axis === 'compromise') state.hasteWisdom = CLAMP(state.hasteWisdom - amount);
        else if (axis === 'gratitude') state.hasteWisdom = CLAMP(state.hasteWisdom + amount);
        else if (axis === 'pride') state.hasteWisdom = CLAMP(state.hasteWisdom - amount);
        renderIndicator();
    }

    function recordBeat(beatId) {
        state.beatsCompleted.add(beatId);
    }

    function getCodexCompletion() {
        return Math.round((state.beatsCompleted.size / CONFIG.compass.totalBeats) * 100);
    }

    function getEpilogue() {
        const ft = state.fearTrust;
        const hw = state.hasteWisdom;
        const NEUTRAL = CONFIG.compass.neutralThreshold;

        if (Math.abs(ft) < NEUTRAL && Math.abs(hw) < NEUTRAL) {
            return epilogues.conflicted;
        }

        const axis1 = ft >= 0 ? 'trust' : 'fear';
        const axis2 = hw >= 0 ? 'wisdom' : 'haste';
        return epilogues[`${axis1}_${axis2}`];
    }

    function getSummary() {
        return {
            epilogue: getEpilogue(),
            codexCompletion: getCodexCompletion(),
            axes: { fearTrust: state.fearTrust, hasteWisdom: state.hasteWisdom }
        };
    }

    function reset() {
        state.fearTrust = 0;
        state.hasteWisdom = 0;
        state.beatsCompleted.clear();
        renderIndicator();
    }

    return { init, nudge, recordBeat, getCodexCompletion, getEpilogue, getSummary, reset };
})();