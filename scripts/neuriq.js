const tour = document.querySelector('.tour-video');
const chapters = [...document.querySelectorAll('[data-time]')];
const status = document.querySelector('.tour-status');
let prepared;
const waitFor = (event) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => {cleanup(); reject(new Error('Video timed out'));}, 20000);
  const cleanup = () => {clearTimeout(timer); tour.removeEventListener(event, done); tour.removeEventListener('error', fail);};
  const done = () => {cleanup(); resolve();};
  const fail = () => {cleanup(); reject(new Error('Video could not load'));};
  tour.addEventListener(event, done, {once:true});
  tour.addEventListener('error', fail, {once:true});
});
// A local media blob makes chapter seeking reliable even on static hosts without byte ranges.
const prepareTour = () => prepared ||= (async () => {
  const response = await fetch(tour.querySelector('source').src);
  if (!response.ok) throw new Error('Video download failed');
  const blob = await response.blob();
  const ready = waitFor('loadedmetadata');
  tour.src = URL.createObjectURL(blob);
  tour.load();
  await ready;
})().catch(error => {prepared = undefined; throw error;});
chapters.forEach(button => button.addEventListener('click', async () => {
  chapters.forEach(b => b.disabled = true);
  status.textContent = 'Preparing your tour…';
  try {
    tour.pause();
    await prepareTour();
    const time = Number(button.dataset.time);
    if (Math.abs(tour.currentTime - time) > .05) {
      const settled = waitFor('seeked');
      tour.currentTime = time;
      await settled;
    }
    await tour.play();
    tour.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center'});
    status.textContent = '';
  } catch (error) {
    status.textContent = 'The tour could not play. Please try again or use the video controls.';
    console.error('Tour chapter failed', error);
  } finally {chapters.forEach(b => b.disabled = false);}
}));
tour.addEventListener('timeupdate', () => {
  const active = chapters.findLast(button => tour.currentTime >= Number(button.dataset.time) - .3);
  chapters.forEach(button => button.setAttribute('aria-pressed', String(button === active)));
});
const dialog = document.querySelector('.screen-dialog');
let previousOverflow;
if (typeof dialog.showModal === 'function') {
  document.querySelectorAll('.shot-link').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      event.preventDefault();
      const source = link.querySelector('img');
      const image = dialog.querySelector('img');
      image.src = link.href;
      image.alt = source.alt;
      dialog.querySelector('p').textContent = source.alt;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    });
  });
  dialog.querySelector('.screen-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {if (event.target === dialog) dialog.close();});
  dialog.addEventListener('close', () => {document.body.style.overflow = previousOverflow;});
}

const sizeButton = dialog.querySelector('.screen-size');
sizeButton.addEventListener('click', () => {
  const expanded = dialog.classList.toggle('is-native');
  sizeButton.setAttribute('aria-pressed', String(expanded));
  sizeButton.textContent = expanded ? 'Fit to screen' : 'Actual size';
});
dialog.addEventListener('close', () => {
  dialog.classList.remove('is-native');
  sizeButton.setAttribute('aria-pressed', 'false');
  sizeButton.textContent = 'Actual size';
});

const themeButtons = [...document.querySelectorAll('[data-tour-theme]')];
const assetRoot = new URL('../assets/neuriq-2026/', location.href);
const assetUrl = name => new URL(name, assetRoot).href;
const applyTourTheme = async (theme, initial = false) => {
  const time = initial ? 0 : tour.currentTime;
  const wasPlaying = !initial && !tour.paused;
  const previousBlob = tour.src;
  tour.pause();
  prepared = undefined;
  document.documentElement.dataset.theme = theme;
  themeButtons.forEach(b => {b.setAttribute('aria-pressed', String(b.dataset.tourTheme === theme));b.disabled = true;});
  chapters.forEach(b => b.disabled = true);
  document.querySelectorAll('[data-shot]').forEach(link => {
    const key = link.dataset.shot;
    const name = key === 'compass' ? `compass-tree-${theme}-v5.png` : `${key}${theme === 'light' ? '-light-v5.png' : '-sharp.png'}`;
    link.href = assetUrl(name);
    const img = link.querySelector('img');
    img.src = link.href;
    if (key === 'compass') {img.width = 1278; img.height = 1800;}
  });
  tour.querySelector('source').src = assetUrl(`neuriq-film-${theme}-v5.mp4`);
  tour.querySelector('a').href = tour.querySelector('source').src;
  tour.poster = assetUrl(theme === 'light' ? 'poster-light-v5.jpg' : 'poster-v4.jpg');
  tour.removeAttribute('src');
  tour.load();
  if (previousBlob.startsWith('blob:')) URL.revokeObjectURL(previousBlob);
  const url = new URL(location.href);
  url.searchParams.set('theme', theme);
  history.replaceState(null, '', url);
  try {
    if (time > 0) {
      await prepareTour();
      const settled = waitFor('seeked');
      tour.currentTime = Math.min(time, tour.duration - .05);
      await settled;
      if (wasPlaying) await tour.play();
    }
    status.textContent = '';
  } catch (error) {
    status.textContent = 'Use the play button to start this version.';
  } finally {
    themeButtons.forEach(b => b.disabled = false);
    chapters.forEach(b => b.disabled = false);
  }
};
themeButtons.forEach(button => button.addEventListener('click', () => {
  if (button.dataset.tourTheme !== document.documentElement.dataset.theme) applyTourTheme(button.dataset.tourTheme);
}));
applyTourTheme(document.documentElement.dataset.theme || 'dark', true);
