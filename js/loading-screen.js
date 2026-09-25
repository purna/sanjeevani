(function () {
  const themes = {
    Adam: { title: 'ADAM & EVE', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path fill="#ffd342" d="M32 6c1.5 10.5 5.5 14.5 16 16-10.5 1.5-14.5 5.5-16 16-1.5-10.5-5.5-14.5-16-16 10.5-1.5 14.5-5.5 16-16Z"/><path fill="#ff9d42" d="M48 35c.8 5.2 2.8 7.2 8 8-5.2.8-7.2 2.8-8 8-.8-5.2-2.8-7.2-8-8 5.2-.8 7.2-2.8 8-8Z"/></svg>', color: '#4b9b72' },
    Daniel: { title: 'DANIEL', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="23" fill="#d9772d"/><circle cx="32" cy="32" r="15" fill="#f6b84f"/><circle cx="25" cy="29" r="2" fill="#17131f"/><circle cx="39" cy="29" r="2" fill="#17131f"/><path fill="#17131f" d="M29 36h6l-3 4-3-4Z"/><path fill="none" stroke="#17131f" stroke-linecap="round" stroke-width="2" d="M32 40v3m0 0c-2 2-5 2-7 0m7 0c2 2 5 2 7 0"/></svg>', color: '#704b9f' },
    Eiljah: { title: 'ELIJAH', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path fill="#ef463a" d="M32 5c2 10-8 13-8 24a12 12 0 0 0 24 0c0-7-4-10-6-15-3 3-4 5-4 8-3-5-4-10-6-17Z"/><path fill="#ffd342" d="M32 24c1 5-4 6-4 11a6 6 0 0 0 12 0c0-3-2-4-3-7-1 1-1 2-1 3-1-2-2-4-4-7Z"/></svg>', color: '#bd6a2d' },
    Jonah: { title: 'JONAH', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path fill="#197f9f" d="M6 40c8-14 24-21 39-18 7 1 12 5 14 10 2-2 4-2 5-1-1 4-4 7-8 8-5 8-16 13-28 12C16 51 8 47 6 40Z"/><path fill="#0f5f78" d="M17 40c7-7 17-11 27-10-7 4-12 10-15 17-5-1-9-3-12-7Z"/><circle cx="47" cy="33" r="2" fill="#17131f"/><path fill="none" stroke="#7dd3e6" stroke-linecap="round" stroke-width="2" d="M24 18c-2-3-1-6 2-8m7 8c0-4 2-7 5-8"/></svg>', color: '#197f9f' },
    Moses: { title: 'MOSES', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path fill="#ef463a" d="M32 5c2 10-8 13-8 24a12 12 0 0 0 24 0c0-7-4-10-6-15-3 3-4 5-4 8-3-5-4-10-6-17Z"/><path fill="#ffd342" d="M32 24c1 5-4 6-4 11a6 6 0 0 0 12 0c0-3-2-4-3-7-1 1-1 2-1 3-1-2-2-4-4-7Z"/></svg>', color: '#c87a30' },
    Noah: { title: 'NOAH', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path fill="#315f85" d="M8 42h48l-7 12H15L8 42Z"/><path fill="#67d1c4" d="M20 42V28h24v14H20Z"/><path fill="#fff3cf" d="M24 32h16v10H24V32Z"/><path fill="#17131f" d="M31 28V10h2v18h-2Z"/><path fill="#fff3cf" d="M34 12v15l10-7-10-8Z"/><path fill="#ef463a" d="M28 12v15l-9-7 9-8Z"/><path fill="none" stroke="#17131f" stroke-width="2" d="M8 42h48l-7 12H15L8 42Z"/></svg>', color: '#315f85' }
  };
  const parts = location.pathname.split('/').filter(Boolean);
  const folder = (/\.html?$/i.test(parts.at(-1) || '') ? parts.at(-2) : parts.at(-1)) || 'Story';
  const theme = themes[folder] || {
    title: 'SANJEEVANI',
    icon: '<img src="assets/gfx/golden-star-rosette.svg" alt="Golden star rosette" style="width:100%;height:100%;display:block">',
    color: '#c87a30'
  };

function build() {
    if (document.getElementById('comicLoader')) return;
    const loader = document.createElement('section');
    loader.id = 'comicLoader';
    loader.className = 'comic-loader';
    loader.style.setProperty('--loader-color', theme.color);
    loader.setAttribute('aria-live', 'polite');
    loader.innerHTML = `<div class="comic-loader-card"><span class="comic-loader-issue">${I18n ? I18n.t('loadingIssue') : 'LOADING ISSUE'}</span><h1>${theme.title}</h1><div class="comic-loader-icon" aria-hidden="true">${theme.icon}</div><div class="comic-loader-status">${I18n ? I18n.t('loadingStatus') : 'Preparing the panels…'}</div><div class="comic-loader-track"><div class="comic-loader-fill"></div></div><div class="comic-loader-count">0%</div><button class="comic-loader-skip" type="button">${I18n ? I18n.t('loadingSkip') : 'Open while downloading'}</button></div>`;
    document.body.prepend(loader);
    const finish = () => {
      if (window.__storyAssetsReady) return;
      window.__storyAssetsReady = true;
      window.dispatchEvent(new CustomEvent('story:assetsready'));
      loader.classList.add('done');
      setTimeout(() => loader.remove(), 450);
    };
    loader.querySelector('button').addEventListener('click', finish);

    if (!window.AssetDownloadManager || location.protocol === 'file:') {
      loader.querySelector('.comic-loader-status').textContent = location.protocol === 'file:' ? (I18n ? I18n.t('loadingFileMode') : 'Open from the app to download this issue.') : (I18n ? I18n.t('loadingOpen') : 'Opening comic…');
      setTimeout(finish, 900);
      return;
    }

    AssetDownloadManager.prepare({ onProgress: ({ completed, total, failures }) => {
      const percent = total ? Math.round(completed / total * 100) : 100;
      loader.style.setProperty('--loader-progress', `${percent}%`);
      loader.querySelector('.comic-loader-count').textContent = `${percent}% · ${completed}/${total}`;
      loader.querySelector('.comic-loader-status').textContent = failures ? `Preparing panels · ${failures} item${failures === 1 ? '' : 's'} will retry` : (I18n ? I18n.t('loadingDownload') : 'Downloading panels, music and effects…');
    }}).then(result => {
      loader.querySelector('.comic-loader-status').textContent = result.failures.length ? (I18n ? I18n.t('loadingMissing') : 'Comic ready · missing items will retry when needed') : (I18n ? I18n.t('loadingReady') : 'Issue downloaded — ready!');
      setTimeout(finish, 500);
    }).catch(error => {
      loader.querySelector('.comic-loader-status').textContent = error.message;
      loader.querySelector('.comic-loader-status').classList.add('comic-loader-error');
      loader.querySelector('button').textContent = I18n ? I18n.t('loadingOpenAnyway') : 'Open comic anyway';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => I18n ? I18n.onReady(build) : setTimeout(build, 0));
  else if (typeof I18n !== 'undefined' && I18n.isReady()) build();
  else window.addEventListener('i18n:ready', build, { once: true });

  window.addEventListener('i18n:languagechange', () => {
    const status = document.querySelector('.comic-loader-status');
    const count = document.querySelector('.comic-loader-count');
    const skipBtn = document.querySelector('.comic-loader-skip');
    if (status) status.textContent = I18n.t('loadingStatus');
    if (count) count.textContent = '0%';
    if (skipBtn) skipBtn.textContent = I18n.t('loadingSkip');
  });
})();
