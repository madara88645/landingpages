// Hero demo: a request is typed, compiled offline, and the output tabs play in turn.
// Content comes from real Prompt Compiler output (shortened). Pausable; static under reduced motion.
(() => {
  const root = document.querySelector('[data-compiler-demo]');
  if (!root) return;

  // Shortened from real offline `compile-export` runs of Prompt Compiler (no API key, no network).
  const SAMPLES = [
    {
      request: 'Make our login endpoint faster',
      prompt: [
        ['Role', 'Senior software engineer and pair-programmer'],
        ['Task', 'Make our login endpoint faster'],
        ['Constraint', 'Clarify ambiguous terms: fast'],
        ['Ask', 'What response time / throughput target?'],
      ],
      steps: [
        { text: 'Ask the clarification questions before choosing an approach', tag: 'clarify' },
        { text: 'Make our login endpoint faster', tag: 'task' },
      ],
      readiness: { label: 'Clarify before compiling', tone: 'warn', note: 'The request is vague — specifics are missing.' },
    },
    {
      request: 'Fix the bug where discounts are applied twice at checkout',
      prompt: [
        ['Role', 'Helpful generative AI assistant'],
        ['Task', 'Fix the bug where discounts are applied twice at checkout'],
        ['Approach', 'Start by listing the plausible causes and check them against the evidence'],
      ],
      steps: [
        { text: 'Fix the bug where discounts are applied twice at checkout', tag: 'explore' },
        { text: 'Cause not yet established: test explanations before committing to a fix', note: true },
      ],
      readiness: { label: 'Ready to compile', tone: 'ok' },
    },
  ];
  const POLICY = [['Risk level', 'low'], ['Execution mode', 'auto_ok'], ['Data sensitivity', 'public']];

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage = root.querySelector('.demo-stage');
  const typed = root.querySelector('.demo-typed');
  const compileBtn = root.querySelector('.demo-compile');
  const status = root.querySelector('.demo-status');
  const tabs = [...root.querySelectorAll('.demo-tabs span')];
  const panels = {
    prompt: root.querySelector('[data-panel="prompt"]'),
    plan: root.querySelector('[data-panel="plan"]'),
    ready: root.querySelector('[data-panel="ready"]'),
  };
  const toggle = root.querySelector('.demo-toggle');

  const esc = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const line = (html, extra = '') => `<div class="demo-line ${extra}">${html}</div>`;

  function fill(sample) {
    panels.prompt.innerHTML = sample.prompt.map(([key, value]) => line(`<b>${esc(key)}</b> ${esc(value)}`)).join('');
    panels.plan.innerHTML = `<ol>${sample.steps.map(step => step.note
      ? `<li class="demo-line demo-note"><span>${esc(step.text)}</span></li>`
      : `<li class="demo-line"><span>${esc(step.text)}</span><em>${esc(step.tag)}</em></li>`).join('')}</ol>`;
    const { label, tone, note } = sample.readiness;
    panels.ready.innerHTML = [
      line(`<span class="demo-badge ${tone}">${esc(label)}</span>${note ? `<small>${esc(note)}</small>` : ''}`),
      ...POLICY.map(([key, value]) => line(`<span class="demo-check" aria-hidden="true"></span>${esc(key)} <code>${esc(value)}</code>`)),
    ].join('');
  }

  function show(name, duration = 0) {
    const order = tabs.map(tab => tab.dataset.tab);
    tabs.forEach(tab => {
      tab.classList.toggle('is-active', tab.dataset.tab === name);
      tab.classList.toggle('is-done', order.indexOf(tab.dataset.tab) < order.indexOf(name));
      tab.style.setProperty('--dur', `${duration}ms`);
    });
    Object.entries(panels).forEach(([key, panel]) => panel.classList.toggle('is-active', key === name));
  }

  function reset() {
    typed.textContent = '';
    status.textContent = 'offline · deterministic';
    compileBtn.classList.remove('is-pressed');
    root.classList.remove('is-compiled');
    tabs.forEach(tab => tab.classList.remove('is-active', 'is-done'));
    Object.values(panels).forEach(panel => panel.classList.remove('is-active'));
  }

  // Sleep that only counts time while the demo is playing and on screen.
  let paused = false;
  let onScreen = true;
  let run = 0;
  function sleep(ms, id) {
    return new Promise(resolve => {
      let left = ms;
      let last = performance.now();
      const tick = now => {
        if (id !== run) return;
        if (!paused && onScreen && !document.hidden) left -= now - last;
        last = now;
        if (left <= 0) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  async function reveal(panel, id, gap) {
    for (const el of panel.querySelectorAll('.demo-line')) {
      await sleep(gap, id);
      if (id !== run) return;
      el.classList.add('is-in');
    }
  }

  async function play(id) {
    let index = 0;
    while (id === run) {
      const sample = SAMPLES[index % SAMPLES.length];
      reset();
      fill(sample);
      await sleep(500, id);
      for (const char of sample.request) {
        if (id !== run) return;
        typed.textContent += char;
        await sleep(char === ' ' ? 55 : 38, id);
      }
      await sleep(350, id);
      compileBtn.classList.add('is-pressed');
      root.classList.add('is-compiling');
      status.textContent = 'compiling offline…';
      await sleep(700, id);
      compileBtn.classList.remove('is-pressed');
      root.classList.remove('is-compiling');
      root.classList.add('is-compiled');
      status.textContent = 'compiled · offline';
      for (const [name, gap, hold] of [['prompt', 170, 1500], ['plan', 260, 1900], ['ready', 220, 2100]]) {
        if (id !== run) return;
        show(name, panels[name].querySelectorAll('.demo-line').length * gap + hold);
        await reveal(panels[name], id, gap);
        await sleep(hold, id);
      }
      root.classList.add('is-leaving');
      await sleep(420, id);
      root.classList.remove('is-leaving');
      index += 1;
    }
  }

  function renderStatic() {
    run += 1;
    const sample = SAMPLES[0];
    reset();
    fill(sample);
    typed.textContent = sample.request;
    status.textContent = 'compiled · offline';
    root.classList.add('is-compiled');
    show('prompt');
    tabs.forEach(tab => tab.classList.remove('is-active', 'is-done'));
    tabs.find(tab => tab.dataset.tab === 'prompt').classList.add('is-active', 'is-static');
    stage.querySelectorAll('.demo-line').forEach(el => el.classList.add('is-in'));
  }

  function start() {
    if (reduced.matches) {
      renderStatic();
      toggle.hidden = true;
      return;
    }
    toggle.hidden = false;
    run += 1;
    play(run);
  }

  const halt = () => root.classList.toggle('is-halted', paused || !onScreen || document.hidden);
  document.addEventListener('visibilitychange', halt);

  toggle.addEventListener('click', () => {
    paused = !paused;
    halt();
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play' : 'Pause';
    root.classList.toggle('is-paused', paused);
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; halt(); }, { threshold: 0.15 }).observe(root);
  }
  reduced.addEventListener('change', start);
  start();
})();
