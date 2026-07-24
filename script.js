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

// ===== BEWERBUNGS-FORMULAR mit Web3Forms =====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('application-form');
  const nameInput = document.getElementById('app-name');
  
  // SSO-Name Validierung
  if (nameInput) {
    // Verhindere Einfügen
    nameInput.addEventListener('paste', (e) => e.preventDefault());
    nameInput.addEventListener('drop', (e) => e.preventDefault());
    
    // Nur Buchstaben und ein Leerzeichen erlauben
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value.replace(/[^A-Za-zÄÖÜäöü ]/g, '');
      // Maximal ein Leerzeichen erlauben
      const parts = nameInput.value.split(' ').filter(p => p !== '');
      if (parts.length > 2) {
        nameInput.value = parts[0] + ' ' + parts[1];
      }
    });
  }
  
  // Prüft ob der Name dem SSO-Format entspricht
  function isValidSSOName(name) {
    const trimmed = name.trim();
    const parts = trimmed.split(' ');
    
    // Muss genau 2 Teile haben (Vorname + Nachname)
    if (parts.length !== 2) return false;
    
    const vorname = parts[0];
    const nachname = parts[1];
    
    // Vorname: 2-15 Buchstaben, erster Buchstabe groß
    if (vorname.length < 2 || vorname.length > 15) return false;
    if (vorname[0] !== vorname[0].toUpperCase()) return false;
    
    // Nachname: 4-20 Buchstaben, erster Buchstabe groß
    if (nachname.length < 4 || nachname.length > 20) return false;
    if (nachname[0] !== nachname[0].toUpperCase()) return false;
    
    // Keine Zahlen oder Sonderzeichen
    if (!/^[A-Za-z]+$/.test(vorname)) return false;
    if (!/^[A-Za-z]+$/.test(nachname)) return false;
    
    // Beleidigungsfilter - blockiert unangemessene Wörter im Namen
    const blocked = [
      'doof', 'dumm', 'blod', 'blöd', 'idiot', 'stupid', 'hate', 'hass',
      'ugly', 'fat', 'dick', 'dumb', 'loser', 'noob', 'suck', 'fool',
      'kill', 'dead', 'die', 'poop', 'poo', 'butt', 'ass', 'damn',
      'hell', 'crap', 'shut', 'fake', 'liar', 'lueg', 'lüg', 'stink',
      'hure', 'fick', 'fuck', 'shit', 'bitch', 'slut', 'whore',
      'nazi', 'arsch', 'wichs', 'penis', 'vagina', 'sex', 'porn',
      'kack', 'scheiss', 'scheiß', 'mist', 'trottel', 'depp',
      'hurensohn', 'missgeburt', 'bastard', 'vollidiot', 'spast',
      'behindert', 'mongo', 'schwul', 'gay', 'lesbe', 'neger',
      'find', 'your', 'you', 'dich', 'euch', 'ihr', 'mich',
      'haha', 'lol', 'lmao', 'rofl', 'omg', 'wtf', 'stfu'
    ];
    
    const lowerFull = (vorname + nachname).toLowerCase();
    for (const word of blocked) {
      if (lowerFull.includes(word)) return false;
    }
    
    return true;
  }
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Name validieren
      if (nameInput && !isValidSSOName(nameInput.value)) {
        alert('❌ Bitte gib einen gültigen SSO-Namen ein. Vorname und Nachname, nur Buchstaben, erster Buchstabe groß.');
        nameInput.focus();
        return;
      }
      
      // Prüfe ob alle Dropdowns ausgefüllt sind
      const selects = form.querySelectorAll('select[required]');
      for (const select of selects) {
        if (select.value === '') {
          const label = select.closest('.form-group').querySelector('label').textContent;
          alert('❌ Bitte fülle noch aus: ' + label);
          select.focus();
          return;
        }
      }
      
      const formData = new FormData(form);
      
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          form.style.display = 'none';
          document.getElementById('success-message').style.display = 'block';
          
          setTimeout(() => {
            form.reset();
            form.style.display = 'block';
            document.getElementById('success-message').style.display = 'none';
          }, 3000);
        } else {
          alert('❌ Es gab einen Fehler beim Senden. Bitte versuche es später erneut.');
        }
      })
      .catch(error => {
        alert('❌ Verbindungsfehler. Bitte überprüfe deine Internetverbindung.');
      });
    });
  }
});

