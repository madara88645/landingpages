(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const animated = [...document.querySelectorAll('.section-head, .study, .ongoing, .product-primary, .product-card, .vibe-feature, .more-products article, .tool, .about > div, .writing, .timeline li, .creds li, .case-card, .case-gallery figure, .steps li, .built, .cv-block, .cv-download')];
  const header = document.querySelector('.site-header');
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  let pending = false;
  function updateProgress() {
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0})`;
    if (header) header.classList.toggle('is-stuck', scrollY > 24);
    pending = false;
  }
  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    animated.forEach(element => {
      // Stagger siblings that enter together (cards in a grid, rows in a list).
      const siblings = [...element.parentElement.children].filter(el => animated.includes(el));
      element.style.setProperty('--reveal-delay', `${Math.min(Math.max(0, siblings.indexOf(element)), 4) * 70}ms`);
      element.classList.add('reveal');
      reveal.observe(element);
    });
    const navLinks = [...document.querySelectorAll('.site-header nav a')];
    const visible = new Map();
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(entry.target.id, entry.isIntersecting));
      const id = [...visible].find(([, isVisible]) => isVisible)?.[0];
      navLinks.forEach(link => {
        if (id && link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
    navLinks.forEach(link => {
      const section = document.querySelector(link.hash);
      if (section) navObserver.observe(section);
    });
    const schedule = document.querySelector('.schedule');
    if (schedule) {
      const scheduleObserver = new IntersectionObserver(entries => {
        schedule.classList.toggle('is-playing', entries[0].isIntersecting && !reduced.matches);
      }, { threshold: 0.4 });
      scheduleObserver.observe(schedule);
    }
  }

  document.querySelectorAll('.study, .product-primary, .product-card, .hero-window').forEach(card => {
    let frame = 0;
    card.addEventListener('pointermove', event => {
      if (reduced.matches || !finePointer.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty('--spot-x', `${x * 100}%`);
        card.style.setProperty('--spot-y', `${y * 100}%`);
        if (card.classList.contains('hero-window')) {
          card.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`);
          card.style.setProperty('--tilt-y', `${(x - 0.5) * 7}deg`);
        }
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });
  document.documentElement.classList.add('motion-ready');
  reduced.addEventListener('change', () => {
    if (reduced.matches) document.querySelectorAll('.is-playing').forEach(el => el.classList.remove('is-playing'));
  });
})();
