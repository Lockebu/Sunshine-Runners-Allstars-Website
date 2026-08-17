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

// ===== BEWERBUNGS-FORMULAR mit Web3Forms =====
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('application-form');
  const nameInput = document.getElementById('app-name');

  // ===== Gründer-Modus (Geheimcode) =====
  // Vorübergehend deaktiviert (WhatsApp-Kanal Link wurde bereits übermittelt).
  // Zum Reaktivieren einfach FOUNDER_ENABLED auf true setzen.
  const FOUNDER_ENABLED = false;
  const FOUNDER_CODE = 'SunshineRunnersAllstarsCode';
  const founderGroup = document.getElementById('founder-group');
  const founderLink = document.getElementById('founder-link');
  let founderMode = false;

  // WhatsApp-Kanal Link Prüfung
  function isValidWhatsAppChannelLink(url) {
    return /^https:\/\/(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]{10,}$/.test(url.trim());
  }

  function updateFounderMode() {
    const active = FOUNDER_ENABLED && nameInput && nameInput.value.trim() === FOUNDER_CODE;
    if (active === founderMode) return;
    founderMode = active;

    // Native Browser-Validierung des Namensfelds im Gründer-Modus abschalten,
    // damit der Code trotz SSO-Pattern abgeschickt werden kann.
    if (nameInput) {
      if (founderMode) {
        nameInput.dataset.pattern = nameInput.getAttribute('pattern') || '';
        nameInput.removeAttribute('pattern');
        nameInput.removeAttribute('required');
      } else {
        if (nameInput.dataset.pattern) nameInput.setAttribute('pattern', nameInput.dataset.pattern);
        nameInput.setAttribute('required', '');
      }
    }

    // Alle normalen Fragen ein-/ausblenden (alles außer Namensfeld und Gründer-Feld)
    form.querySelectorAll('.form-group').forEach(group => {
      if (group === founderGroup) return;
      if (group.contains(nameInput)) return; // Namensfeld bleibt sichtbar
      const disable = founderMode;
      group.style.display = disable ? 'none' : '';
      // Pflichtfelder im Gründer-Modus deaktivieren, sonst blockt der Browser das Absenden
      group.querySelectorAll('[required]').forEach(el => {
        if (disable) {
          el.dataset.wasRequired = '1';
          el.removeAttribute('required');
        } else if (el.dataset.wasRequired) {
          el.setAttribute('required', '');
          delete el.dataset.wasRequired;
        }
      });
    });

    if (founderGroup) founderGroup.style.display = founderMode ? 'block' : 'none';
  }

  // SSO-Name Validierung
  if (nameInput) {
    // Verhindere Einfügen
    nameInput.addEventListener('paste', (e) => e.preventDefault());
    nameInput.addEventListener('drop', (e) => e.preventDefault());

    // Nur Buchstaben und ein Leerzeichen erlauben
    nameInput.addEventListener('input', () => {
      // Erst prüfen, ob der Gründer-Code getippt wurde
      if (FOUNDER_ENABLED && nameInput.value.trim() === FOUNDER_CODE) {
        updateFounderMode();
        return;
      }
      nameInput.value = nameInput.value.replace(/[^A-Za-zÄÖÜäöü ]/g, '');
      // Maximal ein Leerzeichen erlauben
      const parts = nameInput.value.split(' ').filter(p => p !== '');
      if (parts.length > 2) {
        nameInput.value = parts[0] + ' ' + parts[1];
      }
      updateFounderMode();
    });
  }
  
  // Prüft ob der Name dem SSO-Format entspricht
  function isValidSSOName(name) {
    // Leerzeichen vorne/hinten und doppelte Leerzeichen ignorieren
    const parts = name.trim().split(/\s+/).filter(p => p !== '');

    // Muss genau 2 Teile haben (Vorname + Nachname)
    if (parts.length !== 2) return false;

    const vorname = parts[0];
    const nachname = parts[1];

    // Erlaubte Buchstaben (inkl. Umlaute und ß)
    const letters = /^[A-Za-zÄÖÜäöüß]+$/;

    // Vorname: 2-15 Buchstaben, erster Buchstabe groß
    if (vorname.length < 2 || vorname.length > 15) return false;
    if (vorname[0] !== vorname[0].toUpperCase()) return false;

    // Nachname: 2-20 Buchstaben, erster Buchstabe groß
    if (nachname.length < 2 || nachname.length > 20) return false;
    if (nachname[0] !== nachname[0].toUpperCase()) return false;

    // Nur Buchstaben (keine Zahlen oder Sonderzeichen)
    if (!letters.test(vorname)) return false;
    if (!letters.test(nachname)) return false;

    // Beleidigungsfilter: nur eindeutige Schimpfwörter, als GANZES Wort
    // (kein Teilwort-Treffer mehr, damit normale Namen nie fälschlich blockiert werden)
    const blocked = [
      'fuck', 'shit', 'bitch', 'fick', 'hure', 'hurensohn',
      'nazi', 'nigger', 'neger', 'porn', 'penis', 'vagina',
      'wichser', 'arschloch', 'missgeburt', 'vollidiot'
    ];
    const lowerParts = [vorname.toLowerCase(), nachname.toLowerCase()];
    for (const word of blocked) {
      if (lowerParts.includes(word)) return false;
    }

    return true;
  }
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // ===== Gründer-Modus: nur WhatsApp-Kanal Link senden =====
      if (founderMode) {
        if (!founderLink || !isValidWhatsAppChannelLink(founderLink.value)) {
          alert('❌ Bitte gib einen gültigen WhatsApp-Kanal-Link ein (https://whatsapp.com/channel/...).');
          if (founderLink) founderLink.focus();
          return;
        }

        const founderData = new FormData();
        founderData.append('access_key', form.querySelector('input[name="access_key"]').value);
        founderData.append('subject', 'WhatsApp-Kanal Link (Gründerin)');
        founderData.append('WhatsApp_Kanal', founderLink.value.trim());

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: founderData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            form.style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
            setTimeout(() => {
              form.reset();
              updateFounderMode();
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
        return;
      }

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

