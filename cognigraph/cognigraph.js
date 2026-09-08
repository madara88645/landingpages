/* CogniGraph v2 landing — small, dependency-free behaviours.
   1) Replay strip: ticks through the "Recognizing a face" pathway using the app's own timings.
   2) Mode index: highlights the mode currently in view.
   3) Reveal-on-scroll and the header hairline.
   Everything degrades to a static page when reduced motion is requested or JS is off. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. replay strip ---- */
  var steps = Array.prototype.slice.call(document.querySelectorAll('#replay-steps .step'));
  var clock = document.getElementById('replay-ms');
  var track = document.querySelector('.replay-track');
  var lastMs = steps.length ? Number(steps[steps.length - 1].getAttribute('data-ms')) : 0;

  function paint(t) {
    var activeIndex = -1;
    steps.forEach(function (li, i) {
      var ms = Number(li.getAttribute('data-ms'));
      li.classList.remove('is-on', 'is-past');
      if (t >= ms) activeIndex = i;
    });
    steps.forEach(function (li, i) {
      if (i < activeIndex) li.classList.add('is-past');
      if (i === activeIndex) li.classList.add('is-on');
    });
    if (clock) clock.textContent = String(Math.round(t));
    return activeIndex;
  }

  if (steps.length && !reduce && 'IntersectionObserver' in window) {
    var paused = false, previousFrame = null;
    var toggle = document.getElementById('replay-toggle');
    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', function () {
        paused = !paused;
        toggle.textContent = paused ? 'Resume replay' : 'Pause replay';
        toggle.setAttribute('aria-pressed', String(paused));
      });
    }
    var SLOW = 9;            // 1 real second = ~111 simulated ms; whole replay ~3.6 s
    var HOLD = 2200;         // pause on the last step before restarting (ms real time)
    var start = null, holding = false, holdStart = 0, running = false, lastActive = -1;

    function frame(now) {
      if (!running) { previousFrame = null; return; }
      var elapsed = previousFrame === null ? 0 : now - previousFrame;
      previousFrame = now;
      if (paused) {
        if (start !== null) start += elapsed;
        if (holding) holdStart += elapsed;
        requestAnimationFrame(frame);
        return;
      }
      if (holding) {
        if (now - holdStart > HOLD) { holding = false; start = now; paint(0); lastActive = -1; }
        requestAnimationFrame(frame);
        return;
      }
      if (start === null) start = now;
      var t = (now - start) / SLOW;
      if (t >= lastMs + 40) { t = lastMs + 40; holding = true; holdStart = now; }
      var a = paint(Math.min(t, lastMs + 40));
      if (a !== lastActive && a >= 0 && track && track.scrollWidth > track.clientWidth) {
        // keep the active step visible on narrow screens
        var el = steps[a];
        track.scrollTo({ left: el.offsetLeft - 12, behavior: 'smooth' });
      }
      lastActive = a;
      requestAnimationFrame(frame);
    }

    // only animate while the strip is on screen
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !running) { running = true; start = null; holding = false; requestAnimationFrame(frame); }
        else if (!e.isIntersecting) { running = false; }
      });
    }, { threshold: 0.2 });
    io.observe(document.querySelector('.replay'));
  } else if (steps.length) {
    // reduced motion: show the whole pathway, settled at the final step
    steps.forEach(function (li, i) { li.classList.add(i === steps.length - 1 ? 'is-on' : 'is-past'); });
    if (clock) clock.textContent = String(lastMs);
  }

  /* ---- 2. mode index highlight ---- */
  var modeLinks = Array.prototype.slice.call(document.querySelectorAll('.mode-index a'));
  var modes = Array.prototype.slice.call(document.querySelectorAll('.mode'));
  if (modeLinks.length && modes.length && 'IntersectionObserver' in window) {
    var current = null;
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) current = e.target.id;
      });
      modeLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + current;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    modes.forEach(function (m) { mo.observe(m); });
  }

  /* ---- 3. reveal + header ---- */
  var rv = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if (rv.length && !reduce && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { ro.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  var head = document.querySelector('.site-head');
  function onScroll() { if (head) head.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* video: never start with sound, even if the muted attribute is dropped by a browser */
  var video = document.getElementById('tour');
  if (video) { video.muted = true; video.defaultMuted = true; }
})();
