document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVIGATION =====
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = link.getAttribute('data-page');

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === targetPage) {
          page.classList.add('active');
        }
      });
    });
  });

});

// --- Media interactions: toggles, lightbox, date ---
document.addEventListener('DOMContentLoaded', () => {
  // Toggle sections
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    // initialize glyph
    btn.textContent = '▾';
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const open = target.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? '▴' : '▾';
    });
  });

  // Set yesterday date
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const opt = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const dstr = y.toLocaleDateString('de-DE', opt);
  const d1 = document.getElementById('yesterday-date');
  const d2 = document.getElementById('yesterday-date-v');
  if (d1) d1.textContent = dstr;
  if (d2) d2.textContent = dstr;

  const newsDateEl = document.getElementById('news-date');
  if (newsDateEl) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const tuesdayOffset = (dayOfWeek + 5) % 7;
    const currentTuesday = new Date(today);
    currentTuesday.setDate(today.getDate() - tuesdayOffset);
    newsDateEl.textContent = currentTuesday.toLocaleDateString('de-DE', opt);
  }

  const newsDateOldEl = document.getElementById('news-date-old');
  if (newsDateOldEl) {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - mondayOffset);
    const fridayBeforeLast = new Date(currentMonday);
    fridayBeforeLast.setDate(currentMonday.getDate() - 10);
    newsDateOldEl.textContent = fridayBeforeLast.toLocaleDateString('de-DE', opt);
  }

  // Lightbox for photos
  function openLightbox(contentEl) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <div class="lightbox-inner">
        <button class="lightbox-close">✕</button>
        <div class="lightbox-content"></div>
      </div>`;
    document.body.appendChild(lb);
    const inner = lb.querySelector('.lightbox-content');
    inner.appendChild(contentEl);
    lb.querySelector('.lightbox-close').addEventListener('click', () => {
      if (contentEl.tagName === 'VIDEO') { contentEl.pause(); }
      lb.remove();
    });
    lb.addEventListener('click', (e) => { if (e.target === lb) { if (contentEl.tagName === 'VIDEO') contentEl.pause(); lb.remove(); } });
  }

  document.querySelectorAll('.photo-gallery .media-thumb').forEach(img => {
    img.addEventListener('click', () => {
      const big = new Image();
      big.src = img.src;
      big.alt = img.alt || '';
      big.style.maxWidth = '100%';
      big.style.maxHeight = '80vh';
      openLightbox(big);
    });
  });

  // Video is embedded directly in the page; no extra behavior needed.

});

// ===== VISITOR COUNTER WITH COOKIES =====
document.addEventListener('DOMContentLoaded', () => {
  // Cookie handling functions
  function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length);
      }
    }
    return null;
  }

  // Initialize or update visitor count
  let visitorCount = getCookie('visitorCount');
  if (visitorCount === null) {
    visitorCount = 1;
  } else {
    visitorCount = parseInt(visitorCount) + 1;
  }
  setCookie('visitorCount', visitorCount);

  // Display visitor count
  const counterElement = document.getElementById('visitor-count');
  if (counterElement) {
    counterElement.textContent = visitorCount;
  }
});

