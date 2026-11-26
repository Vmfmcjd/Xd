const isTouch = window.matchMedia('(hover: none)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;


/* Прелоадер. Таймер на 3 секунды на случай, если load не наступит */
function hideLoader() {
  document.getElementById('loader').classList.add('hide');
}

window.addEventListener('load', () => setTimeout(hideLoader, 600));
setTimeout(hideLoader, 3000);

document.getElementById('year').textContent = new Date().getFullYear();


/* Курсор: точка следует сразу, свечение с задержкой */
function initCursor() {
  if (isTouch) return;

  const glow = document.getElementById('glow');
  const dot = document.getElementById('dot');
  let glowX = mouseX;
  let glowY = mouseY;

  addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  (function follow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`;
    requestAnimationFrame(follow);
  })();

  // Один обработчик на весь документ вместо десятков на каждом элементе
  const hoverTargets = 'a, button, .card, .faq-q';
  document.addEventListener('mouseover', (e) => {
    dot.classList.toggle('hover', !!e.target.closest(hoverTargets));
  });
}


/* Частицы на фоне */
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');

  const LINK_DIST = 130;
  const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
  const REPEL_DIST_SQ = 150 * 150;

  let width, height, points = [];
  let running = true;

  function resize() {
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;

    const count = Math.min(90, Math.floor(width * height / 16000));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.5,
    }));
  }

  function draw() {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(180, 170, 255, 0.7)';
    ctx.lineWidth = 1;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Отталкивание от курсора
      const mdx = p.x - mouseX;
      const mdy = p.y - mouseY;
      const mDistSq = mdx * mdx + mdy * mdy;
      if (mDistSq < REPEL_DIST_SQ && mDistSq > 0) {
        const md = Math.sqrt(mDistSq);
        p.x += (mdx / md) * 1.2;
        p.y += (mdy / md) * 1.2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Линии между близкими точками. Сравниваем квадраты расстояний,
      // корень считаем только когда линию действительно надо рисовать
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const distSq = dx * dx + dy * dy;
        if (distSq >= LINK_DIST_SQ) continue;

        const alpha = 0.25 * (1 - Math.sqrt(distSq) / LINK_DIST);
        ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  // Не тратим ресурсы, когда вкладка браузера скрыта
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) draw();
  });

  resize();
  addEventListener('resize', resize);
  if (!reducedMotion) draw();
}


/* Печатающийся текст на первом экране */
function initTyping() {
  const el = document.getElementById('typed');
  const phrases = [
    'Разрабатываю современные сайты с анимациями',
    'Создаю Telegram-ботов под любые задачи',
    'Автоматизирую ваш бизнес',
    'Опыт разработки: 2.5 года',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];
    el.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex++;
      setTimeout(tick, 55);
    } else if (!deleting) {
      deleting = true;
      setTimeout(tick, 1800);
    } else if (charIndex > 0) {
      charIndex--;
      setTimeout(tick, 25);
    } else {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(tick, 300);
    }
  }

  setTimeout(tick, 1800);
}


/* Появление блоков, счётчики и полоски навыков */
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = Number(el.dataset.dec) || 0;
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.classList.add('visible');
      el.querySelectorAll('[data-count]').forEach(countUp);
      el.querySelectorAll('.skill-fill').forEach((bar) => {
        bar.style.width = bar.dataset.w + '%';
      });

      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}


/* Анимированный чат в макете Telegram */
const chat = (() => {
  const container = document.getElementById('chat');
  const STEP = 900;
  const PAUSE_BEFORE_RESTART = 3500;

  const script = [
    ['user', '/start'],
    ['bot', `👋 Привет! Добро пожаловать в магазин.<br>Выберите раздел:
      <div class="tg-kb">
        <span>🛍 Каталог</span><span>🛒 Корзина</span>
        <span>📦 Заказы</span><span>💬 Помощь</span>
      </div>`],
    ['user', '🛍 Каталог'],
    ['bot', 'Вот наши хиты продаж 🔥<br>• Худи: 2 990 ₽<br>• Кепка: 1 290 ₽'],
    ['user', 'Беру худи!'],
    ['bot', '✅ Добавлено в корзину! Оплатить сейчас?'],
  ];

  let timers = [];

  function later(fn, delay) {
    timers.push(setTimeout(fn, delay));
  }

  function addMessage(who, html) {
    const msg = document.createElement('div');
    msg.className = 'msg ' + who;
    msg.innerHTML = html;
    container.appendChild(msg);
    // Двойной rAF, чтобы браузер успел отрисовать начальное состояние
    requestAnimationFrame(() => requestAnimationFrame(() => msg.classList.add('show')));
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg bot show typing-msg';
    el.innerHTML = '<span class="typing-dots"><i></i><i></i><i></i></span>';
    container.appendChild(el);
  }

  function hideTyping() {
    container.querySelector('.typing-msg')?.remove();
  }

  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function start() {
    stop();
    container.innerHTML = '';

    let t = 400;
    for (const [who, html] of script) {
      if (who === 'bot') {
        later(showTyping, t);
        t += STEP;
        later(() => { hideTyping(); addMessage(who, html); }, t);
      } else {
        later(() => addMessage(who, html), t);
      }
      t += STEP;
    }

    later(start, t + PAUSE_BEFORE_RESTART);
  }

  return { start, stop };
})();


/* Вкладки услуг */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  const indicator = document.getElementById('indicator');

  const activeButton = () => document.querySelector('.tab-btn.active');

  function moveIndicator(btn) {
    indicator.style.left = btn.offsetLeft + 'px';
    indicator.style.width = btn.offsetWidth + 'px';
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      moveIndicator(btn);

      // Чат крутится только когда его видно
      if (btn.dataset.tab === 'bots') chat.start();
      else chat.stop();
    });
  });

  moveIndicator(activeButton());
  addEventListener('load', () => moveIndicator(activeButton()));
  addEventListener('resize', () => moveIndicator(activeButton()));
}


/* 3D-наклон карточек */
function initTilt() {
  if (isTouch) return;

  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = (y / rect.height - 0.5) * -14;
      const rotateY = (x / rect.width - 0.5) * 14;

      card.style.setProperty('--x', x + 'px');
      card.style.setProperty('--y', y + 'px');
      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


/* FAQ: одновременно открыт только один вопрос */
function initFaq() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item) => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');

      items.forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });

      if (!wasOpen) {
        const answer = item.querySelector('.faq-a');
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}


/* Копирование контактов в буфер */
function initCopy() {
  const toast = document.getElementById('toast');
  let hideTimer;

  document.querySelectorAll('[data-copy]').forEach((el) => {
    el.addEventListener('click', () => {
      if (!navigator.clipboard) return;

      navigator.clipboard.writeText(el.dataset.copy)
        .then(() => {
          toast.textContent = 'Скопировано: ' + el.dataset.copy;
          toast.classList.add('show');
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => toast.classList.remove('show'), 2200);
        })
        .catch(() => {});
    });
  });
}


/* Полоса прогресса и кнопка "наверх" */
function initScroll() {
  const progress = document.getElementById('progress');
  const toTop = document.getElementById('toTop');
  let ticking = false;

  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? scrollY / max : 0;
    progress.style.transform = `scaleX(${ratio})`;
    toTop.classList.toggle('show', scrollY > 600);
    ticking = false;
  }

  // Обновляем не чаще одного раза за кадр
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
}


/* Запуск */
initCursor();
initParticles();
initTyping();
initReveal();
initTabs();
initTilt();
initFaq();
initCopy();
initScroll();
chat.start();