(function () {
  const root = document.documentElement;
  const MODES = new Set(['reading', 'choice', 'game', 'modal', 'transition', 'paused']);
  let mode = 'reading';

  function isInputLocked() {
    return Boolean(root.dataset.storyInputLock);
  }

  function blockWhenLocked(event) {
    if (!isInputLocked()) return;
    if (event.type === 'keydown' && (event.key === 'Escape' || event.key === 'Tab')) return;
    if (isScrollableTarget(event.target)) return;
    event.stopImmediatePropagation();
    if (event.cancelable) event.preventDefault();
  }

  function isInteractiveTarget(target) {
    return Boolean(target && target.closest && target.closest('button, a, select, input, textarea, canvas, [role="dialog"], [contenteditable="true"]'));
  }

  function isScrollableTarget(target) {
    if (!target || !target.closest) return false;
    let node = target;
    while (node && node !== document) {
      if (node.scrollHeight > node.clientHeight) {
        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  function setMode(nextMode, options = {}) {
    if (!MODES.has(nextMode)) throw new Error(`Unknown story mode: ${nextMode}`);
    mode = nextMode;
    root.dataset.storyMode = nextMode;
    if (options.lock) root.dataset.storyInputLock = options.lock === true ? nextMode : options.lock;
    else if (nextMode !== 'modal' && nextMode !== 'paused') delete root.dataset.storyInputLock;
    window.dispatchEvent(new CustomEvent('story:modechange', { detail: { mode } }));
  }

  window.addEventListener('keydown', blockWhenLocked, true);
  window.addEventListener('touchstart', blockWhenLocked, { capture: true, passive: false });
  window.addEventListener('touchend', blockWhenLocked, { capture: true, passive: false });

  function showRuntimeMessage(message, kind = 'notice') {
    let panel = document.getElementById('storyRuntimeMessage');
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'storyRuntimeMessage';
      panel.innerHTML = '<strong></strong><span></span><button type="button" aria-label="Dismiss message">×</button>';
      panel.querySelector('button').addEventListener('click', () => panel.remove());
      document.body.appendChild(panel);
    }
    panel.dataset.kind = kind;
    panel.querySelector('strong').textContent = kind === 'error' ? 'This panel could not load' : 'Downloaded story';
    panel.querySelector('span').textContent = message;
  }

  if (location.protocol === 'file:') {
    window.addEventListener('DOMContentLoaded', () => showRuntimeMessage('Open this comic from the app or a local preview server so its story, SVG and game files can load correctly.'));
  }

  window.addEventListener('unhandledrejection', event => {
    const message = event.reason && event.reason.message ? event.reason.message : 'A required story file was unavailable.';
    showRuntimeMessage(message, 'error');
  });

  window.StoryRuntime = {
    MODES: [...MODES],
    setMode,
    getMode: () => mode,
    allowsNavigation(event) { return mode === 'reading' && !isInputLocked() && !isInteractiveTarget(event && event.target); },
    isInteractiveTarget,
    lock(reason = 'overlay') { root.dataset.storyInputLock = reason; if (reason === 'info-modal') setMode('modal', { lock: reason }); },
    unlock(reason) { if (!reason || root.dataset.storyInputLock === reason) { delete root.dataset.storyInputLock; if (mode === 'modal' || mode === 'paused') setMode('reading'); } },
    isLocked: isInputLocked,
    showMessage: showRuntimeMessage
  };
  setMode('reading');
})();
